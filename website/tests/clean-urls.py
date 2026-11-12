"""Check the own-domain build on a local Apache server, including real redirects.

Serve website/dist with AllowOverride All and mod_rewrite, then run:
  PARDUS_QA_APACHE=http://127.0.0.1:4182 python tests/clean-urls.py
PARDUS_QA_GITHUB optionally checks the exported GitHub Pages legacy redirects.
All browser requests are intercepted and served locally; no live site is changed.
"""
from http.client import HTTPConnection
from pathlib import Path
from urllib.parse import urlsplit
import json
import os
import re

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SERVER = urlsplit(os.environ.get("PARDUS_QA_APACHE", "http://127.0.0.1:4182"))
ORIGIN = "https://pardusescapes.com"
SLUGS = sorted(p.name for p in DIST.iterdir() if p.is_dir() and (p / "index.html").is_file())
ROUTES = ["/"] + [f"/{slug}/" for slug in SLUGS]
QUERY = "destination=Uganda%20gorillas&source=old-link"


def request(path, host="pardusescapes.com", secure=True):
    connection = HTTPConnection(SERVER.hostname, SERVER.port, timeout=15)
    headers = {"Host": host}
    if secure:
        headers["X-Forwarded-Proto"] = "https"
    connection.request("GET", path, headers=headers)
    response = connection.getresponse()
    status, headers, body = response.status, dict(response.getheaders()), response.read()
    connection.close()
    return status, {key.lower(): value for key, value in headers.items()}, body


def redirect(path, target, **options):
    status, headers, _ = request(path, **options)
    assert status == 301, (path, status, headers)
    assert headers.get("location") == ORIGIN + target, (path, headers)


def http_checks():
    assert len(ROUTES) > 1, "Build the own-domain site first"
    for route in ROUTES:
        status, _, body = request(route)
        assert status == 200, (route, status)
        markup = body.decode()
        assert f'rel="canonical" href="{ORIGIN}{route}"' in markup, route
        assert f'property="og:url" content="{ORIGIN}{route}"' in markup, route
        assert "data-pardus-intro" in markup, route
        for url in re.findall(r'(?:href|action)="([^"]+)"', markup):
            if url.startswith(("#", "mailto:", "tel:", "https:", "http:")):
                continue
            assert not re.search(r"\.html(?:[?#]|$)", url), (route, url)
        redirect(route + "index.html?" + QUERY, route + "?" + QUERY)
    for slug in SLUGS:
        redirect(f"/{slug}.html?{QUERY}", f"/{slug}/?{QUERY}")
        redirect(f"/{slug}?{QUERY}", f"/{slug}/?{QUERY}")
    redirect("/about.html?" + QUERY, "/about/?" + QUERY, host="www.pardusescapes.com", secure=False)
    redirect("/about/?" + QUERY, "/about/?" + QUERY, host="www.pardusescapes.com")
    redirect("/about/?" + QUERY, "/about/?" + QUERY, secure=False)
    for path in ["/not-a-pardus-page/", "/not-a-pardus-page.html", "/images/not-a-page.html"]:
        status, _, body = request(path)
        assert status == 404 and b"A different" in body, (path, status)
    status, _, sitemap = request("/sitemap-0.xml")
    locations = re.findall(r"<loc>([^<]+)</loc>", sitemap.decode())
    assert status == 200 and set(locations) == {ORIGIN + route for route in ROUTES}, locations
    assert request("/404.html")[0] == 200
    print(f"PASS Apache: {len(ROUTES)} clean pages, every old .html and explicit index.html URL, slash/HTTPS/www redirects, query preservation, custom 404 and sitemap", flush=True)


def browser_checks():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("PARDUS_QA_CHROMIUM", "/usr/bin/chromium"), args=["--no-sandbox"])
        context = browser.new_context(reduced_motion="reduce")
        context.add_init_script("sessionStorage.setItem('pardus-intro-v30','seen')")
        context.route("**/*", lambda route: route.abort())
        feed = json.loads((ROOT / "public/travel-updates.json").read_text())
        context.route("https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json*", lambda route: route.fulfill(json=feed))

        def local(route):
            url = urlsplit(route.request.url)
            status, headers, body = request(url.path + ("?" + url.query if url.query else ""))
            route.fulfill(status=status, headers={key: value for key, value in headers.items() if key not in {"connection", "transfer-encoding", "keep-alive"}}, body=body)

        context.route(ORIGIN + "/**", local)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        for route in ROUTES:
            response = page.goto(ORIGIN + route, wait_until="networkidle")
            assert response.status == 200 and page.url.endswith(route), route
            assert page.locator('link[rel="canonical"]').get_attribute("href") == ORIGIN + route
            slug = route.strip("/")
            active = "destinations" if slug.startswith("destination-") else "journeys" if slug.startswith("journey-") else "journal" if slug.startswith("journal-") else slug
            if active in {"about", "corporate", "journal", "journeys", "destinations"}:
                assert page.locator('.desktop-nav a[aria-current="page"]').get_attribute("href") == f"/{active}/", route
        page.goto(ORIGIN + "/about.html?" + QUERY + "#how-booking-works", wait_until="networkidle")
        assert page.url == ORIGIN + "/about/?" + QUERY + "#how-booking-works", page.url
        assert not errors, errors
        context.close()
        github = os.environ.get("PARDUS_QA_GITHUB")
        if github:
            page = browser.new_page()
            for slug in SLUGS:
                page.goto(github.rstrip("/") + f"/{slug}.html?{QUERY}#fares", wait_until="domcontentloaded")
                page.wait_for_url(github.rstrip("/") + f"/{slug}/?{QUERY}#fares")
            page.close()
        browser.close()
    print(f"PASS browser: {len(ROUTES)} clean routes, navigation state, redirect query/fragment preservation, no runtime errors" + (f", {len(SLUGS)} GitHub Pages legacy links" if github else ""), flush=True)


if __name__ == "__main__":
    http_checks()
    browser_checks()
