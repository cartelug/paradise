# Pardus Luxury Escapes — Final destination presentation

Release: 7 October 2026. Published from `main` at https://cartelug.github.io/paradise/.

## V30.1 refinements (14 October 2026)

- **Type:** Montserrat only, site-wide: bold headlines (700, tight tracking) with the true Montserrat italic for gold accent words, and the same family for body, labels, prices and buttons. No other typeface is loaded. See `website/FONT_MOTION_NOTES.md`.
- **The leopard is never covered.** The hero art box now matches the photograph exactly, and an invisible `[data-leopard-box]` marks the leopard. On wide screens the headline and price rail are held to the left two thirds; on phones and portrait screens the copy sits above the art and the rail below it. The browser smoke `leopard` phase measures the overlap at many window sizes.
- **Preloader on every page.** The first page of a visit plays the full V25 opening. Later pages show a short version (curtains, logo and the page name), timed to how long the page needs to be ready, and internal links close the curtains before leaving. Skip, Escape, the failsafe timer and the back/forward cache all release the visitor. The layout has no switch to turn it off, and the tests check every built page.
- **"Your next escape"** is a scroll-driven stage on large screens: the Maldives, Seychelles and Dubai take turns with a photograph wipe, a route line with a plane, tabs, and the place name as an outlined watermark. Smaller screens and reduced motion get stacked chapters. "More places" shows East Africa, Europe and Zanzibar.
- The desktop navigation now starts at 1200 px; narrower windows use the menu button so the links never wrap.

## V30 blue-hour redesign (14 October 2026)

The site owner found V29 flat and unattractive: no section gradients, an odd condensed typeface and little scroll motion. V30 restores the V25 hero (leopard, overwater villas, Dubai skyline at sunset, yacht) and rebuilds every page on one design system.

**Hard rule: the preloader is permanent.** The V25 opening (gold logo trace, wordmark, aircraft, meridian globe and route arcs, two curtains opening onto the hero) must be present in every build. It plays once per browser tab on the homepage. Skip introduction, Escape and a failsafe timer always release the visitor, and visitors who prefer reduced motion see a still brand screen instead of the animation. V29 had removed it; V30 restores it and adds `website/tests/preloader.test.mjs`, which fails the release if the files, the markup, the layout wiring or the exported `index.html` lose it. The rule is also recorded in `CLAUDE.md` for future sessions.

What changed:

- Palette from the hero photograph (midnight, lagoon teal, champagne, ember, ivory). Sections carry gradients and share colours at their seams; a soft haze joins dark and light sections.
- Type: Montserrat only (V30.1): bold tightly spaced headlines, true italic for gold accent words, and the same family for body, labels, prices and controls. All earlier display faces (Instrument Serif, Newsreader, Cormorant Garamond) were removed.
- Scroll motion: a header that blurs after 40 px, hides on scroll down and returns on scroll up, with a gold progress line; hero parallax and fade; word-by-word heading reveals; staggered card reveals; photographs that clip in and drift inside their frames; the yacht band scales as it enters. Reduced motion removes all of it, and a Pause scene control stops the hero drift.
- Mobile menu: a full-height dialog with an SVG symbol for each destination, the current page marked, large tap targets, the main action and email pinned at the foot, scroll lock, Escape, focus return and safe-area spacing. It closes itself if the window grows to the desktop layout.
- One SVG icon set (`website/src/data/icons.ts`). No emoji and no text glyphs used as icons.
- Saved trips (formerly the Folio) is a side drawer. Journey pages keep their save buttons.
- Every inner page opens with the same dark photographic header, and the destination and cruise pages carry a summary card that overlaps it.
- Removed: the V27 WebGL leopard renderer and its tests, the V29 walking-leopard hero, the twelve layered V20 to V29 stylesheets, gsap and the retired components. `public/opening.js` (the V25 loader script, loaded by no page) was left in place.

Existing prices, destinations, journey ideas, journal entries, the approved logo, travel desk and enquiry behaviour are unchanged.

## Final destination sections

The signature islands now use alternating photograph-and-detail panels on desktop and a single-column reading order on phones. All destination photography is clear of price overlays and duration badges. Inclusions use shared line icons, with one price and one planning action per card. The popular-escape prices sit below the homepage hero, separate from the artwork. Dubai uses the same destination component; service features are grouped by travel essentials, experiences, occasions and tailored journeys.

Every destination and the cruise page now separates its opening photograph from the heading and booking details. Destination pages include a clear inclusion summary, travel experiences, traveller suitability and timing considerations. Photo captions and sample labels were removed across published HTML, and the downloadable concept note was regenerated with matching wording. Starting figures and inclusions are retained from the supplied website; the itinerary and final price are confirmed for the selected dates.

`website/src/styles/escapes.css` owns this final presentation. Shared source components are `EscapeCard`, `OfferPrice`, `OfferInclusions` and `TravelIcon`. Previous release notes below describe their respective historical states.

## CSS polish and upgrade (October 2026)

A source cleanup and polish pass on top of V27, without a redesign:

- Shared tokens (`--ink`, `--navy`, `--paper`, `--sand`, `--gold`, `--gold-dark`, `--muted`, `--line`, `--gutter`) now have one definition in `site.css`. Four competing redefinitions were removed; the values kept are the ones that already won, so colours are unchanged.
- 608 selectors, 526 rules and 38 keyframes that matched no markup (V20 homepage, V23 walking sprite, V25 curtain intro) were removed, along with the unused `home.css`. Before/after screenshots of all 33 pages at 1440 px and 390 px were pixel-identical.
- Legibility: the hero price rail stacks each price under its destination so columns no longer collide. Text that was 9–10 px (hero eyebrow, rail labels, service numbers, Journal bylines and meta, planner progress) is now 11–12 px, and phone hero buttons are 13 px.
- Focus: every focusable element has a ring of at least 3:1 against its background (1,271 checked across 33 pages); homepage form fields show a clear focus edge.
- `polish.css` adds balanced headings, tabular price numerals, brand-coloured native controls, touch-safe hovers, forced-colours focus and cross-page view transitions (off under reduced motion).
- The logo is defined once per page and reused, cutting HTML weight by about 40–57% (about.html 72 KB → 31 KB, index.html 123 KB → 79 KB) with identical rendering.

`public/opening.js` is the retired V25 loader script. No page loads it; the active preloader is `CinematicIntro.astro` (see V30 above).

## V27 redesigned campaign and homepage

V27 replaces the separate animal/scenery layers with a newly generated, continuous island scene. The leopard rests on the terrace with its contact shadow and full natural fur boundary already present in the photograph. Separate landscape and portrait masters provide clear space for live HTML copy. No animal alpha cutout or separately drifting matte is used. The former V25/V26 compositions remain archived, not active in the hero.

The new renderer in `website/src/scripts/hero-film.ts` applies small, bounded head, chest and ear movements, natural local eyelid blending, slow camera motion and subtle water reflections. It renders the complete image as opaque. WebGL runs at up to 30 fps; the Canvas fallback provides photographic camera motion and blinks at 20 fps on phones or 24 fps on larger screens. GPU, image or context failure retains the intact responsive HTML poster. Hidden tabs, off-screen sections and page-cache transitions pause motion. Reduced-motion uses a still frame.

The hero now reads “Escape beautifully.” with a direct description, two native links and an illustrative USD price rail. The rail sits left of the animal on desktop and beneath it on phones. Portrait art is selected through 1100 px. The homepage uses larger destination photographs, open cream sections, refined navy services and cruise sections, and a simpler enquiry surface. The approved logo opens with a trace, staggered letters and aircraft arrival, then fades after a roughly 2.1-second sequence when resources are ready. A bounded deadline, Skip introduction, Escape, focus restoration and reduced-motion remain supported. The once-per-tab key is `pardus-intro-v27`.

Exact prompts, actual output dimensions, masters and derivative instructions are in `website/source-assets/v27/ARTWORK.md`. The landscape master is 1672 × 941; the portrait is 1024 × 1536. The scene is an imagined campaign illustration, not a verified property or partnership. The existing verified V24 destination photographs, six destination examples, cruise ideas, enquiry behavior, news updates and concept note are preserved.

V27 passed Astro check with zero errors, warnings or hints, all 23 tests, the production build and exported-reference verification for 33 pages. Automated motion tests use deterministic browser API substitutes and cover lifecycle, failure, reduced-motion, raster limits and measured head/ear framing across cover crops. Separately, the actual GLSL compiled and rendered through Mesa/EGL (llvmpipe software OpenGL ES); open, closed-eye and later-motion frames were inspected at 960 × 540 and 375 × 1000. All pixels stayed opaque. `documents/PARDUS_V27_Motion_Preview.mp4` is a 12-second, 24 fps renderer preview and `documents/PARDUS_V27_Render_Report.json` records that environment. These are not browser layout screenshots. Fresh browser layout QA was unavailable because the required managed browser-control skill was not installed; no new browser or real-device review is claimed.

The following V26 and V25 notes describe earlier releases; their hero compositions and opening timings do not describe the active V27 homepage.

## V26 background animation

The leopard is now a separate transparent mesh over the destination scenery. Its chest breathes, the head turns and lifts, the gaze follows fine pointers, the ears flick and the eyelids blink at different intervals. The scenery drifts on its own layer while the existing camera and reflected-light movement continue. Text, prices and links stay on their original layer.

WebGL renders at up to 30 frames per second with a bounded raster buffer. Devices without WebGL use a photographic Canvas mesh at up to 20 frames per second on phones or 24 on larger screens. If artwork or graphics fail, the original V25 hero remains visible. Motion pauses off-screen, in hidden tabs and during page-cache transitions, and resumes without advancing through the hidden time. Reduced-motion settings render a still animal and disable CSS scene motion. The existing approved-logo introduction remains in place.

The 22-test suite includes six new checks for both renderer lifecycles, reduced-motion changes, page visibility/cache restoration, image and GPU failure, and phone/tablet/desktop buffer bounds. These run against deterministic browser API substitutes: they do not verify actual GPU compilation or pixels. The saved `documents/PARDUS_V26_Responsive.jpg` from the earlier animation session was inspected for phone/tablet placement. Fresh browser QA was unavailable for this finalization because the managed browser-control skill was not installed; no new browser or real-device review is claimed. Release verification also includes Astro diagnostics, production build and all exported local references.

V26 adds no customer-facing animation controls. Temporary motion and responsive QA pages are excluded from the published export. The earlier release notes below remain the record for preserved V25 features.

## Revised experience

V25 gives the homepage a new photographic campaign composite: a large realistic leopard, island villas, turquoise water, a yacht and Dubai-inspired sunset city lights. Desktop and portrait compositions are served as local responsive AVIF/WebP files. The artwork is a brand montage, not a literal geographic scene or evidence of a supplier partnership. Verified V24 destination photography remains active on destination cards and pages, journey ideas, the Journal, planner and concept note. Sources are recorded in `website/source-assets/v24-photography/credits.json`; generated hero prompts and provenance are in `website/source-assets/v25/ARTWORK.md`.

The approved logo opens with a gold outline, fill, rising wordmark, aircraft arrival, metallic sweep, meridian globe and route arcs. Two curtains open onto the hero. It runs once per tab session, waits for artwork decoding and local fonts, has a 3.8-second minimum brand sequence and a bounded loading deadline. Skip introduction and Escape remain available; focus returns to the page. Reduced-motion preferences skip the opening. No Play intro or Pause motion controls are shown.

The hero image itself has continuous camera drift, subtle moving reflected light, gentle scroll depth and restrained pointer response. Motion pauses when the hero is off-screen or the tab is hidden. Reduced-motion preferences remove it. The earlier walking sprite remains archived, while the new large leopard is part of the campaign artwork. The V25 CSS refines buttons, photography, destination price overlays, dark navy services, cruise pricing, travel-desk cards and the enquiry form. Native links and forms remain available.

The homepage now moves from a cinematic, immediately readable hero to Maldives and Seychelles, the full service offering, private cruises, Dubai and other destinations, clear reasons to choose Pardus, current travel updates and one simple enquiry.

The navy and gold lockup is traced from the latest approved logo. The large photographic leopard anchors the animated hero, with reduced-motion support. Destination cards show duration, experience, sample inclusions, an illustrative USD starting price and an enquiry link. Zanzibar is presented as Safari & Zanzibar, combining wildlife and beach travel. Dubai leads with hotels, dining, shopping, desert activities and private cruises; no broad reopening claim is published.

New dedicated pages cover private cruises, the travel desk and the concept note. The former four-stage planner is retained at `planner.html`; `journey.html` is now a simple enquiry. Existing Folio, journey ideas and Journal routes remain.

## Prices and contact details

The client requested the final presentation without sample labels. All six destinations retain the supplied USD starting prices per person, based on two sharing, with clearly separated inclusions and an enquiry link. Flights, visas and travel insurance are quoted separately. The four private cruise prices use their own per-boat or per-charter basis with duration and guest count. Availability, itinerary and final price remain subject to a dated proposal. Maintain the rates in `website/src/data/offers.ts` and regenerate the concept note and exported site together.

The planned contact addresses from the latest brief are:

| Purpose | Address |
| --- | --- |
| General enquiries | info@pardusescapes.com |
| Bookings and travel enquiries | bookings@pardusescapes.com |
| Support and feedback | support@pardusescapes.com |
| Director | director@pardusescapes.com |

The first three appear on the contact page. Forms address bookings. The director address is reserved for executive use. Mailbox activation has not been verified; domain/email-provider setup is separate from the GitHub Pages site. No DNS or mailbox configuration was changed.

The simple form opens a prepared email draft. The visitor sends it from their email app. It also downloads a text enquiry and clearly states that downloading does not send it. No booking, payment or availability is promised. Set `enquiryEndpoint` in `website/src/data/site.ts` only after configuring delivery, and verify a real received enquiry before advertising server submission. WhatsApp remains hidden until a verified business number is supplied.

## Travel desk

`website/scripts/update-travel-desk.py` retrieves official Uganda Civil Aviation Authority headlines. Curated Dubai entries link directly to Visit Dubai and Emirates and carry dates and expiry dates. Only short original summaries are shown.

`.github/workflows/travel-desk.yml` runs daily at 04:17 UTC and can be run manually. It updates both public JSON copies. The browser reads the current raw GitHub feed, with the locally exported feed as a fallback. This allows fresh news without relying on an Actions-bot commit to trigger a GitHub Pages rebuild. Expired curated entries disappear. Failed retrieval retains the last successful check date instead of claiming freshness.

## Concept note

The four-page note uses the same destination, duration and price data as the website, with concise benefits, private cruises and all thirteen services. Regenerate using:

```sh
cd website
python scripts/make-concept-note.py
```

Python dependencies: ReportLab and Pillow; the generator uses locally installed DejaVu fonts. Inspect rendered pages after changing copy or prices.

## Release checks

V25 passed the Astro source check with zero errors, warnings or hints, and all 16 existing unit tests. Browser review covered the desktop campaign hero and price links, the automatic full-logo reveal, immediate Skip introduction and Escape behavior, 375 px phone and 768 px tablet frames, mobile navigation and dismissal, destination photo prices, and Maldives enquiry preselection. Both responsive layouts had zero horizontal overflow. The 768 px layout uses the portrait composition so the leopard remains visible. Approved-logo and hero proof screenshots are in `documents/PARDUS_V25_Preloader.jpg` and `documents/PARDUS_V25_Preview.jpg`.

The V24 four-page concept note and its verified photography remain unchanged in this visual release. All six sample destination prices, cruise examples, enquiry behavior and news refresh remain in place. Reduced-motion and off-screen/hidden-tab pausing are implemented; no emulated device or separate accessibility audit is claimed.

Production build and export checks cover all 33 pages and their local asset references. Reduced-motion CSS and lifecycle fallbacks remain implemented; this release does not claim a separate emulated-device accessibility audit.

Run the source check, unit tests, Pages build, export and reference verification as described in README.md. Inspect the website in a browser at desktop, tablet and mobile widths, including the menu, destination filters, enquiry preselection and download. Check the PDF visually. Earlier release checks do not establish verification of a new release.

## Assets

See ASSETS.md for retained stock photography, font provenance and generated imagery. The yacht photo depicts Dubai Marina and illustrates the experience; it does not advertise a specific vessel or operator. The original approved logo is preserved in `website/source-assets/pardus-approved-logo-2026-10.jpeg`.
