# Pardus V2 maintenance and release guide

This file describes the production rules behind the Pardus V2 website. Edit the Astro source in `website/`; files in the repository root are generated publishing output.

## Sources of truth

- `src/data/site.ts` — business identity, verified contacts, enquiry endpoint, analytics token and navigation.
- `src/data/destinations.ts` — destination dossiers and Folio classification.
- `src/data/journeys.ts` — flexible journey concepts and place/pace/reason signals.
- `src/data/journal.ts` — Journal metadata and article content.
- `src/styles/v2.css` — V2 Folio, journey, destination, planner and responsive components.
- `src/scripts/folio.ts` — local Folio state and planner handoff.
- `src/scripts/site.ts` — navigation, filters, Journal search and planner behaviour.

Never edit generated root HTML to fix a source problem. It will be replaced on the next export.

## Publishing a destination

Add one complete record to `src/data/destinations.ts`. A published record needs:

- A unique lowercase URL-safe slug.
- A precise name, region and short positioning statement.
- A place, pace and at least one honest reason classification.
- Suggested stay, ideal traveller, seasonal context and route pairings.
- Practical considerations that help a visitor decide.
- Three specific experience chapters.
- An image name with 640, 1280 and 1920 pixel AVIF and WebP files.
- Accurate alt text.

Do not publish exact prices, season guarantees, wildlife guarantees, partner claims or access promises without an approved source and review date.

## Publishing a journey concept

Add one complete record to `src/data/journeys.ts`. A journey concept is an editorial framework, not a package. It needs:

- A unique slug and sequence number.
- Place, pace and reason values from the existing controlled lists.
- Suggested duration and relevant destination names.
- Three chapters, three ideal-traveller points, three rhythm points and clear flexibility.
- An existing responsive image set.

The dynamic page is generated automatically as `journey-[slug].html`. The concept appears automatically on the Journeys index and can be saved to the Folio.

## Publishing a Journal article

Add one complete record to `src/data/journal.ts`. Every article requires an accountable author label, ISO publication date, ISO update date, topic, related destination where applicable and a responsive image.

The public article is generated as `journal-[slug].html` with Article structured data. Recheck any operational, seasonal or supplier-dependent statement when the update date changes.

## Image production

Use `scripts/prepare-images.mjs` for the existing named image families. New image families must produce AVIF and WebP at 640, 1280 and 1920 pixels unless a component has a documented art-directed size set.

Update `ASSETS.md` with source, creator, licence, actual location, allowed usage and crop notes. An attractive image is not enough if the location or rights are uncertain.

## Typography

The site self-hosts Satoshi, Montserrat and Fraunces. Do not reintroduce Fontshare or another remote font stylesheet. Keep the Satoshi and Montserrat WOFF2 filenames used by `Layout.astro`, or update the font-face declarations and content test together.

## Folio behaviour

The Folio stores place, pace, reason and up to twelve saved destination/journey references in local storage for 30 days. It contains no account, availability, pricing or reservation state. Removing malformed or expired data is intentional.

If a destination or journey slug changes, add a redirect plan and test that an older saved item is discarded without breaking the rest of the Folio.

## Enquiry activation

The website remains download-only until verified business data is supplied. To activate delivery:

1. Add the approved endpoint to `site.enquiryEndpoint`.
2. Add the verified email and WhatsApp values only when they are owned and monitored.
3. Confirm privacy language, retention, consent and internal lead routing.
4. Test successful, invalid, duplicate, slow, timeout and server-error submissions.
5. Confirm the internal record and traveller acknowledgement independently.

Do not change copy to say an enquiry was sent until the live recipient has received the test.

## Required checks

From `website/`:

```sh
npm run check
npm test
PARDUS_BASE=/paradise/ npm run build
node scripts/export-github.mjs
```

After export, review the diff. Confirm that the root contains the current HTML pages and only the current hashed files under `static/`.

Rendered QA must cover:

- 320, 390, 768, 1024 and 1440 pixel layouts.
- Home, Destinations, a destination dossier, Journeys, a journey concept, Journal, an article, planner and service pages.
- Folio add/remove/clear/undo and planner handoff.
- Planner Back, date validation, optional email validation, local download and failed delivery.
- Mobile menu, keyboard focus, Escape, reduced motion and no JavaScript.
- Broken images, failed resources, horizontal overflow and runtime errors.

## Release blockers

Do not describe the website as fully operational until these external facts are approved:

- Registered business identity and jurisdiction.
- Verified service address and contact channels.
- Real enquiry delivery and acknowledgement.
- Business-approved privacy, booking, supplier and cancellation language.
- Photography rights and location accuracy.
- Any team, testimonial, partner, membership or accreditation claim.

Design polish cannot substitute for those facts.

