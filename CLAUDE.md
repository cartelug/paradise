# Pardus Luxury Escapes: project rules

## HARD RULE: the Pardus preloader is permanent

The animated brand opening (the "preloader") must be present on the homepage in **every build, from now on, with no exceptions**. Never remove it, disable it, replace it with a plain loader, or drop the `intro` prop from `website/src/pages/index.astro`. This was set by the site owner on 14 October 2026 after the V29 release removed it.

What the preloader is (the V25 sequence, restored in V30):

- the approved gold-and-white Pardus logo drawing itself: leopard outline trace, wordmark letters, the aircraft arriving, a metallic sweep
- meridian globe and route arcs behind the logo, the line "Luxury travel. Beautifully arranged."
- a progress line, "Skip introduction" button, Escape to skip
- two curtains that part to reveal the hero

Source of truth:

- `website/src/components/CinematicIntro.astro` (markup)
- `website/src/styles/preloader.css` (styling and animation)
- `website/src/scripts/preloader.ts` (timing, skip, failsafe, once-per-tab key `pardus-intro-v30`)
- `<Layout intro>` on `website/src/pages/index.astro`

Allowed, because they keep the preloader in place: changing its timing, artwork or copy; showing it once per tab session; a static (non-animated) logo screen for visitors who prefer reduced motion; the Skip control and the failsafe that stops it from ever trapping a visitor.

Not allowed: deleting any of the files above, removing the markup from the exported `index.html`, or shipping a release where `website/tests/preloader.test.mjs` fails. If a redesign conflicts with the preloader, change the redesign.

Before every release, run `cd website && npm test`, which includes the preloader guard, and confirm the exported root `index.html` contains `data-pardus-intro`.

## Other standing rules

- No emoji anywhere on the site. Icons are inline SVG symbols (see `website/src/components/Icon.astro`). Do not use text glyphs such as arrows or bullets as icons.
- Edit the Astro source in `website/`. The HTML and assets at the repository root are generated GitHub Pages output; commit source and generated output together (see README.md).
- Keep the approved logo, offer data (`website/src/data/offers.ts`) and verified travel-desk content unchanged unless asked.
