# Selected Window Seat band — 26 October 2026

The owner selected the navy "Leave ordinary." reference and explicitly requested a faithful implementation of that part of the homepage. `WindowSeat.astro`, `window-seat.css` and `window-seat.ts` replace the previous WhoWeAre artwork and tall scroll-pinned destination stage, using source assets in `website/source-assets/v39-window-seat/`. This owner instruction supersedes the previous section-two and coastal destination-introduction artwork requirements for this band only. Preserve the hero, permanent preloader, approved official logo, shared navigation, later homepage sections and business data. Headings keep semantic native text with a readable image-failure/no-JS/enlarged-text fallback. The portrait leopard is static. Category links open the real collection filters. The header changes to its existing white/gold logo over this dark band, and the floating CTA stays quiet over it.

# Pardus Luxury Escapes: project rules

## Ten travel photographs — 25 October 2026

The ten masters in `website/source-assets/travel-photographs-2026-10-25/` (README, manifest,
prompts) now fill the destination and experience pictures. `scripts/prepare-travel-photographs.mjs`
writes native 16:10 AVIF/WebP at 640/960/1280/native width (never enlarged, no 1920 px file) as
`<name>-v38-<width>` and generates `src/data/travel-photographs.ts` (slots, alt text from the manifest,
focal point). `photo()` consults it before the V31 and V24 registries; `Picture.astro` reads the widths,
intrinsic size and focal point, and `largestImage()` gives social previews the right file. Slot map:
maldives, seychelles, dubai, europe, zanzibar, yacht, corporate (executive), `safari-uganda` +
`safari-family` + `journal-safari` (East Africa), `reset` + `hero-maldives` (Private Island Reset
journey), `celebration` (Celebration in Two Acts journey). The pictures are illustrative AI
photographs: alt text describes the scene and never names a resort, hotel or yacht. The PNG
masters stay untouched (`tests/travel-photographs.test.mjs` checks their SHA-256). Re-run the script
(add `--force` to re-encode) if a master or focal point changes.

## Professional typography, compact rhythm and exact seams — 25 October 2026

The owner asked for bolder, more powerful and less obtrusive section styling, pro-level
type, smaller cards so pages scroll faster, and a mobile hero→Who We Are join that is
completely invisible. `website/src/styles/refine.css` (loaded last) carries it:
Archivo only, heavier display weights (h1/h2 800, h3 700, light-on-dark body 450),
tighter tracking, `text-wrap: balance/pretty`, tabular prices, shorter card pictures
(16:10 / 16:9) and smaller section, card and page-hero spacing. This updates the earlier
“700 only for large headlines” note; the typeface rule (Archivo only) is unchanged.
The join colours are sampled from the real artwork edge by `website/scripts/sample-seam.mjs`
into `src/styles/seam-colors.css`; re-run it if the Who We Are art changes. Regeneration
prompts for the “A world of places.” lettering are in
`website/source-assets/v38-who-lettering-prompt/PROMPT.md`.

## Isolated HD headings and native Section 02 — 25 October 2026

The owner next removed “Personally curated.” from the section-one headline only
and requested regenerated smooth isolated lettering, a stronger Who We Are
heading with animation, and the same background. V37 uses separate desktop and
mobile title art, native Who We Are paragraphs/button/services and localized
cleanup masks over the original background. Exact prompts and implementation
notes are in `website/source-assets/v37-hd-lettering/ARTWORK.md`. The hero H1 is
now “Extraordinary journeys.”; the full `site.tagline` stays in the opening,
footer, search and structured data. Keep the backgrounds and static leopard.
Title motion waits for preloader readiness and viewport entry, runs once, and
is removed for reduced motion. This owner instruction supersedes the earlier
three-line hero and full-artboard Section 02 implementation.

## Photographic headline lettering and opening joins — 25 October 2026

The owner next requested regenerated section-one/header lettering with visuals
inside it and a continuous blend through section two and onward. V36 uses new
transparent typographic artwork for the exact primary hero tagline and “Your next
escape.”, with illustrated destination scenes inside the letters. Masters and
exact prompts are in `website/source-assets/v36-immersive-lettering/`. These
explicit owner instructions authorize the new visual heading style; semantic
copy and native Archivo fallbacks remain unchanged. `opening-seams.css` samples
the actual section-two top edge for the first join and fades its bottom into
the existing coastal introduction. Keep the real logo, native navigation,
static leopard, all business data and permanent preloader. Do not replace the
navigation labels with raster artwork.

## Section 02 approved reference — 25 October 2026

The owner approved the vivid gradient-blended desktop/mobile Who We Are artwork
and explicitly requested identical background, designed text and symbols directly
after section one. `WhoWeAre.astro` uses those exact artboards and a real Discover
Pardus link. Masters, provenance and lossless-pixel checks are documented in
`website/source-assets/v35-who-we-are/ARTWORK.md`. This owner instruction overrides
the older visual-heading font restriction for this section only. Semantic copy
remains native HTML. Enlarged text, no JavaScript, image failure, forced colours
and print receive readable normal-flow text. Do not remove this fallback or the
permanent preloader. The existing hero and remaining homepage sections are unchanged.

## Current homepage reference — photographic coast, 24 October 2026

The owner subsequently requested a more polished mobile homepage, 20+ generated symbols, transparent designed headline images and animation. V34 implements that request with new phone hero/coast artwork, two transparent Archivo-inspired headline lockups, and 24 navy/ivory/brass travel illustrations. These are decorative raster illustrations, explicitly requested by the owner; functional control icons remain SVG. Generated headline art visually replaces the first two headings after decoding, while their exact real text remains the semantic heading, the image-error/no-JavaScript fallback and the enlarged-text version. New sources and exact prompts live in `website/source-assets/v34-mobile-illustrated/`. Keep the real Pardus logo and all business facts. The leopard stays static; animation belongs to lettering and illustrated UI entry/selection, with reduced-motion support.

After the Unfolding Earth rebuild, the owner requested a more photographic background and a less compact 100% zoom layout, approved matching desktop and mobile images, and asked to blend section one into a newly generated section two background and push main. The current art is a calm right-facing leopard walking on a pale stone ledge above an Indian Ocean coast, Dubai and savannah. Masters and exact prompts are in `website/source-assets/v33-photographic-coast/`. V32 masters remain available as history.

The first section has live text and controls over clean art. Phones use the complete portrait: only its empty sky overlaps the normal-flow copy, so wrapping and enlarged text push the animal safely lower. Tablet copy also uses normal flow. Desktop typography, logo and actions are capped at restrained sizes. The art is static. Section two continues pale stone into a coastal cove, then deepens into the existing destination stage. Keep the preloader, tagline, shared navigation, verified prices and contacts. Later sections retain their design. These owner instructions supersede the retired V31 atlas/pins/price-dock/pill-button/phone-first-screen geometry; validate the current measured outline and responsive flow instead.

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
