# Pardus Luxury Escapes — V3

An editorial travel website built with Astro. V3 adds a quieter overlaid navigation system, a cinematic Pardus planning studio, practical homepage field notes and fail-safe scroll choreography to the 29-page V2 architecture. The experience includes responsive photography, six flexible journey concepts, the locally saved Pardus Folio, a four-stage journey planner, keyboard navigation, and an animated opening made from the approved Pardus logo.

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

Satoshi, Montserrat and Fraunces are self-hosted. Satoshi and Montserrat are supplied as WOFF2 files; the live site makes no Fontshare request. Photography has AVIF and WebP variants with responsive sources. The approved navy and gold logo is reconstructed as transparent vector paths, with primary, light and monochrome SVGs and transparent PNG exports up to 4096 pixels wide. The leopard, aircraft and lettering animate independently during the opening.

The introduction runs once per tab session, can be skipped or replayed, and has a hard timeout. Reduced motion bypasses it and disables decorative movement. Page content remains accessible without JavaScript. Mobile navigation and the Pardus Folio use native dialogs; collection tabs and filters support keyboard use. The Folio stores selected signals and saved chapters locally for 30 days, requires no account, and sends nothing by itself.

## Journey planner and outstanding integrations

The planner creates a local downloadable text brief. It does **not** submit enquiries, reserve travel, take payment or promise availability while the verified endpoint remains unset. The interface states this before the visitor starts and when the brief is downloaded. Planner drafts use session storage so Back navigation and accidental refreshes do not erase the current brief; the draft expires when the browser session ends.

Business email and WhatsApp details remain unset in `src/data/site.ts` until verified contacts are supplied. A production lead-delivery integration, business-approved legal details, analytics and CMS accounts require separate configuration. Do not change the interface to claim that an enquiry was sent without implementing and verifying delivery.

Destination copy and images are illustrative. See `ASSETS.md` for the existing photography sources. No fabricated ratings, client counts, supplier affiliations or prices are included.

## Editing

- `src/pages/`: homepage, destination collection and detail pages, service pages, journey planner, contact, privacy, terms and 404.
- `src/data/destinations.ts`: destination dossiers and planning context.
- `src/data/journeys.ts`: journey concepts and Folio signals.
- `src/data/journal.ts`: accountable editorial records with author and dates.
- `src/styles/global.css`, `editorial.css`, `v2.css`, `v3.css`: foundations, editorial layer, V2 product architecture and V3 art direction.
- `src/scripts/site.ts`: navigation, filters and planner orchestration.
- `src/scripts/folio.ts`: local Folio state, dialog and planner handoff.
- `src/scripts/brief.ts`: brief data handling and date validation.
- `public/brand/`: final transparent logo assets.
- `scripts/prepare-brand.mjs`: reconstructs the logo from the original approved 1536 × 864 JPEG.
- `scripts/prepare-images.mjs`: produces local AVIF and WebP derivatives.

Read `V3-MAINTENANCE.md` before changing content or releasing. Run source checks, tests, the production build and rendered browser QA after editing. Delivery integrations require a real end-to-end test; a successful build alone does not prove that an enquiry reached Pardus.
