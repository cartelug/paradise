"""Smoke-test the exported Pardus website with Python Playwright.

Run after building, exporting and starting a local static server:
    python tests/browser-smoke.py
Set PARDUS_QA_BASE to test another served export (including GitHub Pages).
Set PARDUS_QA_PHASES to a comma-separated subset: matrix,hero,flows,fallback.
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
PHASES = set(os.environ.get("PARDUS_QA_PHASES", "matrix,hero,flows,fallback").split(","))
FEED = json.loads((EXPORT / "website/public/travel-updates.json").read_text(encoding="utf-8"))
REMOTE_FEED = "https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json*"
LAYOUT_IMAGES = """() => [...document.images].filter(img =>
    img.getClientRects().length && getComputedStyle(img).visibility !== 'hidden')"""


def context_for(browser, **options):
    context = browser.new_context(**options)
    context.route(REMOTE_FEED, lambda route: route.fulfill(json=FEED))
    return context


def navigate(page, route="index.html", interactive=True):
    response = page.goto(urljoin(BASE, route), wait_until="networkidle", timeout=45000)
    assert response and response.status < 400, f"Document failed: {route}"
    if interactive:
        page.wait_for_function("document.documentElement.classList.contains('js')", timeout=10000)


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


def assert_premium_hero(page, width):
    hero = page.locator("[data-premium-hero]")
    expect(hero).to_be_visible()
    expect(page.locator("body")).to_have_attribute("data-pardus-version", "29")
    assert " ".join(hero.locator("h1").inner_text().split()) == "Luxury travel, beautifully arranged."
    expect(hero.get_by_role("link", name="Explore destinations", exact=True)).to_have_attribute("href", "#destinations")
    expect(hero.get_by_role("link", name="Plan your escape", exact=True)).to_have_attribute("href", "#enquire")
    expect(page.locator(".site-header .header-leopard svg")).to_be_visible()
    image = page.locator(".premium-hero-media img")
    expect(image).to_be_visible()
    expect(image).to_have_js_property("complete", True)
    metrics = image.evaluate("""img => {
      const box = img.getBoundingClientRect();
      let opacity = 1;
      for (let node = img; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
      return {width:box.width, height:box.height, natural:img.naturalWidth, source:img.currentSrc, opacity};
    }""")
    assert metrics["natural"] > 0 and metrics["width"] >= width - 1 and metrics["height"] > 400, metrics
    assert metrics["opacity"] > .95, metrics
    assert ("hero-v29-mobile" if width <= 760 else "hero-v29-desktop") in metrics["source"], metrics
    prices = page.locator(".premium-quick>a")
    assert prices.count() == 3
    for index, slug in enumerate(["maldives", "seychelles", "dubai"]):
        row = prices.nth(index)
        assert urlparse(row.get_attribute("href")).path.endswith(f"destination-{slug}.html")
        assert re.search(r"From (?:USD|UGX) [\d,]+", row.inner_text()), row.inner_text()
        assert "per person" in row.inner_text(), row.inner_text()
    assert "UGX quote available" in page.locator(".premium-price-note").inner_text()
    assert_no_overflow(page, f"premium hero at {width}")


def premium_hero_and_menu(browser):
    for width, height in [(390, 844), (1440, 900)]:
        context = context_for(browser, viewport={"width": width, "height": height})
        page = context.new_page()
        navigate(page)
        assert_premium_hero(page, width)
        hero = page.locator("[data-premium-hero]")
        hero.get_by_role("link", name="Explore destinations", exact=True).click()
        expect(page.locator("#destinations h2")).to_be_in_viewport()
        page.evaluate("window.scrollTo({top:0, behavior:'instant'})")
        hero.get_by_role("link", name="Plan your escape", exact=True).click()
        expect(page.locator("#enquire [data-escape-enquiry]")).to_be_in_viewport()
        expect(page.locator('#enquire [name="budget"]')).to_contain_text("UGX")
        page.evaluate("window.scrollTo({top:0, behavior:'instant'})")
        if width == 390:
            toggle = page.locator(".menu-toggle")
            toggle.click()
            menu = page.locator("#mobile-menu")
            expect(menu).to_have_js_property("open", True)
            expect(toggle).to_have_attribute("aria-expanded", "true")
            for _ in range(3):
                page.keyboard.press("Tab")
                assert menu.evaluate("dialog => dialog.contains(document.activeElement)")
            page.keyboard.press("Escape")
            expect(menu).to_have_js_property("open", False)
            expect(toggle).to_be_focused()
            toggle.click()
            page.locator(".menu-close").click()
            expect(menu).to_have_js_property("open", False)
        context.close()
    print("PASS V29 hero copy, responsive artwork, logo, prices, actions and mobile-menu focus return", flush=True)


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
    all_destinations = page.locator(".escape-card").count()
    for category in ["islands", "wild", "culture"]:
        page.locator(f'[data-filter="{category}"]').click()
        visible = page.locator(".escape-card:visible")
        assert visible.count() > 0
        assert visible.evaluate_all("cards => cards.every(card => !card.hidden && card.dataset.category === '" + category + "')")
        expect(page.locator(f'[data-filter="{category}"]')).to_have_attribute("aria-pressed", "true")
    page.locator('[data-filter="all"]').click()
    assert page.locator(".escape-card:visible").count() == all_destinations
    page.locator(".header-folio").click()
    panel = page.locator("#pardus-folio")
    expect(panel).to_have_js_property("open", True)
    href = page.locator("[data-folio-plan]").get_attribute("href")
    page.keyboard.press("Escape")
    expect(page.locator(".header-folio")).to_be_focused()
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
    expect(page.locator('[name="style"]')).to_have_value("Executive Arrivals")
    expect(page.locator('[name="reason"]')).to_have_value("Business")
    page.locator(".header-folio").click()
    page.locator("[data-folio-clear]").click()
    params = parse_qs(urlparse(page.locator("[data-folio-plan]").get_attribute("href")).query)
    assert not any(key in params for key in ["place", "pace", "reason", "saved"])
    expect(page.locator("[data-folio-empty]")).to_be_visible()
    page.get_by_role("button", name="Undo", exact=True).click()
    assert page.locator("[data-folio-items] li").count() == len(labels)
    page.keyboard.press("Escape")

    navigate(page, "destination-maldives.html")
    page.locator('a[href*="journey.html?destination="]').first.click()
    expect(page.locator('[data-escape-enquiry] [name="destination"]')).to_have_value("The Maldives")
    form = page.locator("[data-escape-enquiry]")
    form.locator('[name="email"]').fill("smoke-test@example.com")
    form.locator('[name="notes"]').fill("A quiet anniversary with time on the water.")
    with page.expect_download() as enquiry_download:
        form.locator("[data-download-enquiry]").click()
    enquiry = enquiry_download.value
    assert enquiry.suggested_filename == "Pardus-Travel-Enquiry.txt"
    enquiry_text = Path(enquiry.path()).read_text(encoding="utf-8")
    assert "Destination: The Maldives" in enquiry_text and "smoke-test@example.com" in enquiry_text
    expect(form.locator("[data-enquiry-status]")).to_contain_text("has not been sent")
    navigate(page, "contact.html")
    page.get_by_role("link", name="Prepare a travel enquiry", exact=True).click()
    expect(page.locator("[data-escape-enquiry]")).to_be_visible()
    assert not runtime_errors, runtime_errors
    context.close()  # Playwright also removes the temporary download.
    print(f"PASS destination/journal/journey filters, Folio save/remove/clear/undo, planner validation/download/draft priority, business CTA and simple enquiry download; {len(intercepted)} delivery attempts intercepted", flush=True)


def fallback_states(browser):
    context = context_for(browser, viewport={"width": 320, "height": 568}, reduced_motion="reduce")
    page = context.new_page()
    navigate(page)
    assert_premium_hero(page, 320)
    expect(page.locator(".premium-home")).to_have_attribute("data-premium-motion-state", "reduced")
    expect(page.locator("[data-premium-motion]")).to_be_hidden()
    assert page.locator("[data-premium-depth]").evaluate("element => getComputedStyle(element).transform") == "none"
    first = page.locator("[data-premium-leopard] img").evaluate("element => getComputedStyle(element).transform")
    page.wait_for_timeout(240)
    assert page.locator("[data-premium-leopard] img").evaluate("element => getComputedStyle(element).transform") == first
    scroll_and_check_images(page, "compact reduced-motion home")
    context.close()

    context = context_for(browser, viewport={"width": 390, "height": 844}, java_script_enabled=False)
    page = context.new_page()
    for route in ["index.html", "destinations.html", "journal.html", "journey.html", "planner.html"]:
        navigate(page, route, interactive=False)
        expect(page.locator("main h1")).to_be_visible()
        assert page.locator(".requires-js:visible").count() == 0, route
        scroll_and_check_images(page, f"no-JavaScript {route}")
        if route == "index.html":
            assert_premium_hero(page, 390)
            expect(page.locator("[data-premium-motion]")).to_be_hidden()
        if route == "journey.html":
            expect(page.locator('main a[href^="mailto:"]')).to_be_visible()
        if route == "planner.html":
            expect(page.locator(".no-script-help")).to_be_visible()
    context.close()

    context = context_for(browser, viewport={"width": 1440, "height": 900})
    page = context.new_page()
    navigate(page)
    home = page.locator(".premium-home")
    control = page.locator("[data-premium-motion]")
    expect(control).to_be_visible()
    expect(home).to_have_attribute("data-premium-motion-state", "playing")
    control.click()
    expect(control).to_have_attribute("aria-pressed", "true")
    expect(control).to_have_accessible_name("Resume page motion")
    expect(home).to_have_attribute("data-premium-motion-state", "paused")
    first = page.locator("[data-premium-leopard] img").evaluate("element => getComputedStyle(element).transform")
    page.wait_for_timeout(240)
    assert page.locator("[data-premium-leopard] img").evaluate("element => getComputedStyle(element).transform") == first
    navigate(page)
    expect(home).to_have_attribute("data-premium-motion-state", "paused")
    expect(control).to_have_attribute("aria-pressed", "true")
    control.click()
    expect(home).to_have_attribute("data-premium-motion-state", "playing")
    expect(control).to_have_accessible_name("Pause page motion")
    page.locator("#enquire").scroll_into_view_if_needed()
    expect(home).to_have_class(re.compile(r"\bpremium-motion-dormant\b"))
    first = page.locator("[data-premium-leopard] img").evaluate("element => getComputedStyle(element).transform")
    page.wait_for_timeout(240)
    assert page.locator("[data-premium-leopard] img").evaluate("element => getComputedStyle(element).transform") == first
    page.evaluate("window.scrollTo({top:0, behavior:'instant'})")
    expect(home).not_to_have_class(re.compile(r"\bpremium-motion-dormant\b"))
    page.emulate_media(reduced_motion="reduce")
    expect(home).to_have_attribute("data-premium-motion-state", "reduced")
    expect(control).to_be_hidden()
    assert_premium_hero(page, 1440)
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
    print("PASS reduced-motion changes, saved pause/resume, off-screen suspension, no-JavaScript reading/enquiry/planner and unavailable remote-news fallback", flush=True)


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            unknown = PHASES - {"matrix", "hero", "flows", "fallback"}
            assert not unknown, f"Unknown QA phases: {unknown}"
            if "matrix" in PHASES:
                route_matrix(browser)
            if "hero" in PHASES:
                premium_hero_and_menu(browser)
            if "flows" in PHASES:
                filters_and_planner(browser)
            if "fallback" in PHASES:
                fallback_states(browser)
        finally:
            browser.close()
    print(f"Pardus V29 browser smoke passed: {', '.join(sorted(PHASES))}. Matrix scope: {len(ROUTES)} exported routes across {len(VIEWPORTS)} widths; news response uses shipped JSON.", flush=True)


if __name__ == "__main__":
    main()
