# Pardus Luxury Escapes — V27

A luxury travel website with a newly composed blue-hour island hero, seamless photographic leopard motion, a shorter approved-logo opening and a redesigned cream-and-navy homepage. Separate landscape and portrait scenes keep the head and both ears in frame. Breathing, small head and ear movements, natural blinks, water reflections and a slow camera push are rendered from one continuous opaque image, avoiding the former animal cutout seam. Graphics and loading failures retain the photographic poster; motion pauses off-screen and in hidden tabs, and honors reduced-motion preferences.

Live website: https://cartelug.github.io/paradise/

The revised four-page concept note is available at `documents/PARDUS_Luxury_Escapes_Concept_Note.pdf`. See [HANDOVER.md](../HANDOVER.md) for business settings and ongoing updates.

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
- `website/src/styles/atelier.css`: V27 hero framing, typography, homepage surfaces and approved-logo opening.
- `website/src/scripts/hero-film.ts`: the continuous opaque scene renderer, eyelid blending and Canvas fallback.
- `website/tests/leopard.test.mjs`: deterministic lifecycle, failure, reduced-motion, raster and head/ear framing checks.
- `website/source-assets/v27/ARTWORK.md`: exact built-in generation/edit prompts, native masters and rendering provenance.
- `website/scripts/prepare-v27-assets.mjs`: regenerate responsive AVIF/WebP hero artwork and blink companions.
- `website/scripts/render-hero-qa.py`: compile and render the shipped GLSL with Mesa/EGL; optional motion video.
- `documents/PARDUS_V27_Motion_Preview.mp4`: 12-second renderer preview; this is not a browser screenshot.
- `website/src/styles/studio.css`: retained base styles from earlier releases.
- `website/source-assets/v25/` and `v26/`: earlier artwork and motion sources, retained for history.
- `website/src/styles/cinematic.css` and `website/src/scripts/cinematic.ts`: resource-aware introduction, hero pointer depth, reveal and hover motion.
- `website/source-assets/v24-photography/credits.json`: verified photo locations, upload dates, sources and licences.
- `website/scripts/prepare-v24-photography.mjs`: regenerate the eight responsive photo families.
- `website/scripts/make-concept-note.py`: regenerate the PDF after updating offer data.
- `website/scripts/update-travel-desk.py`: fetch the official Uganda CAA news feed.
- `.github/workflows/travel-desk.yml`: refresh travel updates daily.

At the client’s request, all six destinations and four cruise ideas now show **illustrative sample prices in USD**, with their inclusions and price basis. These are design examples, not supplier quotes or bookable offers. Replace the figures with verified rates and set `sample: false` only when approved. Regenerate the PDF and website together.

Enquiries prepare an email draft for the visitor to send, or download a text brief. Direct server delivery remains disabled until a real endpoint is connected and tested. The existing saved Folio, optional detailed planner, journey ideas and Journal remain available.

V27 validation: Astro check has zero errors, warnings or hints; all 23 tests pass. Mesa/EGL rendered and inspected the actual shaders on desktop and phone canvases, including closed-eye frames, with opaque output throughout. Fresh browser layout and real-device QA were unavailable. Production build and export verification cover all 33 pages.
