# Pardus Luxury Escapes — website handover

**Release:** V21, the handover release, 25 September 2026 · **Built by:** 97 Design
**Live preview:** https://cartelug.github.io/paradise/

This is the starting point for whoever runs the site next. It covers what is finished, what the business still needs to supply, and exactly where each item goes. For content editing and release rules, see `website/V20-MAINTENANCE.md`.

## What is live

29 pages, published from the `main` branch by GitHub Pages:

- **Homepage:** the animated opening, the Travel.Explore chapter, an interactive destination atlas, journey ideas, the Folio and Journal highlights.
- **Destinations (6):** the Maldives, Zanzibar, Seychelles, East Africa, Europe and Dubai, each with a full dossier page.
- **Journey ideas (6):** Safari & Shore, Private Island Reset, Celebration in Two Acts, Family in the Wild, Mediterranean at Human Pace and Executive Arrivals.
- **Journal (5 articles):** with an index, search and topic filters.
- **Journey planner:** four guided steps that produce a downloadable brief, with online delivery built in (see below).
- **The Pardus way, Travel concierge, Corporate travel, Contact, Privacy, Terms and a 404 page.**

Quality checks at release: type check with no errors; 16 unit tests; the browser regression suite (all 29 pages at five screen sizes, plus menus, Folio, planner, reduced motion and no-JavaScript reading); axe-core accessibility scan with no violations on any page at desktop and mobile; and a link, anchor, metadata and structured-data audit of every page. The switched-on enquiry, social and custom-domain paths were each rehearsed on a separate build.

## What the business needs to supply

Every item below is a setting, not development work. Empty settings show nothing, so the site never displays a fake contact or a dead link.

All settings except the domain live in `website/src/data/site.ts`.

| Supply | Setting | What changes on the site |
| --- | --- | --- |
| A form-delivery address (Formspree or any compatible service) | `enquiryEndpoint` | The planner sends each brief to Pardus as well as downloading it. The Contact page gains a message form. Planner, privacy and terms wording updates to match. |
| Business email | `email` | Shown on the Contact page, offered if a message fails to send, and added to search-engine business data. |
| WhatsApp number (international format, e.g. `+256 700 000 000`) | `whatsapp` | A "Message us on WhatsApp" link on the Contact page. |
| Instagram and TikTok profile links (full `https://` URLs) | `social.instagram`, `social.tiktok` | Links in the footer of every page, plus search-engine business data. |
| Cloudflare Web Analytics token (optional) | `analyticsId` | Cookieless visit statistics. The privacy page names the provider automatically. |
| Own domain | build settings (see below) | Every page address, the sitemap, `robots.txt` and link previews move to the new domain. |

After changing a setting, publish (see *Publishing a change*). Before announcing online enquiries, send a real test through the planner and the Contact page and confirm it arrives. The code path is rehearsed, but only a real test proves the inbox receives it.

## Moving to your own domain

1. Buy the domain. In the GitHub repository, open **Settings → Pages**, enter the domain under **Custom domain**, and turn on **Enforce HTTPS** once it is offered.
2. Create `website/public/CNAME` containing only the domain, e.g. `www.yourdomain.com`, so every export keeps it.
3. At your domain registrar, point DNS at GitHub Pages as GitHub's Pages documentation describes. Use a `CNAME` record from `www` to `cartelug.github.io`, and for the bare domain the four `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
4. Rebuild for the new address:

   ```sh
   cd website
   PARDUS_SITE=https://www.yourdomain.com PARDUS_BASE=/ npm run build
   node scripts/export-github.mjs
   PARDUS_BASE=/ npm run verify:export
   ```

5. Commit and push `main`. From then on, always build with those two values.

Business email addresses (the planned 10+ inboxes such as hello@ and bookings@) are set up with the email provider bought alongside the domain. They are not part of the website.

## Publishing a change

Use Node.js 22 or newer.

```sh
cd website
npm ci
npm run check
npm test
PARDUS_BASE=/paradise/ npm run build
node scripts/export-github.mjs
npm run verify:export
```

Then review the changes, commit the source and the regenerated root files together, and push `main`. GitHub Pages deploys within a few minutes. The export replaces all generated files at the repository root, so never edit those by hand; edit `website/` instead.

For the full browser regression, serve the repository so the export is available at `http://127.0.0.1:4180/paradise/` and run `python tests/browser-smoke.py` from `website/`. After a domain move, serve the export at the root and set `PARDUS_QA_BASE=http://127.0.0.1:4180`.

## Before promoting the site widely

These are business confirmations, not website tasks:

- **Photography rights.** Destination photos are illustrative stock images and the homepage artwork is AI-generated. The Travel.Explore sandbank scene has no recorded source. Confirm rights for each image before commercial use (`ASSETS.md`).
- **Font licence.** Confirm that the supplied Satoshi font files are licensed for public web use.
- **Commitments in the copy.** The Pardus way page describes a four-step process, including that prices and terms are made clear before a decision and that nothing is booked until the proposal is accepted. The business should be sure it will honour this.
- **Legal pages.** The privacy and terms pages describe this website only. Have them reviewed once the business identity, contact channels and booking terms are final.

## Known limits

- **Morocco and South Africa** are not included. Adding them needs properly licensed photography for each. Supply images, or source them from an environment that can reach stock-photo sites. The rest is one entry per destination in `website/src/data/destinations.ts`.
- **No content management system.** Text and content live in `website/src/data/*.ts` and page files, so edits go through the publishing steps above.
- **Hosting.** GitHub Pages cannot add custom security headers. If those become a requirement, the same build can be hosted on Cloudflare Pages or Netlify without code changes.

## Where things live

- `website/src/data/site.ts`: business settings, from the table above.
- `website/src/data/destinations.ts`, `journeys.ts` and `journal.ts`: all destination, journey and Journal content.
- `website/src/pages/`: page templates.
- `website/src/styles/`: design (colours, typography, layouts).
- `website/public/brand/`: the logo kit (primary, light and monochrome, SVG and PNG up to 4096 px), plus the 97 Design mark.
- `website/V20-MAINTENANCE.md`: content rules, image production, enquiry activation and QA.
- `ASSETS.md`: where every image came from.
