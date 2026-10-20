"""Check that no text escapes its box on phones, on every exported page.

Run after building and exporting, with the same local server as browser-smoke.py:
    python tests/mobile-fit.py
For every visible button, link, label, card, tile, chip, pin and form field the test
measures the text it holds and fails when that text reaches past the element's own
edges, when anything scrolls the page sideways, or when a tap target is smaller than
44 by 44 pixels. It runs at six phone widths, and once more at 390 px with the text
size doubled in the browser settings (200%).
Set PARDUS_QA_BASE and PARDUS_QA_CHROMIUM as for browser-smoke.py; set PARDUS_QA_ROUTES
to a comma-separated list of pages to check only those.
"""

from pathlib import Path
import os
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright


BASE = os.environ.get("PARDUS_QA_BASE", "http://127.0.0.1:4180/paradise").rstrip("/") + "/"
EXPORT = Path(__file__).resolve().parents[2]
ROUTES = [r for r in os.environ.get("PARDUS_QA_ROUTES", "").split(",") if r] or sorted(p.name for p in EXPORT.glob("*.html"))
PHONES = [(320, 640), (360, 740), (375, 667), (390, 844), (412, 915), (430, 932)]
INTRO_KEY = "pardus-intro-v30"

# Elements whose text must stay inside them. Plain paragraphs wrap on their own and are covered by the sideways-scroll check.
BOXES = ".btn, button, a, label, input, select, textarea, summary, [class*='tile'], [class*='chip'], [class*='card'], [class*='pill'], [class*='tag'], [class*='badge'], .price, .spot-label, .eyebrow"
TARGETS = ".btn, button, input:not([type=hidden]), select, textarea, summary, .site-header a, .menu a, .site-footer a, [role=tab]"

FIND = """([boxes, targets]) => {
  const vw = document.documentElement.clientWidth, problems = [];
  const visible = el => {
    if (el.closest('[hidden], [aria-hidden="true"], .sr-only, .visually-hidden, .skip-link, .intro')) return false;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false;
    // Text kept for screen readers only (a 1 px clipped box) is not seen, so it cannot spill.
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const name = el => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 3).join('.') : '')) + ' "' + (el.innerText || el.value || '').trim().replace(/\\s+/g, ' ').slice(0, 40) + '"';
  for (const el of document.querySelectorAll(boxes)) {
    if (!visible(el)) continue;
    const box = el.getBoundingClientRect();
    if (box.left < -1 || box.right > vw + 1) {
      // Rows that scroll sideways on purpose (carousels) may hold cards past the edge.
      let p = el.parentElement, scrolls = false;
      while (p) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { scrolls = true; break; } p = p.parentElement; }
      if (!scrolls) problems.push(`${name(el)} sits outside the screen (${Math.round(box.left)} to ${Math.round(box.right)} of ${vw})`);
    }
    // A pin is a 44 px dot whose label opens beside it; the label is checked on its own.
    if (el.matches('input, select, textarea, .spot')) continue;
    // A button's arrow must stay inside its pill too (a long label used to push it out of sight).
    if (el.matches('.btn')) for (const part of el.querySelectorAll('svg')) {
      const r = part.getBoundingClientRect();
      if (visible(part) && (r.left < box.left - 1 || r.right > box.right + 1)) problems.push(`${name(el)} pushes its arrow out of the button`);
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || !visible(node.parentElement)) continue;
      // Text inside a nested box is checked against that box instead.
      if (node.parentElement !== el && node.parentElement.closest(boxes) !== el) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width < 1) continue;
        if (r.left < box.left - 1.5 || r.right > box.right + 1.5 || r.top < box.top - 2 || r.bottom > box.bottom + 2) {
          problems.push(`${name(el)} text spills out (text ${Math.round(r.left)}-${Math.round(r.right)} x ${Math.round(r.top)}-${Math.round(r.bottom)}, box ${Math.round(box.left)}-${Math.round(box.right)} x ${Math.round(box.top)}-${Math.round(box.bottom)})`);
          break;
        }
      }
    }
  }
  for (const el of document.querySelectorAll(targets)) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (el.matches('input[type=checkbox], input[type=radio]')) continue;
    if (r.width < 43.5 || r.height < 43.5) problems.push(`${name(el)} is a small tap target (${Math.round(r.width)} x ${Math.round(r.height)})`);
  }
  const page = document.documentElement;
  if (page.scrollWidth > page.clientWidth + 1) {
    // Name the innermost elements that reach past the right edge, so the cause is easy to find.
    const past = el => el.getBoundingClientRect().right > vw + 1;
    const wide = [...document.body.querySelectorAll('*')].filter(el => past(el) && visible(el) && ![...el.children].some(past));
    problems.push(`page scrolls sideways (${page.scrollWidth} > ${page.clientWidth}) because of ${wide.slice(0, 4).map(name).join(', ')}`);
  }
  return [...new Set(problems)];
}"""


def open_page(context, route):
    page = context.new_page()
    page.goto(urljoin(BASE, route), wait_until="networkidle", timeout=45000)
    page.wait_for_function("document.documentElement.classList.contains('js') && !document.documentElement.classList.contains('intro-active')", timeout=15000)
    # Show everything that fades in on scroll, so it is measured at rest.
    page.evaluate("""async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      scrollTo(0, 0);
    }""")
    page.add_style_tag(content="*, *::before, *::after { transition: none !important; animation-play-state: paused !important; } .reveal, [data-reveal] { opacity: 1 !important; transform: none !important; }")
    page.wait_for_timeout(120)
    return page


def main():
    failures = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("PARDUS_QA_CHROMIUM") or None)
        runs = [(w, h, 1) for w, h in PHONES] + [(390, 844, 2)]
        for width, height, zoom in runs:
            context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=2, is_mobile=True, has_touch=True)
            context.add_init_script(f"try {{ sessionStorage.setItem('{INTRO_KEY}', 'seen'); }} catch (e) {{}}")
            if zoom != 1:
                # Browser text size setting: scale the root font size, as Chrome's "Text scaling" and iOS Dynamic Type do for rem-based pages.
                context.add_init_script(f"document.addEventListener('DOMContentLoaded', () => {{ document.documentElement.style.fontSize = '{zoom * 100}%'; }});")
            for route in ROUTES:
                page = open_page(context, route)
                for problem in page.evaluate(FIND, [BOXES, TARGETS]):
                    failures.append(f"{route} @ {width}px{' text x' + str(zoom) if zoom != 1 else ''}: {problem}")
                page.close()
            context.close()
        browser.close()
    if failures:
        print("\n".join(failures))
        raise SystemExit(f"Mobile fit failed: {len(failures)} problems.")
    print(f"Mobile fit passed: {len(ROUTES)} pages at {len(PHONES)} phone widths and at 200% text size.")


if __name__ == "__main__":
    main()
