# Pardus Luxury Escapes: V30.3

V30 is the blue-hour redesign. It restores the V25 leopard hero (rebuilt in layers in V30.2 so the leopard is gently alive and, since V30.4, calm: it breathes, sways a little and blinks slowly, and never glows, follows the visitor or reacts to a touch; gold pins on the skyline, villas and yacht show what each costs) and the V25 preloader, and rebuilds every page on one design system: Archivo throughout (bold headlines, true italic accents), gradient sections that share colours at their seams, scroll-linked motion, a full-screen mobile menu and one SVG icon set. There are no emoji anywhere on the site.

**The preloader is permanent.** It must be present in every build. See [CLAUDE.md](../CLAUDE.md) and `website/tests/preloader.test.mjs`, which fails the release if it is removed.

Live website: https://cartelug.github.io/paradise/

The four-page concept note is at `documents/PARDUS_Luxury_Escapes_Concept_Note.pdf`. See [HANDOVER.md](../HANDOVER.md) for business settings and ongoing updates, and `website/V30-DESIGN.md` for the design plan.

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

Optional browser check (Python Playwright, any Chromium): serve the repository root under `/paradise/` and run `python tests/browser-smoke.py`. It covers the preloader, hero, mobile menu, every route at five widths, filters, saved trips, the planner and the enquiry downloads. Set `PARDUS_QA_CHROMIUM` to use a specific browser. Then run `python tests/mobile-fit.py`: it fails if any text spills out of a button, tile, card or link, if a page scrolls sideways, or if a tap target is under 44 px, on every page at six phone widths and at 200% text size.

## Editing

- `website/src/styles/base.css`: tokens, type scale, section gradients, buttons, forms and shared components.
- `website/src/styles/chrome.css`: header, mobile menu, saved-trips drawer and footer.
- `website/src/styles/hero.css`: the hero for every screen size (landscape art with copy on the left, portrait art on phones and portrait screens).
- `website/src/styles/home.css`: the homepage sections, including the service picker and the floating phone button.
- `website/src/styles/pages.css`: inner page headers, cards, destination pages, planner, journal and legal pages.
- `website/src/styles/motion.css`: arrival and scroll-reveal motion and the reduced-motion rules.
- `website/src/styles/preloader.css`, `website/src/components/CinematicIntro.astro`, `website/src/scripts/preloader.ts`: the preloader. Do not remove.
- `website/src/scripts/ui.ts`: header behaviour, mobile menu, scroll motion, pause control. `site.ts` holds the filters, journal and planner logic.
- `website/src/data/icons.ts` with `Icon.astro` and `IconSprite.astro`: the SVG icon set.
- `website/src/components/Hero.astro` and `website/src/scripts/hero-life.ts`: the V31 homepage hero. One art-directed picture (`pardus-hero-desktop-*` and `pardus-hero-phone-*`, from `website/source-assets/v31-hero/`, see its `ARTWORK.md`) shown at its native shape; the leopard's outline is a list of measured rectangles in `Hero.astro`; the script only places the pins. The only motion is a slow 1.00 to 1.03 scale (`hero-breathe` in `hero.css`).
- `website/src/components/ServicePicker.astro` with `scripts/picker.ts`: the "What should we arrange?" picker (a plain GET form that sends `?services=` to the enquiry). `StickyCta.astro` is the floating "Plan your escape" button on phones.
- `website/src/components/FontFaces.astro`: the font registry (Sky Text and MTN Brighter Sans, self-hosted), metric-matched fallbacks and preloads; `website/src/styles/type.css` applies the type roles.
- `website/src/data/offers.ts`: destination stays, experiences, starting USD prices, inclusions and price bases. Regenerate the concept note after a change.
- `website/src/data/site.ts`: the primary tagline, the five navigation labels, contacts (info@, bookings@, support@ and director@pardusescapes.com, phone, WhatsApp), verified company details (`credentials`), and optional delivery (`enquiryEndpoint`, or `PUBLIC_PARDUS_ENQUIRY_ENDPOINT` at build) and analytics settings.
- `website/src/pages/`: page content and layouts.
- `website/source-assets/v25/ARTWORK.md`: prompts and provenance of the hero artwork.
- `website/source-assets/v24-photography/credits.json`: verified photo locations, sources and licences.
- `website/scripts/make-concept-note.py`: regenerate the PDF after updating offer data.
- `website/scripts/update-travel-desk.py` and `.github/workflows/travel-desk.yml`: the daily official-news refresh.
- `.agents/skills/`: project design and interface-review guidance.

The destination presentation keeps the supplied starting USD prices. Availability, the itinerary and the final price are confirmed for the traveller's dates before booking. Rate changes belong in `website/src/data/offers.ts`.

The enquiry form requires a name and an email and offers phone or WhatsApp. Until a real endpoint is connected it prepares an email draft for the visitor to send; once `enquiryEndpoint` is set it sends the enquiry straight to Pardus and shows a confirmation (`website/tests/online-enquiry.py` checks that flow against a scratch build). Saving a copy of the enquiry is optional. Saved trips, the detailed planner, journey ideas and the Journal remain available.

## V30.2 validation

Astro check passes for 80 files with no errors, warnings or hints. All 38 tests pass, including the preloader guard and the hero, pin and picker tests against the exported `index.html`. The browser smoke test passes for the preloader (first visit, Skip, Escape, once per tab, reduced motion); the leopard clearance at 19 screen sizes, including its extreme head turns; the hero pins at 14 screen sizes (never touching the copy, buttons, price bar, header, leopard or each other); the leopard's animation (breathing, glowing eyes, gaze by pointer and finger, Pause scene, a still picture for reduced motion); the phone first screen on four phone sizes; the service picker with and without JavaScript; the hero and mobile menu; 33 routes at 320, 390, 768, 1024 and 1440 px (no script errors, failed requests, broken images or horizontal overflow); the filters, saved trips, planner and enquiry flows; and the no-JavaScript and reduced-motion fallbacks. An axe-core audit reports no violations. Real-device measurements are not claimed: the phone page weight (about 660 KB) and timings were measured in a throttled desktop browser.
