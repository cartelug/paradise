# V30.1: typography and motion notes

## Type

**Montserrat only.** One typeface is used everywhere on the site: headlines, body text, labels, prices, buttons and the preloader. It is delivered locally as Latin-subset variable WOFF2 files from the pinned `@fontsource-variable/montserrat` package (roman and italic), with the licence in `public/fonts/`. There are no requests to a font API or CDN. `src/components/FontFaces.astro` declares the two faces and preloads the roman and, on pages whose hero uses it, the italic.

How it is tuned (all in `src/styles/base.css`):

- Headlines are weight 700 with -.022em tracking and a 1.05 to 1.1 line height. Card and section titles (h3) are weight 600. Montserrat is much wider than the serif it replaced, so every headline size was reduced by about a quarter; the hero keeps its measured clearance from the leopard.
- Accent words (`em`) use the true Montserrat italic in gold at weight 600, never a faked slant.
- Body text is 15 to 17 px at 1.7 line height; leads are 16 to 20 px. Form fields are 16 px so phones do not zoom.
- Eyebrows and price labels are 11 px, weight 600, uppercase, tracked .2 to .22em. Buttons and text links are 14 px, weight 600.
- Prices use Montserrat 600 (22 to 30 px) with tabular numerals.
- Weight 700 is used only for the large headlines; 600 for everything else bold.
- `--font-display` still exists but now points at `--font-ui`, so a single change would switch the whole site.

Satoshi and the full Montserrat file remain in `public/fonts/` because the content tests reference them; they are not loaded.

## Motion

Motion lives in `src/styles/motion.css` and `src/scripts/ui.ts`. Content is complete in the HTML; hidden states exist only while the script runs. The hero drift, sun glow and light sweep are CSS animations that pause off-screen, in hidden tabs and when the visitor presses Pause scene (saved in local storage). Scroll effects use one frame per scroll event and read layout before writing styles. Reduced motion removes arrival animations, reveals, parallax and the drift.

The "Your next escape" stage on large screens is driven by the same scroll frame: a sticky stage whose scene, route line and plane follow scroll progress, with tabs that jump to a scene. On phones, tablets, short windows and with reduced motion it falls back to stacked chapters.

The preloader (`CinematicIntro.astro`, `preloader.css`, `preloader.ts`) is permanent and runs on every page; see CLAUDE.md.

The project skills in `.agents/skills/` (Frontend Design and Web Design Guidelines) guided the pass. Timings are configured values, not real-device measurements.
