# Pardus Luxury Escapes: project rules

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

- The hero must never be covered by its own content: no text, button, price rail or header control may overlap the leopard at any screen size. `website/tests/browser-smoke.py` (phase `leopard`) measures this.
- No emoji anywhere on the site. Icons are inline SVG symbols (see `website/src/components/Icon.astro`). Do not use text glyphs such as arrows or bullets as icons.
- Edit the Astro source in `website/`. The HTML and assets at the repository root are generated GitHub Pages output; commit source and generated output together (see README.md).
- Keep the approved logo, offer data (`website/src/data/offers.ts`) and verified travel-desk content unchanged unless asked.
