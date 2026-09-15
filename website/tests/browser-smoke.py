"""Smoke-test the exported Pardus website with Python Playwright.

Run after building, exporting and starting a local static server:
    python tests/browser-smoke.py
Set PARDUS_QA_BASE to test another served export (including GitHub Pages).
HTML routes are discovered from the repository export. Screenshots and persistent
artifacts are not written. Form submissions are intercepted inside the test.
"""

from datetime import date, timedelta
from pathlib import Path
import os
import re
from urllib.parse import parse_qs, urljoin, urlparse

from playwright.sync_api import expect, sync_playwright


BASE = os.environ.get("PARDUS_QA_BASE", "http://127.0.0.1:4180/paradise").rstrip("/") + "/"
EXPORT = Path(__file__).resolve().parents[2]
ROUTES = sorted(path.name for path in EXPORT.glob("*.html"))
VIEWPORTS = [(320, 568), (390, 844), (768, 1024), (1024, 768), (1440, 900)]
SEEN_OPENING = "sessionStorage.setItem('pardus-opening-v3','seen')"
LAYOUT_IMAGES = """() => [...document.images].filter(img =>
    img.getClientRects().length && getComputedStyle(img).visibility !== 'hidden')"""


def navigate(page, route="index.html", interactive=True):
    response = page.goto(urljoin(BASE, route), wait_until="load", timeout=45000)
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
        context = browser.new_context(viewport={"width": width, "height": height})
        context.add_init_script(SEEN_OPENING)
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


def atlas_and_menu(browser):
    for width, height in [(390, 844), (1440, 900)]:
        context = browser.new_context(viewport={"width": width, "height": height})
        context.add_init_script(SEEN_OPENING)
        page = context.new_page()
        navigate(page)
        tabs = page.locator("[data-destination-tab]")
        assert tabs.count() > 1
        tabs.first.focus()
        for index in range(1, tabs.count()):
            page.keyboard.press("ArrowDown")
            expect(tabs.nth(index)).to_be_focused()
            expect(tabs.nth(index)).to_have_attribute("aria-selected", "true")
            assert page.locator("[data-panel]:visible").count() == 1
            selected = tabs.nth(index).get_attribute("aria-controls")
            panel = page.locator(f"#{selected}")
            expect(panel).to_be_visible()
            panel.locator("img").scroll_into_view_if_needed()
            expect(panel.locator("img")).to_have_js_property("complete", True)
            assert panel.locator("img").evaluate("img => img.naturalWidth > 0")
            tabs.nth(index).focus()
        page.keyboard.press("Home")
        expect(tabs.first).to_be_focused()
        page.keyboard.press("End")
        expect(tabs.last).to_be_focused()
        page.keyboard.press("ArrowDown")
        expect(tabs.first).to_be_focused()
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
    print("PASS atlas keyboard navigation, every atlas image, mobile menu and focus return", flush=True)


def filters_and_planner(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
    context.add_init_script(SEEN_OPENING)
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

    navigate(page)
    place = page.locator('[data-folio-choice="place"][data-value="Island"]')
    place.click()
    page.locator('[data-folio-choice="pace"][data-value="Still"]').click()
    place.click()
    assert "place=" not in page.locator("[data-folio-plan]").get_attribute("href")
    page.locator(".home-concept-card [data-folio-save]").nth(0).click()
    page.locator(".home-concept-card [data-folio-save]").nth(1).click()
    navigate(page, "destinations.html")
    page.locator("[data-folio-save]").nth(0).click()
    page.locator("[data-folio-save]").nth(1).click()
    labels = page.evaluate("JSON.parse(localStorage.getItem('pardus-folio-v2')).items.map(item => item.label)")
    assert len(labels) == 4
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

    navigate(page, "journey.html")
    page.locator('[name="place"]').select_option("Wild")
    page.locator('[name="pace"]').select_option("")
    navigate(page, "about.html")
    navigate(page, "journey.html")
    assert page.locator('[name="place"]').input_value() == "Wild"
    assert page.locator('[name="pace"]').input_value() == ""
    navigate(page, "journey.html?place=City&reason=Business")
    assert page.locator('[name="place"]').input_value() == "City"
    assert page.locator('[name="reason"]').input_value() == "Business"
    for route, label in [("contact.html", "Prepare a business brief"), ("corporate.html", "Prepare a corporate travel brief")]:
        navigate(page, route)
        page.get_by_role("link", name=label).click()
        expect(page.locator('[name="style"]')).to_have_value("Executive Arrivals")
        expect(page.locator('[name="reason"]')).to_have_value("Business")
    page.locator(".header-folio").click()
    page.locator("[data-folio-clear]").click()
    params = parse_qs(urlparse(page.locator("[data-folio-plan]").get_attribute("href")).query)
    assert not any(key in params for key in ["place", "pace", "reason", "saved"])
    expect(page.locator("[data-folio-empty]")).to_be_visible()
    page.get_by_role("button", name="Undo", exact=True).click()
    assert page.locator("[data-folio-items] li").count() == len(labels)
    assert not runtime_errors, runtime_errors
    context.close()  # Playwright also removes the temporary download.
    print(f"PASS journal/journey filters, Folio clear/undo, complete download, draft priority and business CTAs; {len(intercepted)} delivery attempts intercepted", flush=True)


def fallback_states(browser):
    context = browser.new_context(viewport={"width": 320, "height": 568}, reduced_motion="reduce")
    page = context.new_page()
    navigate(page)
    assert page.locator(".preloader").evaluate("element => getComputedStyle(element).display === 'none'")
    metrics = page.locator(".v20-explore,.v20-explore-frame,.v20-explore-bottom").evaluate_all("elements => elements.map(element => element.getBoundingClientRect().toJSON())")
    assert len(metrics) == 3
    assert metrics[1]["bottom"] <= metrics[0]["bottom"] + 1, metrics
    assert metrics[2]["bottom"] <= metrics[0]["bottom"] + 1, metrics
    scroll_and_check_images(page, "compact reduced-motion home")
    context.close()

    context = browser.new_context(viewport={"width": 390, "height": 844}, java_script_enabled=False)
    page = context.new_page()
    for route in ["index.html", "destinations.html", "journal.html", "journey.html"]:
        navigate(page, route, interactive=False)
        expect(page.locator("main h1")).to_be_visible()
        assert page.locator(".requires-js:visible").count() == 0, route
        scroll_and_check_images(page, f"no-JavaScript {route}")
        if route == "journey.html":
            expect(page.locator(".no-script-help")).to_be_visible()
    context.close()

    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    navigate(page)
    expect(page.locator("html")).to_have_class(re.compile(r"\bpage-ready\b"), timeout=4500)
    page.locator(".replay-opening").click()
    expect(page.locator("html")).to_have_class(re.compile(r"\bis-opening\b"))
    page.keyboard.press("Escape")
    expect(page.locator("html")).to_have_class(re.compile(r"\bpage-ready\b"))
    context.close()
    print("PASS compact reduced motion, no-JavaScript reading/planner fallback, first opening and Escape", flush=True)


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            route_matrix(browser)
            atlas_and_menu(browser)
            filters_and_planner(browser)
            fallback_states(browser)
        finally:
            browser.close()
    print(f"Pardus browser smoke passed: {len(ROUTES)} exported routes across {len(VIEWPORTS)} viewports plus interaction and fallback checks.", flush=True)


if __name__ == "__main__":
    main()
