"""Check the online enquiry flow against a build that has a delivery endpoint, with the endpoint intercepted (nothing is sent).

The shipped site has no endpoint until the business connects one, so its enquiry falls back to an email draft. To check the
online flow before going live, build a scratch copy with an endpoint, serve it, and run this script:

    PARDUS_BASE=/paradise/ PUBLIC_PARDUS_ENQUIRY_ENDPOINT=https://formspree.io/f/xxxxxxx \\
        npx astro build --outDir /tmp/online/paradise
    (cd /tmp/online && python3 -m http.server 4181 --bind 127.0.0.1) &
    PARDUS_QA_BASE=http://127.0.0.1:4181/paradise python tests/online-enquiry.py

Set PARDUS_QA_ENDPOINT to the same endpoint (default https://formspree.io/f/xxxxxxx) and PARDUS_QA_CHROMIUM to a Chromium.
"""

from pathlib import Path
import os
from urllib.parse import parse_qs, urljoin

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("PARDUS_QA_BASE", "http://127.0.0.1:4181/paradise").rstrip("/") + "/"
ENDPOINT = os.environ.get("PARDUS_QA_ENDPOINT", "https://formspree.io/f/pardusqa")
INTRO_KEY = "pardus-intro-v30"


def open_page(browser, route="journey.html"):
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    context.add_init_script(f"try {{ sessionStorage.setItem('{INTRO_KEY}', 'seen'); }} catch (e) {{}}")
    page = context.new_page()
    page.goto(urljoin(BASE, route), wait_until="networkidle")
    page.wait_for_function("document.documentElement.classList.contains('js') && !document.documentElement.classList.contains('intro-active')", timeout=15000)
    return context, page


def fill(form, **values):
    for name, value in values.items():
        form.locator(f'[name="{name}"]').fill(value)


def run(browser):
    # 1. Delivered: the form is replaced by a confirmation that names the traveller and their email, and the request carries every field.
    context, page = open_page(browser)
    sent = []
    page.route(ENDPOINT, lambda route: (sent.append(route.request.post_data_buffer), route.fulfill(status=200, json={"ok": True}))[1])
    form = page.locator("[data-escape-enquiry]")
    expect(form.locator("button[type='submit']")).to_contain_text("Send my enquiry")
    form.locator("button[type='submit']").click()
    assert form.locator('[name="name"]').evaluate("el => el.matches(':invalid')"), "an empty name must stop the form"
    assert not sent, "nothing may be sent while a required field is empty"
    fill(form, name="  Amina Test  ", email="amina@example.com", phone="+256 700 000 000", notes="Honeymoon, ten nights.")
    form.locator("button[type='submit']").click()
    thanks = form.locator("[data-enquiry-thanks]")
    expect(thanks).to_be_visible()
    expect(thanks).to_contain_text("Thank you, Amina")
    expect(thanks).to_contain_text("amina@example.com")
    expect(form.locator("[data-enquiry-fields]")).to_be_hidden()
    assert page.evaluate("document.activeElement.hasAttribute('data-enquiry-thanks')"), "focus must move to the confirmation"
    assert len(sent) == 1, sent
    body = sent[0].decode("utf-8", "replace")
    for needle in ("Amina Test", "amina@example.com", "+256 700 000 000", "Honeymoon", "Pardus travel enquiry"):
        assert needle in body, f"{needle!r} missing from the delivered enquiry"
    with page.expect_download() as download:
        thanks.locator("[data-download-enquiry]").click()
    text = Path(download.value.path()).read_text(encoding="utf-8")
    assert "Name: Amina Test" in text and "Phone or WhatsApp: +256 700 000 000" in text, text
    thanks.locator("[data-enquiry-again]").click()
    expect(form.locator("[data-enquiry-fields]")).to_be_visible()
    expect(thanks).to_be_hidden()
    assert form.locator('[name="name"]').input_value() == "", "a second enquiry starts empty"
    context.close()

    # 2. Not delivered: no false confirmation, and the visitor is told what happens instead.
    context, page = open_page(browser)
    page.route(ENDPOINT, lambda route: route.fulfill(status=500, json={"ok": False}))
    form = page.locator("[data-escape-enquiry]")
    fill(form, name="Amina Test", email="amina@example.com")
    form.locator("button[type='submit']").click()
    expect(form.locator("[data-enquiry-status]")).to_contain_text("Online delivery is unavailable")
    expect(form.locator("[data-enquiry-thanks]")).to_be_hidden()
    expect(form.locator("[data-enquiry-fields]")).to_be_visible()
    context.close()

    # 3. The homepage form behaves the same.
    context, page = open_page(browser, "index.html")
    page.route(ENDPOINT, lambda route: route.fulfill(status=200, json={"ok": True}))
    form = page.locator("[data-escape-enquiry]")
    form.scroll_into_view_if_needed()
    fill(form, name="Home Test", email="home@example.com")
    form.locator("button[type='submit']").click()
    expect(form.locator("[data-enquiry-thanks]")).to_be_visible()
    context.close()
    print("PASS online enquiry: required name and email, phone or WhatsApp, delivery, confirmation, a saved copy, a second enquiry, and an honest message when delivery fails", flush=True)


if __name__ == "__main__":
    with sync_playwright() as playwright:
        executable = os.environ.get("PARDUS_QA_CHROMIUM")
        browser = playwright.chromium.launch(executable_path=executable, args=["--no-sandbox"]) if executable else playwright.chromium.launch()
        try:
            run(browser)
        finally:
            browser.close()
