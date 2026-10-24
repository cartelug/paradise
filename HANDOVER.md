# Pardus Luxury Escapes — Final destination presentation

## Selected first homepage section — 24 October 2026

The owner selected the Unfolding Earth mockup and requested an accurate implementation of section one. The new static artwork shows a walking leopard over an unfolding atlas containing the Maldives, Dubai and East Africa. The primary Pardus logo, five shared navigation labels, exact headline and supporting copy, flat gold planning action and outlined destinations action are live page elements. The desktop proportions follow the selected image; phones use a compact complete artwork below the copy.

The permanent preloader, verified offer data and later homepage sections remain. Enlarged text can use a stacked layout on wide screens. A small layout observer handles that adaptation without adding animal motion or pointer reactions.

The source masters, feature table, exact built-in image-generation prompts and current QA evidence live in `website/source-assets/v32-unfolding-earth/`. All 18 standard CSS viewport cases (320 through 2560 pixels) and nine enlarged-text cases passed the section-one geometry checks. Browser interaction checks confirmed the planning route, return-home link, mobile-menu Escape dismissal, focus return and scroll-lock reset. These are simulated Chrome checks, not physical-device certification.

The GitHub Pages output and source are released together. The own-domain upload uses `website/release/pardus-site-cpanel.zip`; publishing GitHub Pages does not upload this archive to cPanel.

Release V31: 20 October 2026. Own domain: https://pardusescapes.com (cPanel zip). GitHub Pages copy: published from `main` at https://cartelug.github.io/paradise/.

## Responsive and Dubai imagery refinement — 23 October 2026

Six specialists audited the shared typography, homepage/hero, navigation/footer, inner-page cards, imagery and component plan. The changes make button labels wrap to their actual available width, contain native form controls, reflow the planner by its column width, align card prices/actions, and prevent mobile-menu/email overflow. The tablet hero uses an editorial stack through 1023 px so copy and actions have their own space above the artwork. The small service picker shows its full selection summary above its action.

Eight generated, illustrative Dubai scenes now serve the Dubai destination, city journey, cruise surfaces, photographic experience cards and a four-scene Dubai discovery gallery. The approved leopard, logo, permanent preloader, prices, inclusions and verified travel-desk content are unchanged. All text and prices remain live HTML and interface symbols remain SVG. Archivo remains the sole font.

See `website/VISUAL_GENERATION_PLAN.md` for every destination, journey, card, text and symbol mapping, plus the distinct future asset queue. `website/source-assets/v31-photography/GENERATION_PROMPTS.json` records all eight exact prompts and native 1536 × 1024 dimensions. `credits.json` identifies generated scenes as illustrative; the 1920 px delivery derivatives are interpolated. Verified V24 masters are retained.

The final release passed Astro diagnostics for 90 files with zero errors, warnings or hints; all 47 Node tests after the GitHub Pages export; both production builds; and reference verification for all 33 HTML pages and 40 generated text assets in each publishing version. The domain build also passed canonical, sitemap, robots and `.htaccess` checks. The 276-file, 31.4 MB cPanel archive passed its CRC check and excludes the internal QA fixture. The official travel-desk refresh already present on `main` was preserved.

Browser acceptance recorded 408 unique passing cases: every route at six phone sizes and core tablet/desktop widths, additional homepage breakpoint/hero checks, and every route at 200% root-font size. The normal cases used 100% page zoom. Read `website/RESPONSIVE_QA_2026-10-23.md` and its JSON evidence for the exact coverage and limits; physical devices, Safari and true 200% browser zoom are not certified. Live checks also confirmed the preloader release, hero pause/resume and selected-service enquiry prefill.

The updated own-domain upload still uses `website/release/pardus-site-cpanel.zip`. Publishing the GitHub Pages copy does not upload this package to cPanel.

## V31: launch on pardusescapes.com (20 October 2026)

V31 gets the site ready to run from the root of **https://pardusescapes.com** on Namecheap cPanel. The GitHub Pages copy at https://cartelug.github.io/paradise/ keeps working.

- **New leopard hero.** The owner-approved artwork replaces the V30 layered leopard. It shows a leopard resting in left profile, looking away from the visitor, with travel scenes woven into its coat. Gold flight lines run from its whiskers to a jet, and its paws rest in a blue-hour lagoon. Landscape art is used on landscape screens and portrait art on phones and portrait screens, always at the art's own shape, so the head, ears, whiskers and paws are never cropped. The headline, copy and buttons sit in the open sky and water. Prices sit on a translucent navy bar across the bottom on desktops, and on photo tiles over the dark water on phones. Gold pins on the coat's Maldives, Dubai and yacht scenes show prices and step aside when a screen has no room. The only motion on the picture is a very slow 1.00 to 1.03 scale. There is no glow, nothing follows the visitor and nothing reacts to a touch, and Pause scene and reduced motion show the still picture. The art is AI-generated, and its provenance and prompts are in `website/source-assets/v31-hero/ARTWORK.md`. The unused V25 to V30 hero layers and images were removed.
- **Live mailboxes.** `website/src/data/site.ts` now lists the four active mailboxes:
  - info@ handles general enquiries and appears in the footer, on Contact and in the structured data.
  - bookings@ receives every enquiry form and the planner. When the planner is not sending online, it offers "Email this brief to bookings@pardusescapes.com" after the download.
  - support@ handles after-booking help and appears on Contact.
  - director@ appears only under "Partnerships and corporate accounts" on Contact and on Corporate travel.
- **Own-domain build and zip.** Three commands produce the upload. `npm run build:domain` builds for `https://pardusescapes.com/` into `website/dist`. `PARDUS_BASE=/ npm run verify:export` checks that build: every link and image, the canonical URLs, `og:url`, the sitemap, `robots.txt` and `.htaccess`. `npm run package:cpanel` then writes `website/release/pardus-site-cpanel.zip`, which holds the contents of `dist` and goes straight into `public_html`. The zip is not committed. `public/.htaccess` forces HTTPS, sends www to the bare domain, serves `404.html`, sets caching, turns on gzip or Brotli where available and adds the AVIF and WebP types. It does not touch email, cPanel or `/.well-known`. The travel desk still reads its daily feed from raw.githubusercontent.com, so it keeps updating without a new upload.
- **Photography swap-in.** Drop new photographs into `website/source-assets/v31-photography/` under the names listed in its `credits.json`. Fill in each entry's alt text and source, using "AI-generated, illustrative" for generated pictures, then run `node scripts/prepare-v31-photography.mjs` from `website/` and rebuild. Each new photo replaces the V24 picture in its slot, and slots without a photo keep the current one. Until the new photos arrive, Family in the Wild uses the acacia sunset and Safari & Shore uses the Zanzibar shore. The elephant photograph now appears twice instead of four times: on East Africa and on the safari journal.

### Uploading to cPanel

Follow the plan in the project notes (Option A): back up `public_html`, upload `pardus-site-cpanel.zip`, and choose **Extract** into `public_html`. Check that `index.html` and `.htaccess` sit directly inside `public_html`, then delete the zip. Make sure AutoSSL covers both pardusescapes.com and www. Leave `.well-known` and `cgi-bin` alone. To update the site later, rebuild the zip and extract it over the old files.

### Connecting online enquiries (Formspree)

Until this is done, every enquiry opens an email draft to bookings@pardusescapes.com, which still works.

1. Create a free account at https://formspree.io. Add a new form and set its email to bookings@pardusescapes.com, then confirm the verification email that Formspree sends to that mailbox.
2. Copy the form's endpoint. It looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `enquiryEndpoint` in `website/src/data/site.ts`, replacing the empty value, or set `PUBLIC_PARDUS_ENQUIRY_ENDPOINT` when building.
4. Rebuild both copies (the GitHub Pages steps in README.md, then `build:domain`, `verify:export` and `package:cpanel`), and upload the new zip.
5. Send a test enquiry from the live site and check that it arrives in bookings@.

Do not paste an endpoint you have not created yourself, and never put passwords, cPanel logins or webmail details in the repository.

### Still to supply

These are unchanged from V30.4: a verified phone or WhatsApp number, company details, Instagram and TikTok links, and the real cancellation and payment terms. Each one stays hidden until it is set in `site.ts`.

## V30.4: a calmer leopard and the website review (15 October 2026)

The owner loved the leopard but worried it could unsettle some clients, and shared an independent review of the live site. This release acts on both.

- **A calm leopard.** The picture stares straight at the visitor from close up, and the V30.2 behaviour made that stronger: eyes that ignited and glowed, a head that followed the pointer, a finger or a tilted phone, a flare and a phone buzz when touched, and a push toward the visitor on scroll. All of that is gone. The leopard still breathes, sways a little on its own, blinks slowly (about a second, every 7 to 13 seconds, the way a contented cat slow-blinks) and has the slow band of warm light across its fur; the eyes are the approved artwork's own. Reduced motion, Pause scene and the "never covered" clearance rules are unchanged. `CLAUDE.md` and the tests now forbid glow, following and touch reactions.
- **First screen.** Headline "Extraordinary journeys. *Personally curated.*", supporting line "Bespoke luxury travel from Africa to the world, thoughtfully arranged around you.", and **Plan your escape** as the main button (Explore destinations is the quiet second). The icon chips row was removed to leave the first screen uncluttered; the full list of services is in "What we arrange" below. The pins, price bar and phone dock are unchanged.
- **One tagline.** "Extraordinary journeys. Personally curated." (`site.tagline`) is used in the hero, the opening, the footer, the search description, the structured data and the concept note (PDF regenerated). The old "Luxury travel, beautifully arranged." and "Your next escape. Beautifully arranged." are retired.
- **One navigation.** Destinations, Signature journeys, Our difference, Corporate travel, Journal, with Plan your escape beside them on every page; saved trips are a compact secondary control. Private cruises, What we arrange, the Travel desk and Contact moved to the menu's "more" list and the footer. Page titles follow (Signature journeys, Our difference, Corporate travel).
- **The enquiry.** Name and email are required; there is a phone or WhatsApp field; saving a copy is optional ("Save a copy"). Once `enquiryEndpoint` is set in `website/src/data/site.ts` (or `PUBLIC_PARDUS_ENQUIRY_ENDPOINT` when building) the button reads "Send my enquiry", the request goes straight to Pardus, and the visitor sees a confirmation that names them and their email; if delivery fails they are told so and the email draft opens instead. **Until you connect an endpoint, enquiries still open an email draft.** Create a Formspree (or compatible) form that delivers to bookings@pardusescapes.com, paste its URL, rebuild, and run `website/tests/online-enquiry.py` against a scratch build (instructions at the top of that file).
- **Trust.** "About Pardus" and a four-step "How booking works" on Our difference and the homepage; a "Cancellations and changes" section on the terms page (footer link "Booking, cancellations & terms"); a "Signature journeys" strip on the homepage; the primary promises renamed Personal attention, Thoughtful details, Seamless service. Nothing is invented: the cancellation text says conditions come from the suppliers and are written into each proposal, and there are **no** credentials, badges, testimonials, phone number or WhatsApp number until you supply real ones (see below).
- **Search.** Page-specific titles and descriptions, with Uganda and East Africa terms on the homepage, destinations and enquiry pages; the homepage title is "Luxury travel from Uganda and East Africa". Every image carries its alt text (empty only for decoration).

### What only the business can supply

- **A verified phone and WhatsApp number**: set `phone` and `whatsapp` in `website/src/data/site.ts`; they appear in the footer, on Contact and in the structured data.
- **Company details** (registered name, registration number, tourism licence, trade-body membership), only when verified: add them to `credentials` in the same file; they appear on Our difference and Contact.
- **The real cancellation and payment terms** (deposit, deadlines, refund rules): the website only says they are written into each proposal. Replace the wording in `website/src/pages/terms.astro` and `website/src/components/BookingSteps.astro` once they are set.
- **A branded domain** (for example pardusescapes.com): host the export there and set `PARDUS_SITE` and `PARDUS_BASE=/` when building. The email addresses already use pardusescapes.com.
- **Confirmation that Uganda and East Africa is the right audience wording** for the search description.
- **Real-device checks**: the site was tested in a desktop Chromium at many widths, not on iPhones or Android phones.

## V30.3: the hero as a map of the offer (15 October 2026)

- **Pins on the picture.** Gold pins sit on the Dubai skyline, the overwater villas (Maldives) and the yacht (private yacht cruises). Their labels take turns opening with nights and the starting price, open on hover or focus, and link to the destination or cruise page. The pins place themselves: after the page settles, `hero-life.ts` measures the headline, chips, buttons, price bar, header and leopard (with room for its head turns), opens each label on a side with room, and hides any pin that has none. Maldives has first claim on space. All three show on common desktops; the Maldives pin shows on phones.
- **What Pardus arranges, at a glance.** The hero line is now "You choose where. We arrange everything." with a row of icon chips (Flights, Hotels, Transfers, Visas, Yachts, Safaris, +7 more to the full list).
- **Prices.** Phone tiles show the nights; the desktop price bar shows a photograph beside each price on wide screens.
- **Tests.** New browser phase `pins` (14 screen sizes, motion and reduced motion); the `leopard` phase now counts the pins too.

## V30.2: the living leopard, a new phone hero and a service picker (14 October 2026)

- **The leopard is alive.** The hero is built in layers (a clean world plate, the leopard, a closed-eye patch, glows, a light band and a few drifting motes). It breathes; its eyes ignite after the opening and blink at random; its head turns toward the pointer, a finger, or how a phone is tilted (Android), and wanders by itself when left alone; a warm light follows the pointer across its fur; tapping it makes its eyes flare; scrolling pushes it toward you. A speed check drops the light effects on slow phones. Reduced motion gives a complete still picture, Pause scene stops everything, and the animal never leaves its place so nothing ever covers it (`browser-smoke.py` phases `leopard` and `life` measure both).
- **Phone hero.** Headline, leopard, all three destinations with their prices (as photograph tiles, no hidden swipe) and both buttons fit the first screen on 360, 390, 412 and 430 px wide phones. The headline has a slow gold sheen; the dock tiles rise in one after another.
- **"You choose where. We arrange the rest."** is now a picker: all 13 services are tappable tiles in four groups, with a live summary and a bar that stays in reach. It is a plain GET form, so it works without JavaScript, and the choices arrive in the enquiry as the start of the note (`?services=`). A floating "Plan your escape" button appears on phones once the hero is behind you and steps aside over the picker, the enquiry form and the footer.
- **Buttons.** One system for the site: a 54 px pill with a round arrow inside its end (added automatically to every trailing arrow), a sinking press state, a visible focus ring and a gold, ghost, ink and line variant.
- **Weight.** The phone page is about 660 KB at load (it was 830 KB before the duplicate leopard file was replaced by a 10 KB mask and photographs below the fold were given low priority).
- **Benchmark.** Competitor sites could not be opened from the build environment, so no live visual comparison was made. The decisions follow the findings that could be reached: show cost early; keep tap targets at least 44 px; keep one persistent, thumb-reachable action on phones; offer a way to build a tailored journey and hand it to an adviser (A&K does this with its book-it list); avoid hiding offers in carousels. See the V30.2 notes in `website/V30-DESIGN.md`.

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
