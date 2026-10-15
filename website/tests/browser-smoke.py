"""Smoke-test the exported Pardus V30 website with Python Playwright.

Run after building, exporting and starting a local static server:
    python tests/browser-smoke.py
Set PARDUS_QA_BASE to test another served export (including GitHub Pages).
Set PARDUS_QA_PHASES to a comma-separated subset: matrix,preloader,leopard,pins,life,phone,picker,stage,hero,flows,fallback.
Set PARDUS_QA_CHROMIUM to a Chromium executable when Playwright's own browser is not installed.
HTML routes are discovered from the repository export. Screenshots and persistent
artifacts are not written. Form submissions are intercepted inside the test.
The optional remote news response uses the shipped feed for repeatable checks;
network failure is exercised separately. This is not a live-source availability test.
"""

from datetime import date, timedelta
from pathlib import Path
import json
import os
import re
from urllib.parse import parse_qs, urljoin, urlparse

from playwright.sync_api import expect, sync_playwright


BASE = os.environ.get("PARDUS_QA_BASE", "http://127.0.0.1:4180/paradise").rstrip("/") + "/"
EXPORT = Path(__file__).resolve().parents[2]
ROUTES = sorted(path.name for path in EXPORT.glob("*.html"))
VIEWPORTS = [(320, 568), (390, 844), (768, 1024), (1024, 768), (1440, 900)]
PHASES = set(os.environ.get("PARDUS_QA_PHASES", "matrix,preloader,leopard,pins,life,phone,picker,stage,hero,flows,fallback").split(","))
FEED = json.loads((EXPORT / "website/public/travel-updates.json").read_text(encoding="utf-8"))
REMOTE_FEED = "https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json*"
LAYOUT_IMAGES = """() => [...document.images].filter(img =>
    img.getClientRects().length && getComputedStyle(img).visibility !== 'hidden')"""


INTRO_KEY = "pardus-intro-v30"


def context_for(browser, intro_seen=True, **options):
    context = browser.new_context(**options)
    context.route(REMOTE_FEED, lambda route: route.fulfill(json=FEED))
    if intro_seen:
        # The preloader runs once per tab session; the rest of the suite starts after it.
        context.add_init_script(f"try {{ sessionStorage.setItem('{INTRO_KEY}', 'seen'); }} catch (e) {{}}")
    return context


def navigate(page, route="index.html", interactive=True, wait_intro=True):
    response = page.goto(urljoin(BASE, route), wait_until="networkidle", timeout=45000)
    assert response and response.status < 400, f"Document failed: {route}"
    if interactive:
        page.wait_for_function("document.documentElement.classList.contains('js')", timeout=10000)
        if wait_intro:
            # The preloader runs on every page (quick version after the first); let it finish before the page is used.
            page.wait_for_function("!document.documentElement.classList.contains('intro-active')", timeout=15000)


def arrive(page, pattern):
    """After a link click: the curtains close, the next page loads, and its quick preloader finishes."""
    page.wait_for_url(re.compile(pattern), timeout=15000)
    page.wait_for_function("document.documentElement.classList.contains('js') && !document.documentElement.classList.contains('intro-active')", timeout=15000)


def assert_no_overflow(page, label):
    widths = page.evaluate("({page:document.documentElement.scrollWidth, viewport:document.documentElement.clientWidth})")
    assert widths["page"] <= widths["viewport"] + 1, f"Horizontal overflow on {label}: {widths}"


def scroll_and_check_images(page, label):
    """Visit each viewport so lazy images load, including images below the fold."""
    height = page.viewport_size["height"]
    position = 0
    # Read the height again after each scroll to account for late layout changes.
    for _ in range(100):
        page.evaluate("y => window.scrollTo({top:y, behavior:'instant'})", position)
        page.wait_for_timeout(60)
        assert_no_overflow(page, label)
        end = page.evaluate("Math.max(0,document.documentElement.scrollHeight-innerHeight)")
        if position >= end:
            break
        position = min(end, position + max(240, int(height * .85)))
    else:
        raise AssertionError(f"Page never reached its end: {label}")
    # Hidden tabs are checked when activated in the keyboard interaction test.
    page.wait_for_function(
        f"() => ({LAYOUT_IMAGES})().every(img => img.complete)", timeout=12000
    )
    broken = page.evaluate(f"() => ({LAYOUT_IMAGES})().filter(img => !img.naturalWidth).map(img => img.currentSrc || img.src)")
    assert not broken, f"Broken or unloaded images on {label}: {broken}"
    page.evaluate("window.scrollTo({top:0, behavior:'instant'})")
    page.wait_for_timeout(80)


def route_matrix(browser):
    assert ROUTES, f"No exported HTML routes found in {EXPORT}; build and export first."
    for width, height in VIEWPORTS:
        context = context_for(browser, viewport={"width": width, "height": height})
        page = context.new_page()
        failures = []
        page.on("pageerror", lambda error: failures.append(f"JavaScript: {error}"))
        page.on("console", lambda message: failures.append(f"Console: {message.text}") if message.type == "error" else None)
        page.on("response", lambda response: failures.append(f"HTTP {response.status}: {response.url}") if response.status >= 400 else None)
        page.on("requestfailed", lambda request: failures.append(f"Request failed: {request.url} ({request.failure})"))
        for route in ROUTES:
            failures.clear()
            label = f"{route} at {width}x{height}"
            navigate(page, route)
            expect(page.locator("main h1")).to_be_visible()
            assert page.title().strip(), f"Missing page title: {label}"
            scroll_and_check_images(page, label)
            assert not failures, f"Page failures on {label}: {failures}"
        context.close()
        print(f"PASS {len(ROUTES)} routes at {width}x{height}, including lazy images and runtime/resource failures", flush=True)


def preloader(browser):
    """HARD RULE: the preloader is permanent and runs on every page. Full on the first page of a visit, quick afterwards."""
    context = context_for(browser, intro_seen=False, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    # A first visit on a page that is not the homepage still gets the full sequence.
    page.goto(urljoin(BASE, "cruises.html"), wait_until="load", timeout=45000)
    intro = page.locator("[data-pardus-intro]")
    expect(page.locator("html")).to_have_class(re.compile(r"\bintro-full\b"))
    expect(page.locator("html")).to_have_class(re.compile(r"\bintro-active\b"))
    expect(intro).to_be_visible()
    expect(intro.get_by_text("Beautifully arranged.")).to_be_visible()
    skip = page.get_by_role("button", name=re.compile("Skip introduction"))
    expect(skip).to_be_visible()
    expect(skip).to_be_focused()
    assert page.locator("[data-pardus-shell]").get_attribute("inert") is not None
    skip.click()
    expect(page.locator("html")).not_to_have_class(re.compile(r"\bintro-active\b"))
    expect(page.locator("main h1")).to_be_visible()
    assert page.evaluate(f"sessionStorage.getItem('{INTRO_KEY}')") == "seen"
    # Clicking an internal link closes the curtains, then the next page opens with the quick version.
    page.locator('.desktop-nav a[href$="destinations.html"]').click()
    expect(page.locator("html")).to_have_class(re.compile(r"\bintro-leaving\b"))
    page.wait_for_url(re.compile(r"destinations\.html$"))
    expect(page.locator("html")).to_have_class(re.compile(r"\bintro-quick\b"))
    expect(page.locator("[data-pardus-intro]")).to_be_visible()
    expect(page.locator(".intro-label")).to_have_text("Destinations")
    expect(page.locator("html")).not_to_have_class(re.compile(r"\bintro-active\b"), timeout=6000)
    # In-page links and modified clicks are left alone.
    navigate(page, "index.html")
    page.locator('a[href="#destinations"]').first.click()
    assert "intro-leaving" not in page.evaluate("document.documentElement.className")
    # The back/forward cache never shows a closed page.
    page.go_back()
    page.wait_for_function("!document.documentElement.classList.contains('intro-active') && !document.documentElement.classList.contains('intro-leaving')", timeout=9000)
    context.close()

    # Every exported page ships the preloader and the quick version runs on all of them.
    context = context_for(browser, intro_seen=True, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    for route in ROUTES:
        page.goto(urljoin(BASE, route), wait_until="commit")
        page.wait_for_function("document.documentElement.classList.contains('intro-active') || document.documentElement.classList.contains('is-ready')", timeout=10000)
        assert page.locator("[data-pardus-intro]").count() == 1, f"{route} is missing the preloader"
        assert page.locator("[data-skip-intro]").count() == 1, f"{route} is missing Skip introduction"
        page.wait_for_function("!document.documentElement.classList.contains('intro-active')", timeout=15000)
    context.close()

    # Escape releases the visitor; the full sequence also ends on its own without any input.
    context = context_for(browser, intro_seen=False, viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.goto(urljoin(BASE, "index.html"), wait_until="load", timeout=45000)
    expect(page.locator("[data-pardus-intro]")).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.locator("html")).not_to_have_class(re.compile(r"\bintro-active\b"))
    context.close()
    context = context_for(browser, intro_seen=False, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(urljoin(BASE, "journal.html"), wait_until="load", timeout=45000)
    expect(page.locator("[data-pardus-intro]")).to_be_visible()
    expect(page.locator("html")).not_to_have_class(re.compile(r"\bintro-active\b"), timeout=9000)
    context.close()

    # Reduced motion keeps the preloader as a still brand screen, then releases the page on its own.
    context = context_for(browser, intro_seen=False, viewport={"width": 1280, "height": 720}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(urljoin(BASE, "index.html"), wait_until="load", timeout=45000)
    expect(page.locator("[data-pardus-intro]")).to_be_visible()
    expect(page.locator("html")).not_to_have_class(re.compile(r"\bintro-active\b"), timeout=6000)
    context.close()
    print("PASS preloader: every page, full on first visit, quick afterwards with the page name, curtains close on leaving, Skip, Escape, back/forward cache, reduced motion", flush=True)


def leopard_clear(browser):
    """No hero text, button, price rail or header control may overlap the leopard, at any screen size."""
    sizes = [(320, 568), (360, 640), (390, 844), (430, 932), (600, 900), (768, 1024), (820, 1180), (1024, 1366), (900, 900), (1000, 900),
             (1024, 768), (1100, 700), (1280, 720), (1366, 768), (1440, 900), (1536, 864), (1920, 1080), (2560, 1080), (2560, 1440)]
    probe = """() => {
      const rect = e => { const b = e.getBoundingClientRect(); return {l: b.left, t: b.top, r: b.right, b: b.bottom}; };
      const box = rect(document.querySelector('[data-leopard-box]'));
      const items = [];
      const copy = document.querySelector('[data-hero-copy]');
      const range = document.createRange();
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) { if (!n.textContent.trim()) continue; range.selectNodeContents(n); for (const b of range.getClientRects()) if (b.width > 1) items.push({label: 'text', l: b.left, t: b.top, r: b.right, b: b.bottom}); }
      copy.querySelectorAll('.btn').forEach(e => items.push({label: 'button', ...rect(e)}));
      items.push({label: 'price rail', ...rect(document.querySelector('[data-hero-rail]'))});
      document.querySelectorAll('.spot').forEach(spot => { if (getComputedStyle(spot).display !== 'none') { items.push({label: 'pin ' + spot.dataset.spot, ...rect(spot)}); items.push({label: 'pin label ' + spot.dataset.spot, ...rect(spot.querySelector('.spot-label'))}); } });
      document.querySelectorAll('.site-header .brand-link, .site-header .desktop-nav a, .site-header .header-tools > *').forEach(e => { if (e.offsetParent !== null) items.push({label: 'header', ...rect(e)}); });
      const margin = 10;
      const hits = items.filter(i => i.l < box.r + margin && i.r > box.l - margin && i.t < box.b + margin && i.b > box.t - margin).map(i => i.label);
      const glow = document.querySelector('.hl-glow--l').getBoundingClientRect();
      const eyeY = glow.top + glow.height / 2;
      return {hits, eyesOnScreen: eyeY > 0 && eyeY < innerHeight};
    }"""
    for reduced in ("reduce", "no-preference"):
        context = context_for(browser, reduced_motion=reduced, viewport={"width": 1440, "height": 900})
        page = context.new_page()
        for width, height in sizes:
            page.set_viewport_size({"width": width, "height": height})
            navigate(page)
            page.wait_for_timeout(900 if reduced == "reduce" else 2400)
            # The animal turns its head and breathes: also test it at the extremes of its gaze, with the animation held still.
            poses = [(0, 0)] if reduced == "reduce" else [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1), (1, -1), (-1, 1)]
            if reduced != "reduce":
                page.evaluate("document.documentElement.classList.add('motion-paused')")
            for gx, gy in poses:
                page.evaluate("([gx, gy]) => { const p = document.querySelector('.hero-picture'); p.style.setProperty('--gx', gx); p.style.setProperty('--gy', gy); }", [gx, gy])
                page.wait_for_timeout(0 if reduced == "reduce" else 260)
                result = page.evaluate(probe)
                assert not result["hits"], f"Hero content covers the leopard at {width}x{height} ({reduced}, gaze {gx},{gy}): {result['hits']}"
                assert result["eyesOnScreen"], f"The leopard's eyes are not on the first screen at {width}x{height}"
        context.close()
    print(f"PASS the leopard is clear of every hero element at {len(sizes)} screen sizes, static and animated", flush=True)


def hero_pins(browser):
    """The pins on the picture (Dubai, Maldives, private yacht) never touch the copy, the chips, the buttons, the price bar,
    the header, the leopard or each other; they step aside when a screen has no room, and link to real pages."""
    sizes = [(320, 568), (360, 740), (390, 844), (430, 932), (768, 1024), (820, 1180), (1024, 768), (1100, 700), (1280, 720),
             (1366, 768), (1440, 900), (1536, 864), (1920, 1080), (2560, 1080)]
    probe = """() => {
      const hero = document.querySelector('[data-hero]');
      const rect = e => { const b = e.getBoundingClientRect(); return {l: b.left, t: b.top, r: b.right, b: b.bottom}; };
      const items = [];
      const copy = hero.querySelector('[data-hero-copy]');
      const range = document.createRange();
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) { if (!n.textContent.trim()) continue; range.selectNodeContents(n); for (const b of range.getClientRects()) if (b.width > 1) items.push({label: 'text', l: b.left, t: b.top, r: b.right, b: b.bottom}); }
      copy.querySelectorAll('.btn, .hero-services li').forEach(e => items.push({label: 'control', ...rect(e)}));
      items.push({label: 'price bar', ...rect(hero.querySelector('[data-hero-rail]'))});
      items.push({label: 'leopard', ...rect(hero.querySelector('[data-leopard-box]'))});
      document.querySelectorAll('.site-header .brand-link, .site-header .desktop-nav a, .site-header .header-tools > *').forEach(e => { if (e.offsetParent !== null) items.push({label: 'header', ...rect(e)}); });
      const meets = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      const shown = [...hero.querySelectorAll('.spot')].filter(s => getComputedStyle(s).display !== 'none');
      const hits = [];
      const placed = [];
      for (const spot of shown) {
        const label = spot.querySelector('.spot-label');
        label.style.transition = 'none';
        for (const [name, box] of [['pin', rect(spot)], ['label', rect(label)]]) {
          for (const item of items) if (meets(box, item)) hits.push(`${spot.dataset.spot} ${name} meets ${item.label}`);
          for (const other of placed) if (meets(box, other.box)) hits.push(`${spot.dataset.spot} ${name} meets ${other.name}`);
          if (box.l < 0 || box.r > innerWidth) hits.push(`${spot.dataset.spot} ${name} leaves the screen`);
        }
        placed.push({name: spot.dataset.spot + ' pin', box: rect(spot)}, {name: spot.dataset.spot + ' label', box: rect(label)});
      }
      return {hits, shown: shown.map(s => s.dataset.spot), links: shown.map(s => s.getAttribute('href'))};
    }"""
    results = {}
    for reduced in ("no-preference", "reduce"):
        context = context_for(browser, reduced_motion=reduced, viewport={"width": 1440, "height": 900})
        page = context.new_page()
        for width, height in sizes:
            page.set_viewport_size({"width": width, "height": height})
            navigate(page)
            page.wait_for_function("document.querySelector('[data-hero]').dataset.spots === 'ready'", timeout=10000)
            page.evaluate("document.documentElement.classList.add('motion-paused')")
            page.wait_for_timeout(200)
            result = page.evaluate(probe)
            assert not result["hits"], f"Hero pins collide at {width}x{height} ({reduced}): {result['hits']}"
            assert all(re.search(r"(destination-[a-z]+|cruises)\.html$", link) for link in result["links"]), result["links"]
            results[(width, height)] = result["shown"]
        context.close()
    # Where there is room, the pins are there: all three on common desktops, the Maldives flagship on phones.
    assert results[(1440, 900)] == ["maldives", "dubai", "yacht"], results[(1440, 900)]
    assert results[(1920, 1080)] == ["maldives", "dubai", "yacht"], results[(1920, 1080)]
    assert "maldives" in results[(390, 844)], results[(390, 844)]
    print(f"PASS hero pins at {len(sizes)} screen sizes: never touch the copy, buttons, price bar, header, leopard or each other; all three on desktops, Maldives on phones", flush=True)


def leopard_alive(browser):
    """The leopard is animated: it breathes, its eyes glow, it turns toward the pointer and a finger, and it stills for reduced motion."""
    context = context_for(browser, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    navigate(page)
    page.wait_for_timeout(2600)
    expect(page.locator("[data-hero-life]")).to_have_attribute("data-life", "running")
    assert page.locator(".hl-breath").evaluate("el => getComputedStyle(el).animationName") == "hl-breathe"
    assert page.locator(".hl-glow--l").evaluate("el => parseFloat(getComputedStyle(el).opacity)") > 0.1
    assert page.locator(".hl-eyes img").evaluate("img => img.complete && img.naturalWidth > 0")
    # The blink patch sits over the eyes, not over the whole face.
    box = page.evaluate("() => { const e = document.querySelector('.hl-eyes').getBoundingClientRect(), l = document.querySelector('.hl-leopard').getBoundingClientRect(); return {w: e.width / l.width, h: e.height / l.height}; }")
    assert 0.3 < box["w"] < 0.6 and 0.05 < box["h"] < 0.2, box
    # Gaze follows the pointer in both directions.
    page.mouse.move(120, 450)
    for step in range(12):
        page.mouse.move(120 + step, 450)
        page.wait_for_timeout(40)
    page.wait_for_timeout(700)
    left = float(page.evaluate("document.querySelector('.hero-picture').style.getPropertyValue('--gx')"))
    for step in range(12):
        page.mouse.move(1380 - step, 450)
        page.wait_for_timeout(40)
    page.wait_for_timeout(700)
    right = float(page.evaluate("document.querySelector('.hero-picture').style.getPropertyValue('--gx')"))
    assert left < -0.3 and right > 0.3, (left, right)
    # Pausing stops every continuous effect and the script loop.
    page.locator("[data-scene-motion]").click()
    page.wait_for_timeout(300)
    expect(page.locator("[data-hero-life]")).to_have_attribute("data-life", "paused")
    assert page.locator(".hl-rim").evaluate("el => getComputedStyle(el, '::before').animationPlayState") == "paused"
    assert not errors, errors
    context.close()

    # Reduced motion: a complete, still picture. No loop, no breathing, no extras.
    context = context_for(browser, viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = context.new_page()
    navigate(page)
    page.wait_for_timeout(700)
    expect(page.locator("[data-hero-life]")).to_have_attribute("data-life", "still")
    assert page.locator(".hl-breath").evaluate("el => getComputedStyle(el).animationName") == "none"
    assert page.locator(".hl-motes").evaluate("el => getComputedStyle(el).display") == "none"
    expect(page.locator(".hl-body img")).to_be_visible()
    context.close()

    # A finger turns the head too, and tapping the animal wakes it.
    context = context_for(browser, viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page = context.new_page()
    navigate(page)
    page.wait_for_timeout(2400)
    before = float(page.evaluate("document.querySelector('.hero-picture').style.getPropertyValue('--gx') || 0"))
    page.evaluate("""() => { const hero = document.querySelector('[data-hero-life]'); const point = (x, y) => new Touch({identifier: 1, target: hero, clientX: x, clientY: y});
        for (const x of [60, 70, 80, 90]) hero.dispatchEvent(new TouchEvent('touchmove', {touches: [point(x, 400)], bubbles: true})); }""")
    page.wait_for_timeout(900)
    after = float(page.evaluate("document.querySelector('.hero-picture').style.getPropertyValue('--gx')"))
    assert after < before - 0.2, (before, after)
    context.close()
    print("PASS the leopard is alive: it breathes, its eyes glow, it follows the pointer and a finger, pauses on request and is a still picture for reduced motion", flush=True)


def phone_first_screen(browser):
    """On phones the first screen holds the whole offer: headline, leopard, three priced destinations and both buttons."""
    for width, height in [(390, 844), (412, 915), (430, 932), (360, 800)]:
        context = context_for(browser, viewport={"width": width, "height": height}, has_touch=True, is_mobile=True)
        page = context.new_page()
        navigate(page)
        page.wait_for_timeout(2200)
        fit = page.evaluate("""() => {
          const inside = e => { const b = e.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight + 1 && b.left >= -1 && b.right <= innerWidth + 1; };
          return {
            h1: inside(document.querySelector('.hero h1')),
            tiles: [...document.querySelectorAll('.hero-offers a')].map(inside),
            buttons: [...document.querySelectorAll('.hero .actions .btn')].map(inside),
            leopard: inside(document.querySelector('[data-leopard-box]')) || document.querySelector('[data-leopard-box]').getBoundingClientRect().top < innerHeight - 100,
            wraps: [...document.querySelectorAll('.hero .actions .btn')].map(b => b.getBoundingClientRect().height),
          };
        }""")
        assert fit["h1"] and all(fit["tiles"]) and all(fit["buttons"]) and fit["leopard"], (width, height, fit)
        assert all(value < 70 for value in fit["wraps"]), (width, height, fit)  # a one-line button, never two
        context.close()
    # The text on each phone price tile stays inside its card with room to spare (iPhone Safari draws a little wider).
    for width in [320, 360, 390, 430]:
        context = context_for(browser, viewport={"width": width, "height": 844}, has_touch=True, is_mobile=True)
        page = context.new_page()
        navigate(page)
        page.wait_for_timeout(2400)
        tight = page.evaluate("""() => [...document.querySelectorAll('.hero-offers a')].flatMap(card => {
          const box = card.getBoundingClientRect(), cs = getComputedStyle(card);
          const left = box.left + parseFloat(cs.paddingLeft), right = box.right - parseFloat(cs.paddingRight);
          const room = (right - left) * 0.08, out = [], range = document.createRange();
          const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
          for (let n; (n = walker.nextNode());) { if (!n.textContent.trim()) continue; range.selectNodeContents(n);
            for (const b of range.getClientRects()) if (b.right > right - room || b.left < left - 1) out.push(n.textContent.trim()); }
          return out; })""")
        assert not tight, f"Price tile text is too tight or escapes its card at {width}px: {tight}"
        context.close()
    # The floating button: out of the way over the hero, the picker and the enquiry; there in between.
    context = context_for(browser, viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page = context.new_page()
    navigate(page)
    page.wait_for_timeout(1500)
    cta = page.locator("[data-sticky-cta]")
    expect(cta).to_have_attribute("data-on", "false")
    page.evaluate("window.scrollTo({top: 1100, behavior: 'instant'})")
    expect(cta).to_have_attribute("data-on", "true")
    page.evaluate("document.querySelector('.picker').scrollIntoView({block: 'center'})")
    expect(cta).to_have_attribute("data-on", "false")
    page.evaluate("document.querySelector('#enquire').scrollIntoView()")
    expect(cta).to_have_attribute("data-on", "false")
    page.evaluate("window.scrollTo({top: 1100, behavior: 'instant'})")
    expect(cta).to_have_attribute("data-on", "true")
    with page.expect_navigation():
        cta.click()
    assert page.url.endswith("journey.html"), page.url
    context.close()
    print("PASS phone first screen holds the headline, leopard, three prices and both buttons on four phone sizes; tile text keeps 8% spare room in its card; the floating button appears only where it helps", flush=True)


def service_picker(browser):
    """\"You choose where. We arrange the rest.\": 13 tappable services whose choices carry into the enquiry, with and without JavaScript."""
    context = context_for(browser, viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    navigate(page)
    picker = page.locator("[data-picker]")
    assert picker.locator('input[name="services"]').count() == 13
    page.evaluate("document.querySelector('.picker').scrollIntoView()")
    summary = page.locator("[data-picker-summary]")
    expect(summary).to_contain_text("Tap to choose")
    for label in ["Flights", "Luxury hotels & resorts", "Honeymoons"]:
        picker.locator(".pick", has_text=label).tap()
    expect(summary).to_contain_text("3 selected")
    expect(summary).to_contain_text("Flights, Hotels, Honeymoons")
    expect(picker.locator('input[name="services"]:checked')).to_have_count(3)
    for box in picker.locator(".pick").all():
        size = box.bounding_box()
        assert size["height"] >= 56 and size["width"] >= 120, size  # generous tap targets
    picker.locator(".pick", has_text="Honeymoons").tap()
    expect(summary).to_contain_text("2 selected")
    picker.get_by_role("button", name="Clear").tap()
    expect(summary).to_contain_text("Tap to choose")
    picker.locator(".pick", has_text="Visa guidance").tap()
    picker.locator(".pick", has_text="Boat & yacht cruises").tap()
    with page.expect_navigation():
        picker.get_by_role("button", name="Plan my escape").tap()
    navigate(page, page.url.replace(BASE, ""), wait_intro=True)
    query = parse_qs(urlparse(page.url).query)
    assert query["services"] == ["Visa guidance", "Boat & yacht cruises"], query
    expect(page.locator('[name="notes"]')).to_have_value("I would like Pardus to arrange: Visa guidance, Boat & yacht cruises.")
    assert not errors, errors
    context.close()

    # Without JavaScript it is still a form that sends the ticked services to the enquiry page.
    context = context_for(browser, viewport={"width": 390, "height": 844}, java_script_enabled=False)
    page = context.new_page()
    page.goto(urljoin(BASE, "index.html"), wait_until="load")
    page.locator(".pick", has_text="Safaris").click()
    page.locator(".pick", has_text="Private transfers").click()
    with page.expect_navigation():
        page.locator(".picker-go").click()
    assert parse_qs(urlparse(page.url).query)["services"] == ["Private transfers", "Safaris"], page.url
    context.close()
    print("PASS service picker: 13 tappable services, live summary, clear, generous tap targets, choices carried into the enquiry, works without JavaScript", flush=True)



def escape_stage(browser):
    """\"Your next escape\": a pinned stage on large screens, stacked chapters on phones, tablets and reduced motion."""
    context = context_for(browser, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    navigate(page)
    expect(page.locator("html")).to_have_class(re.compile(r"\bstage-ready\b"))
    info = page.evaluate("""() => { const t = document.querySelector('[data-escape-track]'), s = document.querySelector('[data-escape-stage]'); const r = t.getBoundingClientRect(); return {top: scrollY + r.top, total: r.height - s.offsetHeight, header: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))}; }""")
    for index, fraction in enumerate([0.12, 0.5, 0.9]):
        page.evaluate("y => window.scrollTo({top: y, behavior: 'instant'})", info["top"] - info["header"] + fraction * info["total"])
        page.wait_for_timeout(500)
        expect(page.locator("[data-escape-stage]")).to_have_attribute("data-active", str(index))
        expect(page.locator(f'.scene[data-scene="{index}"]')).to_have_attribute("data-state", "active")
        expect(page.locator(f'.scene[data-scene="{index}"] .scene-panel')).to_be_visible()
        expect(page.locator(f'.scene[data-scene="{index}"] h3')).to_be_visible()
        expect(page.locator(f'[data-escape-go="{index}"]')).to_have_attribute("aria-current", "true")
        # The outgoing panel hides once its exit transition (0.5 s) ends.
        expect(page.locator(".scene .scene-panel:visible")).to_have_count(1)
    page.locator('[data-escape-go="0"]').click()
    expect(page.locator("[data-escape-stage]")).to_have_attribute("data-active", "0", timeout=6000)
    context.close()
    for options in ({"viewport": {"width": 390, "height": 844}}, {"viewport": {"width": 820, "height": 1180}}, {"viewport": {"width": 1440, "height": 900}, "reduced_motion": "reduce"}):
        context = context_for(browser, **options)
        page = context.new_page()
        navigate(page)
        assert "stage-ready" not in page.evaluate("document.documentElement.className"), options
        page.evaluate("document.querySelector('[data-escapes]').scrollIntoView()")
        page.wait_for_timeout(300)
        assert page.locator(".scene").count() == 3
        for index in range(3):
            page.locator(f'.scene[data-scene="{index}"]').scroll_into_view_if_needed()
            page.wait_for_timeout(900)
            expect(page.locator(f'.scene[data-scene="{index}"] .scene-panel')).to_be_visible()
            expect(page.locator(f'.scene[data-scene="{index}"] .price')).to_be_visible()
        assert_no_overflow(page, f"escape chapters {options}")
        context.close()
    print("PASS escape stage: scroll picks the scene, tabs jump to it, and phones, tablets and reduced motion get stacked chapters", flush=True)


def assert_hero(page, width):
    hero = page.locator("[data-hero]")
    expect(hero).to_be_visible()
    expect(page.locator("body")).to_have_attribute("data-pardus-version", "30")
    assert " ".join(hero.locator("h1").inner_text().split()) == "Luxury travel, beautifully arranged."
    expect(hero.get_by_role("link", name="Explore destinations", exact=True)).to_have_attribute("href", "#destinations")
    expect(hero.get_by_role("link", name="Plan your escape", exact=True)).to_have_attribute("href", re.compile(r"journey\.html$"))
    expect(page.locator(".site-header .brand-link svg").first).to_be_visible()
    source = page.locator(".hl-world img").evaluate("img => img.currentSrc")
    portrait = page.evaluate("innerWidth <= 760 || innerWidth / innerHeight <= 1.1")
    assert ("pardus-world-mobile-v30" if portrait else "pardus-world-desktop-v30") in source, source
    assert "pardus-leopard-v30" in page.locator(".hl-body img").evaluate("img => img.currentSrc")
    assert page.locator(".hl-body img").evaluate("img => img.complete && img.naturalWidth > 0")
    rates = page.locator(".hero-offers a")
    assert rates.count() == 3
    text = rates.all_inner_texts()
    assert all("USD" in item for item in text), text
    assert_no_overflow(page, f"hero at {width}")


def hero_and_menu(browser):
    for width, height in [(1440, 900), (390, 844), (320, 568), (768, 1024)]:
        context = context_for(browser, viewport={"width": width, "height": height})
        page = context.new_page()
        navigate(page)
        assert_hero(page, width)
        context.close()

    context = context_for(browser, viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page = context.new_page()
    navigate(page, "destinations.html")
    toggle = page.locator(".menu-toggle")
    menu = page.locator("#mobile-menu")
    expect(toggle).to_be_visible()
    expect(toggle).to_have_attribute("aria-expanded", "false")
    expect(page.locator(".desktop-nav")).to_be_hidden()
    toggle.tap()
    expect(menu).to_have_js_property("open", True)
    expect(toggle).to_have_attribute("aria-expanded", "true")
    expect(page.locator("html")).to_have_class(re.compile(r"\bmenu-open\b"))
    assert page.evaluate("getComputedStyle(document.documentElement).overflow") == "hidden"
    links = menu.locator(".menu-nav a")
    assert links.count() == 4
    expect(menu.locator('.menu-nav a[aria-current="page"]')).to_contain_text("Destinations")
    assert menu.locator(".menu-nav .icon-pin, .menu-nav svg").count() >= 4  # symbols, not emoji
    for box in links.all():
        size = box.bounding_box()
        assert size["height"] >= 48, size
    assert_no_overflow(page, "open mobile menu")
    page.keyboard.press("Escape")
    expect(menu).to_have_js_property("open", False)
    expect(toggle).to_be_focused()
    toggle.tap()
    menu.locator(".menu-close").tap()
    expect(menu).to_have_js_property("open", False)
    toggle.tap()
    menu.locator('.menu-nav a[href$="cruises.html"]').tap()
    page.wait_for_url(re.compile(r"cruises\.html$"))
    context.close()

    # The menu closes by itself if the window grows to the desktop layout.
    context = context_for(browser, viewport={"width": 800, "height": 900})
    page = context.new_page()
    navigate(page)
    page.locator(".menu-toggle").click()
    expect(page.locator("#mobile-menu")).to_have_js_property("open", True)
    page.set_viewport_size({"width": 1280, "height": 900})
    expect(page.locator("#mobile-menu")).to_have_js_property("open", False)
    expect(page.locator(".desktop-nav")).to_be_visible()
    context.close()

    # Saved motion preference and the pause control.
    context = context_for(browser, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    navigate(page)
    control = page.locator("[data-scene-motion]")
    expect(control).to_be_visible()
    expect(control).to_have_attribute("aria-pressed", "false")
    control.click()
    expect(page.locator("html")).to_have_class(re.compile(r"\bmotion-paused\b"))
    expect(control).to_have_accessible_name("Resume background animation")
    assert page.locator(".hero-drift").evaluate("el => getComputedStyle(el).animationPlayState") == "paused"
    assert page.locator(".hl-breath").evaluate("el => getComputedStyle(el).animationPlayState") == "paused"
    navigate(page)
    expect(page.locator("html")).to_have_class(re.compile(r"\bmotion-paused\b"))
    page.locator("[data-scene-motion]").click()
    expect(page.locator("html")).not_to_have_class(re.compile(r"\bmotion-paused\b"))
    context.close()

    # No emoji anywhere in the rendered text of the main pages.
    emoji = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF\u2B50\u2B06\u2B07\u2190-\u21FF]")
    context = context_for(browser, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    for route in ROUTES:
        navigate(page, route)
        found = emoji.findall(page.evaluate("document.body.innerText"))
        assert not found, f"Emoji or glyph icons found on {route}: {found}"
    context.close()
    print("PASS V30 hero (copy, V25 artwork, prices, actions), mobile menu (open, symbols, Escape, close, navigate, desktop resize), pause preference and no emoji on any page", flush=True)


def filters_and_planner(browser):
    context = context_for(browser, viewport={"width": 1440, "height": 900}, accept_downloads=True)
    intercepted = []

    def prevent_submission(route):
        if route.request.method not in ("GET", "HEAD", "OPTIONS"):
            intercepted.append(route.request.url)
            route.fulfill(status=503, content_type="application/json", body='{"error":"Smoke test: external delivery disabled"}')
        else:
            route.continue_()

    # The planner test always produces a local download; it never sends traveller data.
    context.route(re.compile(r"^https?://"), prevent_submission)
    page = context.new_page()
    runtime_errors = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    navigate(page, "journal.html")
    initial_count = page.locator("[data-story]").count()
    page.locator('[data-journal-topic="Process"]').click()
    assert page.locator("[data-story]:visible").count() > 0
    assert page.locator("[data-story]:visible").evaluate_all("stories => stories.every(story => story.dataset.topic === 'Process')")
    page.locator("[data-journal-search]").fill("zz-no-pardus-story-match-zz")
    expect(page.locator("[data-journal-empty]")).to_be_visible()
    page.locator("[data-journal-reset]").click()
    assert page.locator("[data-story]:visible").count() == initial_count
    page.locator("[data-journal-search]").fill("safari")
    assert page.locator("[data-story]:visible").count() > 0
    assert page.locator("[data-story]:visible").evaluate_all("stories => stories.every(story => story.dataset.search.includes('safari'))")
    navigate(page, "journeys.html")
    page.locator('[data-journey-filter="business"]').click()
    assert page.locator("[data-journey-card]:visible").count() > 0
    assert page.locator("[data-journey-card]:visible").evaluate_all("cards => cards.every(card => card.dataset.reason === 'business')")
    page.locator('[data-journey-filter="all"]').click()
    saves = page.locator("[data-folio-save]")
    assert saves.count() >= 4
    saves.first.click()
    expect(saves.first).to_have_attribute("aria-pressed", "true")
    saves.first.click()
    expect(saves.first).to_have_attribute("aria-pressed", "false")
    for index in range(4):
        saves.nth(index).click()
    labels = page.evaluate("JSON.parse(localStorage.getItem('pardus-folio-v2')).items.map(item => item.label)")
    assert len(labels) == 4
    navigate(page, "destinations.html")
    all_destinations = page.locator(".card").count()
    for category in ["islands", "wild", "culture"]:
        page.locator(f'[data-filter="{category}"]').click()
        visible = page.locator(".card:visible")
        assert visible.count() > 0
        assert visible.evaluate_all("cards => cards.every(card => !card.hidden && card.dataset.category === '" + category + "')")
        expect(page.locator(f'[data-filter="{category}"]')).to_have_attribute("aria-pressed", "true")
    page.locator('[data-filter="all"]').click()
    assert page.locator(".card:visible").count() == all_destinations
    page.locator(".header-saved").click()
    panel = page.locator("#pardus-folio")
    expect(panel).to_have_js_property("open", True)
    href = page.locator("[data-folio-plan]").get_attribute("href")
    page.keyboard.press("Escape")
    expect(page.locator(".header-saved")).to_be_focused()
    navigate(page, href)
    assert all(label in page.locator('[name="saved"]').input_value() for label in labels)
    expect(page.locator("[data-saved-inspiration]")).to_be_visible()
    page.locator("[data-next]").click()
    date_input = page.locator('[name="date"]')
    minimum = date.fromisoformat(date_input.get_attribute("min"))
    date_input.fill((minimum - timedelta(days=1)).isoformat())
    page.locator("[data-next]").click()
    expect(date_input).to_have_attribute("aria-invalid", "true")
    expect(page.locator('[data-step="2"]')).to_be_visible()
    date_input.fill("")
    page.locator("[data-next]").click()
    page.locator(".priority-grid label").filter(has_text="Privacy").click()
    expect(page.locator('[name="priorities"][value="Privacy"]')).to_be_checked()
    page.locator('[name="notes"]').fill("A quiet anniversary with time on the water.")
    page.locator("[data-next]").click()
    assert all(label in page.locator(".brief-summary").inner_text() for label in labels)
    page.locator('[name="email"]').fill("invalid-address")
    page.locator("[data-next]").click()
    expect(page.locator('[name="email"]')).to_have_attribute("aria-invalid", "true")
    page.locator('[name="name"]').fill("Smoke test traveller")
    page.locator('[name="email"]').fill("smoke-test@example.com")
    if page.locator('[name="serviceConsent"]').count():
        page.locator('[name="serviceConsent"]').check()
    assert "smoke-test@example.com" in page.locator(".brief-summary").inner_text()
    with page.expect_download() as download_info:
        page.locator("[data-next]").click()
    download = download_info.value
    assert download.suggested_filename == "Pardus-My-Journey-Brief.txt"
    content = Path(download.path()).read_text(encoding="utf-8")
    assert all(label in content for label in labels)
    assert "Smoke test traveller" in content and "has not been sent" in content

    navigate(page, "planner.html")
    page.locator('[name="place"]').select_option("Wild")
    page.locator('[name="pace"]').select_option("")
    navigate(page, "about.html")
    navigate(page, "planner.html")
    assert page.locator('[name="place"]').input_value() == "Wild"
    assert page.locator('[name="pace"]').input_value() == ""
    navigate(page, "planner.html?place=City&reason=Business")
    assert page.locator('[name="place"]').input_value() == "City"
    assert page.locator('[name="reason"]').input_value() == "Business"
    navigate(page, "corporate.html")
    page.get_by_role("link", name="Prepare a corporate travel brief").click()
    arrive(page, r"planner\.html")
    expect(page.locator('[name="style"]')).to_have_value("Executive Arrivals")
    expect(page.locator('[name="reason"]')).to_have_value("Business")
    page.locator(".header-saved").click()
    page.locator("[data-folio-clear]").click()
    params = parse_qs(urlparse(page.locator("[data-folio-plan]").get_attribute("href")).query)
    assert not any(key in params for key in ["place", "pace", "reason", "saved"])
    expect(page.locator("[data-folio-empty]")).to_be_visible()
    page.get_by_role("button", name="Undo", exact=True).click()
    assert page.locator("[data-folio-items] li").count() == len(labels)
    page.keyboard.press("Escape")

    navigate(page, "destination-maldives.html")
    page.locator('a[href*="journey.html?destination="]').first.click()
    arrive(page, r"journey\.html\?destination=")
    expect(page.locator('[data-escape-enquiry] [name="destination"]')).to_have_value("The Maldives")
    form = page.locator("[data-escape-enquiry]")
    form.locator('[name="email"]').fill("smoke-test@example.com")
    form.locator('[name="notes"]').fill("A quiet anniversary with time on the water.")
    with page.expect_download() as enquiry_download:
        form.locator("[data-download-enquiry]").click()
    enquiry = enquiry_download.value
    assert enquiry.suggested_filename == "Pardus-Travel-Enquiry.txt"
    enquiry_text = Path(enquiry.path()).read_text(encoding="utf-8")
    assert "Destination: The Maldives" in enquiry_text and "smoke-test@example.com" in enquiry_text, enquiry_text
    expect(form.locator("[data-enquiry-status]")).to_contain_text("has not been sent")
    navigate(page, "contact.html")
    page.get_by_role("link", name="Prepare a travel enquiry", exact=True).click()
    arrive(page, r"journey\.html")
    expect(page.locator("[data-escape-enquiry]")).to_be_visible()
    assert not runtime_errors, runtime_errors
    context.close()  # Playwright also removes the temporary download.
    print(f"PASS destination/journal/journey filters, Folio save/remove/clear/undo, planner validation/download/draft priority, business CTA and simple enquiry download; {len(intercepted)} delivery attempts intercepted", flush=True)


def fallback_states(browser):
    context = context_for(browser, viewport={"width": 320, "height": 568}, reduced_motion="reduce")
    page = context.new_page()
    navigate(page)
    assert_hero(page, 320)
    assert page.locator("[data-reveal]:visible").evaluate_all("els => els.every(el => getComputedStyle(el).opacity !== '0')")
    scroll_and_check_images(page, "compact reduced-motion home")
    context.close()

    context = context_for(browser, intro_seen=False, viewport={"width": 390, "height": 844}, java_script_enabled=False)
    page = context.new_page()
    for route in ["index.html", "destinations.html", "journal.html", "journey.html", "planner.html"]:
        navigate(page, route, interactive=False)
        expect(page.locator("main h1")).to_be_visible()
        assert page.locator(".requires-js:visible").count() == 0, route
        scroll_and_check_images(page, f"no-JavaScript {route}")
        if route == "index.html":
            expect(page.locator("[data-pardus-intro]")).to_be_hidden()
            expect(page.locator("[data-hero] h1")).to_be_visible()
        if route == "journey.html":
            expect(page.get_by_role("link", name="Email your travel enquiry")).to_be_visible()
        if route == "planner.html":
            expect(page.locator(".no-script-help")).to_be_visible()
    context.close()

    context = context_for(browser, viewport={"width": 390, "height": 844})
    context.unroute(REMOTE_FEED)
    context.route(REMOTE_FEED, lambda route: route.abort("failed"))
    page = context.new_page()
    navigate(page, "travel-desk.html")
    expect(page.locator("[data-feed-status]")).to_contain_text("aviation feed", ignore_case=True)
    assert page.locator(".travel-update").count() == len(FEED["items"])
    assert not re.search(r"Principal Engineer|Senior Civil Engineer|Flight Operations Inspector", page.locator("[data-feed-items]").inner_text())
    context.close()
    print("PASS reduced-motion content visibility, no-JavaScript reading/enquiry/planner and unavailable remote-news fallback", flush=True)


def main():
    with sync_playwright() as playwright:
        launch = {"headless": True}
        if os.environ.get("PARDUS_QA_CHROMIUM"):
            launch["executable_path"] = os.environ["PARDUS_QA_CHROMIUM"]
            launch["args"] = ["--no-sandbox"]
        browser = playwright.chromium.launch(**launch)
        try:
            unknown = PHASES - {"matrix", "preloader", "leopard", "pins", "life", "phone", "picker", "stage", "hero", "flows", "fallback"}
            assert not unknown, f"Unknown QA phases: {unknown}"
            if "matrix" in PHASES:
                route_matrix(browser)
            if "preloader" in PHASES:
                preloader(browser)
            if "leopard" in PHASES:
                leopard_clear(browser)
            if "pins" in PHASES:
                hero_pins(browser)
            if "life" in PHASES:
                leopard_alive(browser)
            if "phone" in PHASES:
                phone_first_screen(browser)
            if "picker" in PHASES:
                service_picker(browser)
            if "stage" in PHASES:
                escape_stage(browser)
            if "hero" in PHASES:
                hero_and_menu(browser)
            if "flows" in PHASES:
                filters_and_planner(browser)
            if "fallback" in PHASES:
                fallback_states(browser)
        finally:
            browser.close()
    print(f"Pardus V30 browser smoke passed: {', '.join(sorted(PHASES))}. Matrix scope: {len(ROUTES)} exported routes across {len(VIEWPORTS)} widths; news response uses shipped JSON.", flush=True)


if __name__ == "__main__":
    main()
