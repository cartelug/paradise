# Pardus Luxury Escapes — V23 handover

Release: 4 October 2026. Published from `main` at https://cartelug.github.io/paradise/.

## Revised experience

V23 builds forward from V22. The new imagined island sunset hero has responsive AVIF/WebP assets, gentle camera drift and masked headline reveals. The approved logo draws and fills into place, its aircraft arrives, and the introduction lifts away after about four seconds. It runs once per browser tab session and can be replayed or skipped with the button or Escape. Focus returns to the invoking control. A failsafe keeps the page accessible if loading is interrupted.

The leopard uses sixteen aligned transparent photographic poses, a continuous frame-rate-independent path, soft ground shadow and a subtle reflection. Animation stops off-screen or in hidden tabs. Pause stops the hero motion; reduced-motion preferences skip the introduction and remove movement. Destination reveals, pointer-responsive photography, service-row highlights and progressive page transitions complete the motion layer. Browsers without view-transition support retain normal links.

The homepage now moves from a cinematic, immediately readable hero to Maldives and Seychelles, the full service offering, private cruises, Dubai and other destinations, clear reasons to choose Pardus, current travel updates and one simple enquiry.

The navy and gold lockup is traced from the latest approved logo. A photographic leopard walks across the hero, with pause and reduced-motion support. Destination cards show duration, experience, sample inclusions, an illustrative USD starting price and an enquiry link. Zanzibar is presented as Safari & Zanzibar, combining wildlife and beach travel. Dubai leads with hotels, dining, shopping, desert activities and private cruises; no broad reopening claim is published.

New dedicated pages cover private cruises, the travel desk and the concept note. The former four-stage planner is retained at `planner.html`; `journey.html` is now a simple enquiry. Existing Folio, journey ideas and Journal routes remain.

## Prices and contact details

The client explicitly requested sample prices for this release. All six destinations now show illustrative USD starting prices per person, based on two sharing, plus sample inclusions. Flights, visas and travel insurance are extra. The four private cruise examples use a separate per-boat or per-charter basis with duration and guest count. These are design examples, not supplier quotes or live availability. All destination records in `website/src/data/offers.ts` have `sample: true`. Replace with verified rates and approved terms before changing that flag; regenerate the concept note and exported site together.

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

V23 passed the Astro source check with no diagnostics and all 16 existing unit tests. Browser review covered desktop, tablet (768 px) and mobile (375 px), the sixteen-pose transparent leopard, intro replay and Escape skip, focus restoration, motion pause, all six destination sample prices, destination filtering and Dubai enquiry preselection. The fixed paused leopard position and stopped sprite/hero animations were verified across separate observations. Mobile enquiry had no horizontal page overflow. All four updated concept-note pages were rendered and inspected.

Production build and export checks cover all 33 pages and their local asset references. Reduced-motion CSS and lifecycle fallbacks are implemented; this release does not claim a separate emulated-device accessibility audit.

Run the source check, unit tests, Pages build, export and reference verification as described in README.md. Inspect the website in a browser at desktop, tablet and mobile widths, including the menu, pause control, destination filters, enquiry preselection and download. Check the PDF visually. Do not reuse old V21 full-regression or accessibility claims as proof of a new release.

## Assets

See ASSETS.md for retained stock photography, font provenance and generated imagery. New yacht imagery represents a generic private ocean experience; it does not advertise a specific vessel, hotel or operator. The original approved logo is preserved in `website/source-assets/pardus-approved-logo-2026-10.jpeg`.
