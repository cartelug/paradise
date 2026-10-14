# V30.1: typography and motion notes

## Type

Cormorant Garamond (display) and Montserrat (body, labels, prices and controls) are delivered locally as Latin-subset variable WOFF2 files from pinned Fontsource packages (`@fontsource-variable/cormorant-garamond`, `@fontsource-variable/montserrat`). Both licences are kept in `public/fonts/`. There are no requests to a font API or CDN. `src/components/FontFaces.astro` declares the faces and preloads Montserrat, Cormorant roman and, on pages whose hero uses it, Cormorant italic.

Why this pair: Cormorant Garamond is a high-contrast Garamond with long, elegant ascenders and a calligraphic italic that suits a luxury travel house; Montserrat is a geometric sans with wide, open letters that stays clear at small sizes and gives labels and prices a firm, modern edge. The contrast between the two (old-style serif against geometric sans) is what makes headlines feel considered rather than decorative. Ten pairings were compared before the pick; Newsreader and Manrope (V30) were retired as too soft.

How it is tuned (all in `src/styles/base.css`):

- Cormorant has a small x-height, so every display rule uses `font-size-adjust: ex-height .45` (`--display-adjust`). Headlines then read at the same apparent size as a typical serif without rescaling the type scale.
- Headlines are weight 600 with -.008em tracking and lining numerals; the gold italic accent (`em`) uses the same weight so it never looks thin beside the roman.
- Body text is 15 to 17 px Montserrat at 1.7 line height; leads are 16 to 20 px. Form fields are 16 px so phones do not zoom.
- Eyebrows and price labels are 11 px Montserrat 600, uppercase, tracked .2 to .22em. Buttons and text links are 14 px Montserrat 600.
- Prices use Montserrat 600 (22 to 30 px) with tabular numerals, so figures align and feel factual rather than decorative.
- Weight 700 is not used anywhere; 600 is the heaviest weight on the site.

Satoshi and the full Montserrat file remain in `public/fonts/` because the content tests reference them.

## Motion

Motion lives in `src/styles/motion.css` and `src/scripts/ui.ts`. Content is complete in the HTML; hidden states exist only while the script runs. The hero drift, sun glow and light sweep are CSS animations that pause off-screen, in hidden tabs and when the visitor presses Pause scene (saved in local storage). Scroll effects use one frame per scroll event and read layout before writing styles. Reduced motion removes arrival animations, reveals, parallax and the drift.

The "Your next escape" stage on large screens is driven by the same scroll frame: a sticky stage whose scene, route line and plane follow scroll progress, with tabs that jump to a scene. On phones, tablets, short windows and with reduced motion it falls back to stacked chapters.

The preloader (`CinematicIntro.astro`, `preloader.css`, `preloader.ts`) is permanent and runs on every page; see CLAUDE.md.

The project skills in `.agents/skills/` (Frontend Design and Web Design Guidelines) guided the pass. Timings are configured values, not real-device measurements.
