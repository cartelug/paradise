# Pardus Luxury Escapes — V24 handover

Release: 4 October 2026. Published from `main` at https://cartelug.github.io/paradise/.

## Revised experience

V24 builds forward from V23 and removes the hero’s Play intro and Pause motion controls. The approved animated logo introduction still runs automatically once per tab session. It lifts away after about four seconds, with Skip introduction, Escape, reduced-motion and a loading failsafe. Focus moves to the page when the introduction is skipped.

Eight photographic families now use verified Unsplash uploads from 2025 and 2026: the Maldives dusk hero and JOALI aerial view, La Digue in Seychelles, Dubai Marina at dusk, elephants in Amboseli, Zanzibar’s shoreline, Santorini and a Dubai Marina yacht. Sources, upload dates, licences and master checksums are recorded in `website/source-assets/v24-photography/credits.json`. Upload dates do not assert capture dates; destination imagery does not imply a supplier partnership. AVIF and WebP sizes at 640, 1280 and 1920 pixels are served locally. Destination pages, cards, journey ideas, the Journal, planner and concept note share the refreshed images.

The sixteen-pose transparent leopard, continuous path, ground shadow, reflection, destination reveals, photography hover motion and page transitions remain. Animation stops off-screen or in hidden tabs. Operating-system reduced-motion preferences skip the introduction and remove movement. Browsers without view-transition support retain normal links.

The homepage now moves from a cinematic, immediately readable hero to Maldives and Seychelles, the full service offering, private cruises, Dubai and other destinations, clear reasons to choose Pardus, current travel updates and one simple enquiry.

The navy and gold lockup is traced from the latest approved logo. A photographic leopard walks across the hero, with reduced-motion support. Destination cards show duration, experience, sample inclusions, an illustrative USD starting price and an enquiry link. Zanzibar is presented as Safari & Zanzibar, combining wildlife and beach travel. Dubai leads with hotels, dining, shopping, desert activities and private cruises; no broad reopening claim is published.

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

V24 passed the Astro source check with no diagnostics and all 16 existing unit tests. Browser review covered the desktop homepage, 375 px and 768 px responsive layouts, automatic logo introduction, removal of both hero controls, island image loading, all six refreshed destination families, the Maldives destination hero, Dubai yacht page and Maldives enquiry preselection. The mobile and tablet pages reviewed had no horizontal overflow. All four updated concept-note pages were rendered and visually inspected.

Production build and export checks cover all 33 pages and their local asset references. Reduced-motion CSS and lifecycle fallbacks remain implemented; this release does not claim a separate emulated-device accessibility audit.

Run the source check, unit tests, Pages build, export and reference verification as described in README.md. Inspect the website in a browser at desktop, tablet and mobile widths, including the menu, destination filters, enquiry preselection and download. Check the PDF visually. Earlier release checks do not establish verification of a new release.

## Assets

See ASSETS.md for retained stock photography, font provenance and generated imagery. The yacht photo depicts Dubai Marina and illustrates the experience; it does not advertise a specific vessel or operator. The original approved logo is preserved in `website/source-assets/pardus-approved-logo-2026-10.jpeg`.
