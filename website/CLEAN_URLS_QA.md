# Clean URL migration — 12 November 2026

Prepared for the requested Namecheap deployment. Hosting, DNS and mailbox
settings were not changed. The own-domain ZIP is a build artifact; it is not
uploaded by merging this code.

## Result

All 34 content routes use a trailing slash. `404.html` remains the server's error
document. Every page's navigation, calls to action, form targets, canonical and
Open Graph URLs, schema links and sitemap follow the new format. Directory
`index.html` files serve those URLs directly on static hosting.

Apache permanently redirects old `.html`, explicit `index.html` and missing-slash
page requests. Queries are preserved, browsers retain fragments, and an existing
old HTML file does not override the redirect. Unknown URLs return the custom
404 with status 404. Hosting/mail and certificate-validation paths bypass the
website redirects. The GitHub export has 33 legacy redirect files preserving
queries and fragments.

## Validation

- Astro diagnostics: zero errors, warnings or hints.
- 101 Node tests, including nested-page saved-trip links and anchor retention.
- Both GitHub Pages and own-domain builds; all references resolved across 35
  generated pages in each build, with clean canonical URLs.
- Real Apache 2.4 with `mod_rewrite`, `mod_dir`, `.htaccess` overrides and the
  extracted upload ZIP: all 34 clean content pages, every old `.html` and explicit
  `index.html` route, slash/HTTPS/www redirects, queries, sitemap and custom 404s.
- A legacy `about.html` file deliberately left in the local test document root
  still redirected to `/about/`. Simulated webmail, cPanel and SSL-validation
  files stayed accessible without website redirects.
- Chromium: all 34 own-domain content pages, active navigation, query/fragment
  preservation, no JavaScript exceptions, and all 33 GitHub legacy redirects.
- Existing browser smoke phases `picker,hero,flows,fallback`: service selections
  with and without JavaScript, desktop/mobile navigation, Folio state,
  planner validation/download/restoration, destination enquiry details, contact
  actions, reduced motion and remote-news failure.
- Upload archive CRC and safe root paths checked after extraction.

The Apache server and browser interception were local. These checks do not claim
that Namecheap DNS, SSL or live mailbox delivery has been changed or verified.
