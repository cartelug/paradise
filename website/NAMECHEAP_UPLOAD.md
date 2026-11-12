# Pardus website upload

The site is prepared for `https://pardusescapes.com/` on Namecheap shared hosting.
Pages use `/about/`, `/contact/`, `/journey/`, and the same trailing-slash format
for destinations, journeys and journal articles.

## Build the ZIP

From `website/`, with Node.js 22 or newer:

```sh
npm ci
npm run build:domain
PARDUS_BASE=/ npm run verify:export
npm run package:cpanel
```

The result is `website/release/pardus-site-cpanel.zip`. It contains the finished
website, its page directories, images, fonts and hidden `.htaccess` file.
The root must contain `index.html`, `about/index.html`, `contact/index.html`
and `.htaccess`. The Astro source and `node_modules` do not belong on the server.

## Locate the Pardus folder

1. In Namecheap, open **Hosting List → Go to cPanel** for the active hosting plan.
2. Open **Domains** and find `pardusescapes.com`.
3. Read its **Document Root**. Use that folder in **File Manager**. A hosting
   subscription named `theafrica63.com` can have other domains with their own
   folders; the subscription name does not identify Pardus's website folder.
4. If Pardus is absent, add it as a separate domain with its own document root.
   Keep it separate from the primary website rather than sharing that site's root.

## Upload when ready

1. Download a backup of the existing files in the Pardus document root.
2. Upload the ZIP to that folder and choose **Extract** there. The ZIP contains
   the contents of the website root, rather than a wrapping `dist` directory.
3. Enable **Show Hidden Files** in File Manager to confirm `.htaccess` is present.
   Confirm `index.html` and the page directories are directly in the document root.
   Preserve existing `.well-known`, `cgi-bin` and other hosting-managed files.
4. Once the website is correctly connected, ensure SSL covers both
   `pardusescapes.com` and `www.pardusescapes.com`, then check the homepage,
   `/about/`, `/contact/`, a destination and the enquiry form.
5. Check `/about.html?source=old-link` redirects to `/about/?source=old-link`.
   Then remove the uploaded ZIP from the website folder.

Keep Namecheap BasicDNS, Custom MX, the three Jellyfish MX records and all
SPF/DKIM/DMARC TXT records. Keep the hosting plan that contains the mailboxes
active. Confirm Pardus's hosting IP in cPanel before changing website A/CNAME
records; do not copy another domain's IP or change nameservers to connect it.

## Routing verification

The Namecheap rules issue HTTP 301 redirects for old page URLs and explicitly
requested `index.html` files. They check that the destination page exists,
preserve queries, leave unknown pages as real 404s, and bypass hosting/mail
service and SSL-validation paths. Normal directories serve their `index.html`
without a redirect loop. Existing old `.html` files can remain during an upload;
the redirect takes precedence.

GitHub Pages uses `/paradise/` as its base. Build and export it separately before
the own-domain build, as described in the root README. Its old `.html` files
become small static redirects preserving queries and fragments; it cannot run
Apache's HTTP 301 rules. Generated page directories are replaced on re-export
so stale pages cannot survive a release.

With a local Apache serving the own-domain build (`AllowOverride All`,
`mod_rewrite`, `mod_dir`), run:

```sh
PARDUS_QA_APACHE=http://127.0.0.1:4182 python tests/clean-urls.py
```

The test checks every page, canonical and sharing URL, the sitemap, 301s,
query/fragment preservation, navigation state and custom 404s. Browser traffic
for the production domain is served from the local test server.
