# Pardus Luxury Escapes

An editorial travel website built with Astro. The V2 experience includes 29 static pages, responsive destination photography, six flexible journey concepts, the locally saved Pardus Folio, a four-stage journey planner, keyboard navigation, and an animated opening made from the approved Pardus logo.

Live website: https://cartelug.github.io/paradise/

## Repository structure

- `website/`: maintained Astro source, components, design tokens, public assets, scripts and tests.
- Root HTML, `static/`, `images/`, `brand/` and `opening.js`: generated GitHub Pages output.
- `ASSETS.md`: photography provenance and logo information.

The published output is committed so GitHub Pages can continue deploying from `main` at the repository root. Edit the source in `website/`, then rebuild and export; generated HTML is not the authoring surface.

## Development and publishing

Use Node.js 24.

```sh
cd website
npm ci
npm run dev
```

For GitHub Pages:

```sh
npm run check
npm test
PARDUS_BASE=/paradise/ npm run build
node scripts/export-github.mjs
```

Review the generated changes, commit them with the source, and push `main`. The default base path is `/` for local development; the Pages build must use `/paradise/`.

## Design and behaviour

Satoshi, Montserrat and Fraunces are self-hosted. The live site makes no remote font request. Photography has AVIF and WebP variants with responsive sources. The approved navy and gold logo is reconstructed as transparent vector paths, with primary, light and monochrome SVGs and transparent PNG exports up to 4096 pixels wide. The leopard, aircraft and lettering animate independently during the opening.

The homepage uses separate AI-generated desktop and mobile hero compositions. The exact Pardus leopard mark remains a real vector overlay, keeping the brand crisp while the cinematic world-travel artwork art-directs each viewport. Scroll motion uses progressive reveal groups, image depth and a slim reading-progress line, with all decorative motion removed when reduced motion is requested.

The introduction runs once per tab session, can be skipped or replayed, and has a hard timeout. Reduced motion bypasses it and disables decorative movement. Page content remains accessible without JavaScript. Mobile navigation and the Pardus Folio use native dialogs; filters support keyboard use. Folio choices remain on the visitor's device for 30 days and send nothing by themselves.

## Journey planner and outstanding integrations

The planner creates a local downloadable text brief. It does **not** submit enquiries, reserve travel, take payment or promise availability while the verified endpoint remains unset. The interface states this before the visitor starts and when the brief is downloaded. Planner drafts use session storage to protect the current brief and expire when the browser session ends.

Business email and WhatsApp details remain unset in `src/data/site.ts` until verified contacts are supplied. A production lead-delivery integration, business-approved legal details, analytics and CMS accounts require separate configuration. Do not change the interface to claim that an enquiry was sent without implementing and verifying delivery.

Destination copy and images are illustrative. See `ASSETS.md` for the existing photography sources. No fabricated ratings, client counts, supplier affiliations or prices are included.

## Editing

- `website/src/pages/`: public pages and generated destination, journey and Journal routes.
- `website/src/data/`: destination, journey, Journal and business sources of truth.
- `website/src/styles/`: foundations, editorial styles and V2 component rules.
- `website/src/scripts/`: Folio, filters, planner and delivery behaviour.
- `website/public/brand/`: final transparent logo assets.
- `website/V2-MAINTENANCE.md`: content, integration, QA and release rules.

Run source checks, tests, the production build and rendered browser QA after editing. Delivery integrations require a real end-to-end test; a successful build alone does not prove that an enquiry reached Pardus.
