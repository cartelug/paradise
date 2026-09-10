# Pardus Luxury Escapes

An editorial travel website built with Astro. The experience includes 15 static pages, responsive destination photography, a personal journey planner, keyboard navigation, and an animated opening made from the approved Pardus logo.

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

Fraunces and Plus Jakarta Sans are self-hosted. Photography has AVIF and WebP variants with responsive sources. The approved navy and gold logo is reconstructed as transparent vector paths, with primary, light and monochrome SVGs and transparent PNG exports up to 4096 pixels wide. The leopard, aircraft and lettering animate independently during the opening.

The introduction runs once per tab session, can be skipped or replayed, and has a hard timeout. Reduced motion bypasses it and disables decorative movement. Page content remains accessible without JavaScript. Mobile navigation uses a native dialog; collection tabs and filters support keyboard use. No third-party scripts are loaded.

## Journey planner and outstanding integrations

The planner creates a local downloadable text brief. It does **not** submit enquiries, reserve travel, take payment or promise availability. The interface states this before the visitor starts and when the brief is downloaded. Personal planner entries are not stored in browser storage.

Business email and WhatsApp details remain unset in `src/data/site.ts` until verified contacts are supplied. A production lead-delivery integration, business-approved legal details, analytics and CMS accounts require separate configuration. Do not change the interface to claim that an enquiry was sent without implementing and verifying delivery.

Destination copy and images are illustrative. See `ASSETS.md` for the existing photography sources. No fabricated ratings, client counts, supplier affiliations or prices are included.

## Editing

- `src/pages/`: homepage, destination collection and detail pages, service pages, journey planner, contact, privacy, terms and 404.
- `src/data/destinations.ts`: destination content.
- `src/styles/global.css`: design tokens, responsive layouts and motion.
- `src/scripts/site.ts`: opening, navigation, destination controls and planner.
- `src/scripts/brief.ts`: brief data handling and date validation.
- `public/brand/`: final transparent logo assets.
- `scripts/prepare-brand.mjs`: reconstructs the logo from the original approved 1536 × 864 JPEG.
- `scripts/prepare-images.mjs`: produces local AVIF and WebP derivatives.

Run source checks, the focused brief tests and the production build after editing. Browser rendering and delivery integrations should be verified separately; a successful build does not measure real-user performance.
