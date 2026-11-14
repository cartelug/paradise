"""Owner-update acceptance checks, screenshots, axe and repeatable mobile LCP.

Run against the already running preview with PARDUS_QA_BASE and
PARDUS_QA_CHROMIUM. All mailto clicks are captured locally; nothing is sent.
"""
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs
import json
import os
import statistics
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("PARDUS_QA_BASE", "http://127.0.0.1:4173").rstrip("/") + "/"
OUT = Path(os.environ.get("PARDUS_QA_OUTPUT", "/workspace/pardus-qa"))
OUT.mkdir(parents=True, exist_ok=True)
COPY = json.loads((ROOT / "tests/fixtures/owner-approved-copy.json").read_text())
FEED = json.loads((ROOT / "public/travel-updates.json").read_text())
RECORD = {"axe": [], "hero": [], "enquiry": {}, "screenshots": [], "performance": {}}


def context_for(browser, width=390, height=844, text_scale=1, reduced=True):
    context = browser.new_context(viewport={"width": width, "height": height},
        device_scale_factor=1, is_mobile=width < 768, has_touch=width < 768,
        reduced_motion="reduce" if reduced else "no-preference", accept_downloads=True)
    context.add_init_script("""sessionStorage.setItem('pardus-intro-v30', 'seen');
      window.__qaMailtos=[];
      const originalClick=HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click=function(){
        if(this.href.startsWith('mailto:')){window.__qaMailtos.push(this.href);return;}
        return originalClick.call(this);
      };""")
    context.route("https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json*", lambda route: route.fulfill(json=FEED))
    if text_scale != 1:
        context.add_init_script(f"document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.fontSize='{text_scale * 100}%');")
    return context


def navigate(page, route=""):
    response = page.goto(urljoin(BASE, route), wait_until="networkidle")
    assert response and response.status < 400, (route, response.status if response else None)
    page.wait_for_function("document.documentElement.classList.contains('js') && !document.documentElement.classList.contains('intro-active')")
    page.evaluate("document.fonts.ready")


def screenshot(page, name, locator=None, full=False):
    file = OUT / name
    if locator:
        locator.screenshot(path=str(file), animations="disabled")
    else:
        page.screenshot(path=str(file), full_page=full, animations="disabled")
    RECORD["screenshots"].append(name)


def load_photos(page):
    for image in page.locator("img[loading=lazy]").all():
        if image.is_visible():
            image.scroll_into_view_if_needed()
    page.wait_for_timeout(350)
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})")


def accessibility_and_screenshots(browser):
    for width, height in [(390, 844), (1440, 1000)]:
        context = context_for(browser, width, height)
        page = context.new_page()
        for route in ["index.html", "about/"]:
            navigate(page, route)
            load_photos(page)
            page.add_script_tag(path=str(ROOT / "node_modules/axe-core/axe.min.js"))
            result = page.evaluate("""async()=>await axe.run(document,{
              runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}
            })""")
            violations = [{"id": v["id"], "impact": v["impact"], "nodes": [n["target"] for n in v["nodes"]]} for v in result["violations"]]
            RECORD["axe"].append({"route": route, "width": width, "violations": violations, "passedRules": len(result["passes"]), "incompleteRules": len(result["incomplete"])})
            screenshot(page, f"{'home' if route == 'index.html' else 'about'}-{width}.png", full=route == "about/")
            if width == 390 and route == "index.html":
                screenshot(page, "who-we-are-390.png", locator=page.locator(".ws-intro"))
            assert not violations, (route, width, violations)
        context.close()
    print("PASS axe: home and About at 390px and 1440px; zero violations", flush=True)


def hero_geometry(browser):
    for width in [320, 360, 390, 430, 600, 768, 999, 1000, 1024, 1280, 1440, 1600, 1920]:
        for scale in [1, 2]:
            context = context_for(browser, width, 1000 if width >= 768 else 844, scale)
            page = context.new_page()
            navigate(page)
            geometry = page.evaluate("""()=>{
              const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
              const h=document.querySelector('#hero-title'), img=h.querySelector('img');
              const art=rect(img), heading=rect(h), stage=rect(document.querySelector('.hero-stage'));
              const imageVisible=img.getClientRects().length>0 && getComputedStyle(img.closest('.art-heading-visual')).display!=='none';
              return {art,heading,stage,imageVisible,viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,
                whoSize:parseFloat(getComputedStyle(document.querySelector('.ws-description')).fontSize),
                whoLeading:parseFloat(getComputedStyle(document.querySelector('.ws-description')).lineHeight),
                headingText:h.textContent.replace(/\\s+/g,' ').trim()};} """)
            assert geometry["headingText"] == "Extraordinary journeys.", (width, scale, geometry)
            assert geometry["pageWidth"] <= width + 1, (width, scale, geometry)
            box = geometry["art"] if geometry["imageVisible"] else geometry["heading"]
            assert box["left"] >= -1 and box["right"] <= width + 1, (width, scale, geometry)
            assert box["top"] >= geometry["stage"]["top"] - 1 and box["bottom"] <= geometry["stage"]["bottom"] + 1, (width, scale, geometry)
            assert geometry["whoSize"] >= 16 * scale - .1, (width, scale, geometry)
            assert geometry["whoLeading"] / geometry["whoSize"] >= 1.5, (width, scale, geometry)
            RECORD["hero"].append({"width": width, "textScale": scale, "whoSize": geometry["whoSize"], "headingVisible": True})
            context.close()
    print("PASS hero and reading size: 13 widths from 320px to 1920px, at 100% and 200% text", flush=True)


def sample_enquiry(browser):
    context = context_for(browser)
    context.route("**/*", lambda route: route.abort() if route.request.method not in ("GET", "HEAD", "OPTIONS") else route.continue_())
    page = context.new_page()
    navigate(page, "destinations/")
    cards = page.locator(".card-media")
    slugs = [a.get_attribute("href").split("destination-")[-1].replace(".html", "") for a in cards.all()]
    assert slugs[:6] == ["zanzibar", "seychelles", "maldives", "dubai", "maasai-mara", "uganda-gorillas"], slugs
    card = page.locator(".card").filter(has=page.locator('a[aria-label="Explore Uganda gorillas"]'))
    expect(card.locator(".price strong")).to_have_text("Request a quote")
    card.locator("summary").click()
    expect(card).to_contain_text("Gorilla permits are subject to availability")
    screenshot(page, "package-uganda-gorillas-390.png", locator=card)
    card.locator('a[aria-label="Explore Uganda gorillas"]').click()
    page.wait_for_url("**/destinations/uganda-gorillas/")
    page.wait_for_function("!document.documentElement.classList.contains('intro-active')")
    expect(page.locator(".price strong")).to_have_text("Request a quote")
    page.get_by_role("link", name="Plan this escape", exact=True).click()
    page.wait_for_url("**/journey/?destination=Uganda%20gorillas")
    page.wait_for_function("!document.documentElement.classList.contains('intro-active')")
    form = page.locator("[data-escape-enquiry]")
    expect(form.locator('[name="destination"]')).to_have_value("Uganda gorillas")
    notice = form.locator("[data-fare-notice]")
    assert " ".join(notice.inner_text().split()) == " ".join(COPY["fareNotice"].split())
    form.locator('[name="name"]').fill("QA Traveller")
    form.locator('[name="email"]').fill("qa@example.invalid")
    screenshot(page, "enquiry-fare-notice-390.png", locator=notice)
    form.locator('[type="submit"]').click()
    page.wait_for_function("window.__qaMailtos.length===1")
    draft = page.evaluate("window.__qaMailtos[0]")
    parsed = urlparse(draft)
    body = parse_qs(parsed.query)["body"][0]
    assert parsed.path == "bookings@pardusescapes.com", parsed
    assert body.endswith(COPY["fareNotice"]), body
    assert "Destination: Uganda gorillas" in body
    assert not form.locator("[data-enquiry-thanks]").is_visible(), "an email draft must not claim delivery"
    RECORD["enquiry"] = {"destination": "Uganda gorillas", "recipient": parsed.path, "fareNoticeExact": True, "externalMessagesSent": 0}
    context.close()
    print("PASS complete sample enquiry: listing, package, inclusions, notice and correctly addressed email draft; nothing sent", flush=True)


def performance(browser):
    runs = []
    for _ in range(3):
        context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        context.add_init_script("sessionStorage.setItem('pardus-intro-v30','seen'); window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});")
        context.route("https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json*", lambda route: route.fulfill(json=FEED))
        page = context.new_page()
        cdp = context.new_cdp_session(page)
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        cdp.send("Network.enable")
        cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 40, "downloadThroughput": 200000, "uploadThroughput": 100000})
        navigate(page)
        page.wait_for_timeout(1600)
        runs.append(page.evaluate('({lcp:window.__lcp,letteringBytes:performance.getEntriesByType("resource").filter(x=>x.name.includes("hero-lettering")).reduce((n,x)=>n+x.transferSize,0)})'))
        context.close()
    result = {"profile": "390x844, DPR3, mobile/touch, CPU4x, 1.6Mbps down, 0.8Mbps up, 40ms latency; local static export; repeat visitor; shipped news fixture", "runs": runs, "medianLcpMs": statistics.median(item["lcp"] for item in runs)}
    (OUT / "performance-after.json").write_text(json.dumps(result, indent=2))
    before_file = OUT / "performance-before.json"
    if before_file.exists():
        before = json.loads(before_file.read_text())
        result["baselineMedianLcpMs"] = before["medianLcpMs"]
        result["changePercent"] = round((result["medianLcpMs"] / before["medianLcpMs"] - 1) * 100, 1)
    RECORD["performance"] = result
    print(f"PASS measured mobile LCP: {result['medianLcpMs']}ms median, baseline {result.get('baselineMedianLcpMs')}ms", flush=True)


def main():
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=os.environ.get("PARDUS_QA_CHROMIUM", "/usr/bin/chromium"))
            phases = os.environ.get("PARDUS_OWNER_QA_PHASES", "axe,hero,enquiry,performance").split(",")
            if "axe" in phases: accessibility_and_screenshots(browser)
            if "hero" in phases: hero_geometry(browser)
            if "enquiry" in phases: sample_enquiry(browser)
            if "performance" in phases: performance(browser)
            browser.close()
    finally:
        (OUT / "owner-update-qa.json").write_text(json.dumps(RECORD, indent=2))


if __name__ == "__main__":
    main()
