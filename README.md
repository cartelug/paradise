# Pardus Luxury Escapes — V28

The V28 typography and motion release pairs local variable Newsreader headlines with Manrope body text and controls. It adds a shared responsive type scale, clearer phone copy, stronger actions, a shorter introduction and a persistent Pause scene control. The existing blue-hour photographic campaign, approved logo, routes and offer data are retained. Optional scene motion pauses off-screen, in hidden tabs and under reduced motion, with a static image fallback.

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

- `website/src/components/FontFaces.astro`: local variable font declarations and critical preloads.
- `website/src/styles/typography.css`: final shared font families, responsive scales and type details.
- `website/src/styles/motion.css`: final interaction timing, hero arrival and reduced-motion variants.
- `.agents/skills/`: project design and interface-review guidance.
- `website/FONT_MOTION_NOTES.md`: font provenance, motion behavior and verification limits.
- `website/src/data/offers.ts`: destination stays, experiences, starting USD prices, inclusions and price bases.
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
- `website/src/styles/site.css` (`@layer tokens`): the single source for shared colour and spacing tokens. Other stylesheets add only namespaced tokens and must not redefine `--ink`, `--paper`, `--gold`, `--gutter` and the rest.
- `website/src/styles/polish.css`: retained shared finishing styles; cross-cutting focus rings (`--focus-ring` per surface), text wrapping, price numerals, touch hover and view transitions. Keep page layout out of it.
- `website/src/components/BrandSprite.astro`: the logo paths, defined once per page; `Brand.astro` references them with `<use>`.
- `website/source-assets/v25/` and `v26/`: earlier artwork and motion sources, retained for history.
- `website/src/styles/cinematic.css` and `website/src/scripts/cinematic.ts`: resource-aware introduction, hero pointer depth, reveal and hover motion.
- `website/source-assets/v24-photography/credits.json`: verified photo locations, upload dates, sources and licences.
- `website/scripts/prepare-v24-photography.mjs`: regenerate the eight responsive photo families.
- `website/scripts/make-concept-note.py`: regenerate the PDF after updating offer data.
- `website/scripts/update-travel-desk.py`: fetch the official Uganda CAA news feed.
- `.github/workflows/travel-desk.yml`: refresh travel updates daily.

The final destination presentation retains the starting USD prices from the supplied website content. Photography is clear of duration badges, captions and repeated prices. Inclusions and the per-person or per-charter basis appear beside the enquiry action. Availability, the selected itinerary and the final price are confirmed for the traveller's dates before booking. Rate changes belong in `website/src/data/offers.ts`; regenerate the concept note and website together.

Enquiries prepare an email draft for the visitor to send, or download a text brief. Direct server delivery remains disabled until a real endpoint is connected and tested. The existing saved Folio, optional detailed planner, journey ideas and Journal remain available.

Previous V27 validation: Astro check has zero errors, warnings or hints; all 23 tests pass. Mesa/EGL rendered and inspected the actual shaders on desktop and phone canvases, including closed-eye frames, with opaque output throughout. Fresh browser layout and real-device QA were unavailable. Production build and export verification cover all 33 pages.

V28 validation: Astro check passes for 73 files with zero errors, warnings or hints. All 25 tests pass, including saved-pause and initial reduced-motion behavior. The production build contains all 33 pages. Local browser preview is unavailable in this environment; real-device and performance measurements are not claimed.
