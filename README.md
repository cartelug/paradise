# Pardus Luxury Escapes: V30

V30 is the blue-hour redesign. It restores the V25 leopard hero and the V25 preloader, and rebuilds every page on one design system: Montserrat throughout (bold headlines, true italic accents), gradient sections that share colours at their seams, scroll-linked motion, a full-screen mobile menu and one SVG icon set. There are no emoji anywhere on the site.

**The preloader is permanent.** It must be present in every build. See [CLAUDE.md](CLAUDE.md) and `website/tests/preloader.test.mjs`, which fails the release if it is removed.

Live website: https://cartelug.github.io/paradise/

The four-page concept note is at `documents/PARDUS_Luxury_Escapes_Concept_Note.pdf`. See [HANDOVER.md](HANDOVER.md) for business settings and ongoing updates, and `website/V30-DESIGN.md` for the design plan.

## Source and publishing

Edit the Astro source in `website/`. The HTML and assets at the repository root are generated GitHub Pages output. Commit source and generated output together.

```sh
cd website
npm ci
npm run check
PARDUS_BASE=/paradise/ npm run build
npm run export:github
npm test            # run after the export: it also checks the exported index.html
npm run verify:export
```

Node.js 22 or newer is required. Local development uses a `/` base; GitHub Pages uses `/paradise/`. Push `main` after reviewing the export.

Optional browser check (Python Playwright, any Chromium): serve the repository root under `/paradise/` and run `python tests/browser-smoke.py`. It covers the preloader, hero, mobile menu, every route at five widths, filters, saved trips, the planner and the enquiry downloads. Set `PARDUS_QA_CHROMIUM` to use a specific browser.

## Editing

- `website/src/styles/base.css`: tokens, type scale, section gradients, buttons, forms and shared components.
- `website/src/styles/chrome.css`: header, mobile menu, saved-trips drawer and footer.
- `website/src/styles/home.css`: the hero and homepage sections.
- `website/src/styles/pages.css`: inner page headers, cards, destination pages, planner, journal and legal pages.
- `website/src/styles/motion.css`: arrival and scroll-reveal motion and the reduced-motion rules.
- `website/src/styles/preloader.css`, `website/src/components/CinematicIntro.astro`, `website/src/scripts/preloader.ts`: the preloader. Do not remove.
- `website/src/scripts/ui.ts`: header behaviour, mobile menu, scroll motion, pause control. `site.ts` holds the filters, journal and planner logic.
- `website/src/data/icons.ts` with `Icon.astro` and `IconSprite.astro`: the SVG icon set.
- `website/src/components/Hero.astro`: the homepage hero (V25 artwork in `public/images/pardus-hero-*-v25-*`).
- `website/src/components/FontFaces.astro`: local variable font declarations and preloads.
- `website/src/data/offers.ts`: destination stays, experiences, starting USD prices, inclusions and price bases. Regenerate the concept note after a change.
- `website/src/data/site.ts`: contacts and optional delivery and analytics settings.
- `website/src/pages/`: page content and layouts.
- `website/source-assets/v25/ARTWORK.md`: prompts and provenance of the hero artwork.
- `website/source-assets/v24-photography/credits.json`: verified photo locations, sources and licences.
- `website/scripts/make-concept-note.py`: regenerate the PDF after updating offer data.
- `website/scripts/update-travel-desk.py` and `.github/workflows/travel-desk.yml`: the daily official-news refresh.
- `.agents/skills/`: project design and interface-review guidance.

The destination presentation keeps the supplied starting USD prices. Availability, the itinerary and the final price are confirmed for the traveller's dates before booking. Rate changes belong in `website/src/data/offers.ts`.

Enquiries prepare an email draft for the visitor to send, or download a text brief. Direct server delivery stays disabled until a real endpoint is connected and tested. Saved trips, the detailed planner, journey ideas and the Journal remain available.

## V30 validation

Astro check passes for 74 files with no errors, warnings or hints. All 29 tests pass, including the preloader guard against the exported `index.html`. The browser smoke test passes for the preloader (first visit, Skip, Escape, once per tab, reduced motion), the hero, the mobile menu, 33 routes at 320, 390, 768, 1024 and 1440 px (no script errors, failed requests, broken images or horizontal overflow), the filters, saved trips, planner and enquiry flows, and the no-JavaScript and reduced-motion fallbacks. An axe-core audit of 18 pages at 1440 and 390 px reports no violations. Real-device and performance measurements are not claimed.
