# Pardus Luxury Escapes: project rules

## Current homepage reference — 24 October 2026

The owner selected the Unfolding Earth homepage image and explicitly requested an accurate rebuild of section one. For this section, that instruction supersedes the earlier V31 resting-leopard artwork, coat pins, price dock, pill buttons and phone-first-screen composition below. Use the right-facing walking leopard on an unfolding atlas, warm ivory sky, navy Archivo headline, primary logo and flat rectangular gold actions. The new masters and feature extraction are in `website/source-assets/v32-unfolding-earth/`.

The first section has live text and controls over clean art. At narrower widths, the copy and complete compact artwork use normal flow to prevent overlap. The artwork is static, a calmer treatment already allowed below. Keep the preloader, primary tagline, shared navigation, verified offer data and contacts. Later homepage sections retain their current design. Do not apply the retired V31 geometry or pin assertions to the new artwork; validate the current measured outline and responsive flow.

## HARD RULE: the Pardus preloader is permanent, on every page

The animated brand opening (the "preloader") must be present on **every page of every build, from now on, with no exceptions**. Never remove it, disable it, make it conditional, replace it with a plain loader, or add an opt-out to `Layout.astro`. This was set by the site owner on 14 October 2026 after the V29 release removed it, and extended the same day to every page.

How it behaves (smart, not repetitive):

- **First page of a visit (any page):** the full V25 sequence: the approved logo draws itself (leopard trace, wordmark, aircraft, tagline) over a meridian globe and route arcs, then two curtains part onto the page.
- **Every page after that:** a quick version of the same sequence. The curtains are already closed when the page appears, the logo draws in about a second, the name of the page is shown, and the curtains part as soon as the page is actually ready (fonts and first photograph decoded, never past a deadline).
- **Leaving:** clicking an internal link closes the curtains first, so leaving and arriving read as one continuous move. New tabs, modified clicks, downloads and in-page links are left alone.
- Skip introduction (full version), Escape, and failsafe timers always release the visitor. Visitors who prefer reduced motion get a still brand screen, never nothing. The back/forward cache never shows a closed page.

Source of truth:

- `website/src/components/CinematicIntro.astro` (markup)
- `website/src/styles/preloader.css` (styling, quick version, leaving curtains)
- `website/src/scripts/preloader.ts` (timing, readiness, skip, leaving, failsafe, once-per-tab key `pardus-intro-v30`)
- `website/src/layouts/Layout.astro` renders it unconditionally and carries the inline bootstrap that picks full or quick before first paint. Pages may pass a `label` (the name shown while the page opens); they may not switch it off.

Allowed, because they keep the preloader in place: changing its timing, artwork, copy or labels; making the quick version quicker; improving how it decides when a page is ready.

Not allowed: deleting any of the files above, making the markup conditional, removing it from any exported page, or shipping a release where `website/tests/preloader.test.mjs` fails. If a redesign conflicts with the preloader, change the redesign.

Before every release, run `cd website && npm test` after the export. It checks that every exported page contains the preloader.

## Other standing rules

- One primary tagline, **"Extraordinary journeys. Personally curated."** (`site.tagline` in `website/src/data/site.ts`), is used with the logo: hero headline, preloader, footer, search description and structured data. Do not introduce competing taglines; service lines such as "You choose where. We arrange the rest." stay inside the pages that explain the service.
- One navigation on every page, from `navigation` in `site.ts` (Destinations, Signature journeys, Our difference, Corporate travel, Journal) with **Plan your escape** as the single prominent action. Saved trips stay secondary. `website/tests/site-review.test.mjs` checks every exported page.
- The enquiry form requires a name and an email, offers phone or WhatsApp, and delivers online (with a confirmation) once `site.enquiryEndpoint` is set; until then it prepares an email draft. Saving a copy is optional, never the main route.
- Trust content is real or absent: no invented testimonials, accreditation badges, partner logos, licences, phone numbers or policies. Verified company details go in `site.credentials`, a verified phone in `site.phone`; nothing renders until they are set.
- The hero must never be covered by its own content: no text, button, price bar or header control may touch the leopard at any screen size. Since V31 the hero is one owner-approved artwork (`website/source-assets/v31-hero/`, a leopard in left profile) shown at its native aspect ratio, and the leopard's outline is a list of measured rectangles in `Hero.astro` (`outline`, in picture percentages for the landscape and portrait art). If the artwork changes, measure and correct the outline. `website/tests/browser-smoke.py` (phase `leopard`) checks it at 19 screen sizes. Never crop the head, ears, whiskers or paws.
- The hero leopard is **calm** and never watches the visitor. Its only motion is a very slow scale of the picture, 1.00 to 1.03 and back over about 20 s each way. Since 15 October 2026 it must **never** glow, **never** follow the visitor (pointer, finger, tilted phone or scroll) and **never** react to a touch or buzz the phone; the site owner found that unsettling for some clients. Pause scene and reduced motion show the complete still picture. `website/tests/browser-smoke.py` phase `life` and `website/tests/hero-and-picker.test.mjs` enforce it. Making it calmer is always allowed. Removing the leopard, or turning it to face the visitor, is not.
- The hero pins (Dubai, Maldives, private yacht) sit on the travel scenes in the leopard's coat and place themselves. They must never touch the copy, buttons, price bar, header, each other, or the leopard's head, paws, jet or flight lines (the `keep: true` parts of the outline; phase `pins`). Add or move a pin by its picture coordinates in `Hero.astro`; do not hard-code screen positions.
- Buttons use one system in `base.css` (round arrow on every trailing arrow, press and focus states). The phone first screen must hold the headline, leopard, three priced destinations and both buttons (phase `phone`); on phones the buttons stand on the lagoon below the paws and the price tiles sit below the picture, never on the animal.
- No text may spill out of a button, tile, card, pin label, chip or link, nothing may scroll a page sideways, and tap targets are at least 44 by 44 px. `website/tests/mobile-fit.py` checks all pages at six phone widths (320 to 430 px) and at 200% text size; run it with the browser smoke test before every release. A label that does not fit wraps; it never pushes a button's arrow out of the pill.
- Typography is Archivo only (updated at the site owner’s request on 23 October 2026 to match one of PDM’s current fonts), site-wide (roman and italic). Do not add a second typeface; `--font-display` points at `--font-ui`. See `website/FONT_MOTION_NOTES.md`.
- No emoji anywhere on the site. Icons are inline SVG symbols (see `website/src/components/Icon.astro`). Do not use text glyphs such as arrows or bullets as icons.
- Edit the Astro source in `website/`. The HTML and assets at the repository root are generated GitHub Pages output; commit source and generated output together (see README.md).
- Keep the approved logo, offer data (`website/src/data/offers.ts`) and verified travel-desk content unchanged unless asked.
