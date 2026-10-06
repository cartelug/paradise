# Pardus Luxury Escapes — V26

A luxury travel website in midnight navy with a living leopard-and-travel hero, a cinematic approved-logo preloader, real destination photography and direct enquiries in USD. The leopard now breathes, turns its head, blinks, flicks its ears and responds to the pointer independently of the drifting scenery. WebGL has a Canvas fallback, with the original artwork retained if graphics or assets are unavailable. Motion pauses off-screen and in hidden tabs, and honors operating-system reduced-motion settings.

Live website: https://cartelug.github.io/paradise/

The revised four-page concept note is available at `documents/PARDUS_Luxury_Escapes_Concept_Note.pdf`. See [HANDOVER.md](HANDOVER.md) for business settings and ongoing updates.

## Source and publishing

Edit the Astro source in `website/`. The HTML and assets at the repository root are generated GitHub Pages output. Commit source and generated output together.

```sh
cd website
npm ci
npm run check
npm test
PARDUS_BASE=/paradise/ npm run build
npm run export:github
npm run verify:export
```

Push `main` after reviewing the export. Node.js 22 or newer is required. Local development uses a `/` base; GitHub Pages uses `/paradise/`.

## Editing

- `website/src/data/offers.ts`: suggested stays, experiences and illustrative USD prices, inclusions and price bases.
- `website/src/data/site.ts`: contacts and optional delivery/analytics settings.
- `website/src/pages/`: page content and layouts.
- `website/src/styles/luxury.css`: core design and responsive layouts.
- `website/src/styles/studio.css`: V26 layered scenery, animated artwork, logo opening and premium surfaces.
- `website/src/scripts/leopard-motion.ts` and `leopard-canvas.ts`: independent animal motion, GPU and Canvas rendering, bounded raster sizes and lifecycle controls.
- `website/tests/leopard.test.mjs`: deterministic lifecycle, failure, reduced-motion and responsive-buffer checks; these do not replace browser rendering checks.
- `website/source-assets/v26/ARTWORK.md`: leopard/eyelid layers and clean scenery plate provenance.
- `website/scripts/prepare-v26-assets.mjs`: regenerate the responsive scenery and transparent leopard layers.
- `website/source-assets/v25/ARTWORK.md`: built-in generation prompts, master paths and provenance.
- `website/scripts/prepare-v25-assets.mjs`: regenerate desktop and portrait AVIF/WebP artwork.
- `website/src/styles/cinematic.css` and `website/src/scripts/cinematic.ts`: resource-aware introduction, hero pointer depth, reveal and hover motion.
- `website/source-assets/v24-photography/credits.json`: verified photo locations, upload dates, sources and licences.
- `website/scripts/prepare-v24-photography.mjs`: regenerate the eight responsive photo families.
- `website/scripts/make-concept-note.py`: regenerate the PDF after updating offer data.
- `website/scripts/update-travel-desk.py`: fetch the official Uganda CAA news feed.
- `.github/workflows/travel-desk.yml`: refresh travel updates daily.

At the client’s request, all six destinations and four cruise ideas now show **illustrative sample prices in USD**, with their inclusions and price basis. These are design examples, not supplier quotes or bookable offers. Replace the figures with verified rates and set `sample: false` only when approved. Regenerate the PDF and website together.

Enquiries prepare an email draft for the visitor to send, or download a text brief. Direct server delivery remains disabled until a real endpoint is connected and tested. The existing saved Folio, optional detailed planner, journey ideas and Journal remain available.
