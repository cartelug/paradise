# Pardus Luxury Escapes

## Isolated HD headlines and native content — 25 October 2026

The hero now reads “Extraordinary journeys.” without the third line. Who We Are
uses separate regenerated HD desktop/mobile title artwork, real paragraphs,
service symbols and an About button over the existing scene. Feathered cleanup
masks remove only the old baked-in UI regions; the original scene remains the
base. The heading reveal and brief title-only light sweep wait for the permanent
opening to finish and for the section to enter view. Enlarged text, image errors,
no script and reduced motion remain supported. Assets, prompts and background
preservation details are in `website/source-assets/v37-hd-lettering/ARTWORK.md`.

## Photographic headline art and blended opening — 25 October 2026

The hero and “Your next escape” headings now use new generated transparent
lettering with luminous coastlines, Mediterranean architecture and mountains
inside selected letterforms. The actual wording stays native HTML, with
image-error, enlarged-text, no-script and print fallbacks. `opening-seams.css`
blends the hero into the colour of the real Section 02 artwork, then joins that
section into the existing coastal intro. The logo, navigation and leopard
photography retain their approved source. Masters and exact prompts are in
`website/source-assets/v36-immersive-lettering/`; the 42-case browser review
is in `website/tests/records/opening-v36-2026-10-25.json`.

## Who we are — 25 October 2026

Section 02 now appears directly after the existing hero using the owner's exact
gradient-blended desktop and mobile references: background, designed typography,
destination montage and symbols. A native Discover Pardus link opens the existing
About page, with visible keyboard focus and a minimum 44-pixel target. The full
heading, paragraph and services remain semantic HTML, and enlarged text,
image-failure, no-script, forced-colour and print modes use a normal-flow fallback.
Native-size lossless WebP exports match every RGB pixel in the approved masters.
See `website/source-assets/v35-who-we-are/ARTWORK.md`; the browser fixture is
`website/tests/section-two-qa.html`. The existing hero, permanent preloader,
navigation, prices, verified contacts and other sections are preserved.

## Illustrated mobile homepage — 24 October 2026

The mobile homepage now has a refined pale-sky leopard portrait, its own coastal continuation, transparent designed lettering for the first two headings, and 24 custom ivory/navy/brass travel illustrations. All 13 service choices, six destination headings/cards, three promises, the hero eyebrow and enquiry introduction use the new art. The exact tagline remains the semantic H1, while image-error, no-script and enlarged-text states show the real heading. Native checkboxes, prices, navigation, the approved logo and permanent preloader remain.

The visual system, exact built-in image-generation prompts, original PNGs, responsive exports and current browser evidence are documented in [website/source-assets/v34-mobile-illustrated/ARTWORK.md](website/source-assets/v34-mobile-illustrated/ARTWORK.md). Lettering and illustrations reveal gently, illustrated choices have selection feedback, and reduced motion removes these effects. The leopard stays calm and static. Phone copy remains in normal flow so wrapping pushes the complete animal safely lower. V33 desktop photography, the shared pale seam and the coastal fade remain. The browser fixture is `website/tests/section-one-qa.html`; its temporary public copy must not be exported. Historical V32/V33 masters and QA remain in their original folders.

The release passed 52 tests, clean Astro diagnostics, both export-base checks and 32 simulated Chrome layout cases (21 standard, 11 enlarged text). Image-error fallback, menu focus/scroll-lock reset and illustrated-checkbox planning were verified in the browser. Native PNGs, responsive dimensions and actual use of all 24 illustrations are checked against the export.

## Earlier releases

V31 is the launch release for **https://pardusescapes.com**: a new owner-approved leopard hero (a resting leopard in left profile with travel scenes woven into its coat), the four live mailboxes, an own-domain build and a ready-to-upload cPanel zip. See the V31 section at the top of [HANDOVER.md](HANDOVER.md).

The 23 October refinement fixes wrapping and card alignment across phones, tablets and desktops, and adds eight illustrative Dubai scenes. The complete card, live-text, SVG-symbol and asset plan is in [website/VISUAL_GENERATION_PLAN.md](website/VISUAL_GENERATION_PLAN.md); exact generation prompts and source dimensions accompany the photography masters. Current typography is **Archivo only**, as recorded in `CLAUDE.md`.

The [23 October responsive QA report](website/RESPONSIVE_QA_2026-10-23.md) records 408 passing browser layout cases across all 33 routes, all six standard phone sizes, tablet/desktop widths, homepage breakpoints and doubled root-font size. These are CSS-viewport checks, not physical-device certification.

V30 is the blue-hour redesign. It restored the V25 leopard hero and preloader and established the shared gradients, scroll-linked motion, full-screen mobile menu and SVG icon set. V31 replaced the layered hero with the approved single artwork; its only continuous motion is a calm, slow scale. Typography changed to Archivo on 23 October. There are no emoji anywhere on the site.

**The preloader is permanent.** It must be present in every build. See [CLAUDE.md](CLAUDE.md) and `website/tests/preloader.test.mjs`, which fails the release if it is removed.

Live website: https://pardusescapes.com (after the cPanel upload). GitHub Pages copy: https://cartelug.github.io/paradise/

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

Own domain (pardusescapes.com on Namecheap cPanel), after the GitHub Pages steps above:

```sh
npm run build:domain                 # PARDUS_SITE=https://pardusescapes.com, PARDUS_BASE=/, into website/dist
PARDUS_BASE=/ npm run verify:export  # checks website/dist: links, canonicals, sitemap, robots.txt, .htaccess
npm run package:cpanel               # website/release/pardus-site-cpanel.zip (the contents of dist)
```

Never run `export:github` after `build:domain`; the export refuses a root build.

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
- `website/src/components/Hero.astro` and `website/src/scripts/hero-reference.ts`: the static photographic hero using V33 desktop and V34 phone art, with measured animal bounds. The script decodes the transparent headings and handles image-error/enlarged-text fallbacks without moving the leopard. `hero-life.ts` belongs to historical V31.
- `website/src/components/ArtHeading.astro`, `HomeEmblem.astro`, `styles/illustrated-home.css` and `data/home-illustrations.ts`: transparent designed headline art, the 24 decorative illustrations and their homepage placements. `scripts/prepare-illustrated-home.mjs` requires the full collection and prepares alpha-preserving WebP/AVIF assets; `--partial` is for development only.
- `website/src/components/ServicePicker.astro` with `scripts/picker.ts`: the "What should we arrange?" picker (a plain GET form that sends `?services=` to the enquiry). `StickyCta.astro` is the floating "Plan your escape" button on phones.
- `website/src/components/FontFaces.astro`: local variable font declarations and preloads.
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
