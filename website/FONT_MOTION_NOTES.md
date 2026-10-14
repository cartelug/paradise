# V30: typography and motion notes

Newsreader (display) and Manrope (body and controls) are delivered locally as variable WOFF2 files from pinned Fontsource packages. Both licences are kept in `public/fonts/`. There are no requests to a font API or CDN. Newsreader keeps both variable axes (weight 200 to 800, optical size 6 to 72) and its italic is preloaded on the homepage because the hero uses it. Satoshi and Montserrat files remain in `public/fonts/` for rollback but are not loaded.

The type scale is fluid (`clamp`) from phone to wide desktop and is defined once in `src/styles/base.css`. Body text is 16 to 18 px, controls never fall below 16 px on phones, and prices use tabular numerals.

Motion lives in `src/styles/motion.css` and `src/scripts/ui.ts`. Content is complete in the HTML; hidden states exist only while the script runs. The hero drift, sun glow and light sweep are CSS animations that pause off-screen, in hidden tabs and when the visitor presses Pause scene (saved in local storage). Scroll effects use one frame per scroll event and read layout before writing styles. Reduced motion removes arrival animations, reveals, parallax and the drift.

The preloader (`CinematicIntro.astro`, `preloader.css`, `preloader.ts`) is permanent; see CLAUDE.md.

The project skills in `.agents/skills/` (Frontend Design and Web Design Guidelines) guided the pass. Timings are configured values, not real-device measurements.
