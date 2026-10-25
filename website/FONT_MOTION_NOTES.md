# V30.1: typography and motion notes

## Type

**Archivo only.** One typeface is used everywhere on the site: headlines, body text, labels, prices, buttons and the preloader. It is delivered locally as Latin-subset variable WOFF2 files from the pinned `@fontsource-variable/archivo` package (roman and italic), with the licence in `public/fonts/`. There are no requests to a font API or CDN. `src/components/FontFaces.astro` declares the two faces and preloads the roman and, on pages whose hero uses it, the italic.

How it is tuned (all in `src/styles/base.css`):

- Headlines are weight 700 with -.022em tracking and a 1.05 to 1.1 line height. Card and section titles (h3) are weight 600. Existing responsive type sizes and hero clearances are retained; Archivo is the weight-only variable face used by PDM, with no stretching or width-axis changes.
- Accent words (`em`) use the true Archivo italic in gold at weight 600, never a faked slant.
- Body text is 16 to 18 px at 1.7 line height; leads are 16 to 20 px. Form fields are 16 px so phones do not zoom.
- Eyebrows and price labels are 11 px, weight 600, uppercase, tracked .2 to .22em. Buttons and text links are 14 px, weight 600.
- Prices use Archivo 600 (22 to 30 px) with tabular numerals.
- Weight 700 is used only for the large headlines; 600 for everything else bold.
- `--font-display` still exists but now points at `--font-ui`, so a single change would switch the whole site.

Legacy font assets remain for historical compatibility; only the two Archivo faces are loaded. Archivo is selected from PDM’s current Archivo/Lexend system at the owner’s request on 23 October 2026.

## Motion

Motion lives in `src/styles/motion.css` and `src/scripts/ui.ts`. Content is complete in the HTML; hidden states exist only while the script runs. The hero drift, sun glow and light sweep are CSS animations that pause off-screen, in hidden tabs and when the visitor presses Pause scene (saved in local storage). Scroll effects use one frame per scroll event and read layout before writing styles. Reduced motion removes arrival animations, reveals, parallax and the drift.

The hero leopard (`src/scripts/hero-life.ts`, `src/styles/hero.css`) is calm (V30.4): breathing and the slow band of warm light are CSS and run on the compositor; the script adds a very slow sway of the head, one slow blink every 7 to 13 seconds, the drifting motes and the pin layout. It does not glow, does not follow the pointer, a finger, phone tilt or scroll, and does not react to a touch. One `requestAnimationFrame` loop runs only while the hero is visible, the tab is shown, Pause scene is off and motion is allowed. If the first 120 frames average slower than about 33 fps it sets `data-quality="lite"` and the blended extras are dropped. The leopard layer translates by at most 3 px and its cutout runs past the right edge of the picture, so its cut edge is never seen.

The "Your next escape" stage on large screens is driven by the same scroll frame: a sticky stage whose scene, route line and plane follow scroll progress, with tabs that jump to a scene. On phones, tablets, short windows and with reduced motion it falls back to stacked chapters.

The preloader (`CinematicIntro.astro`, `preloader.css`, `preloader.ts`) is permanent and runs on every page; see CLAUDE.md.

The project skills in `.agents/skills/` (Frontend Design and Web Design Guidelines) guided the pass. Timings are configured values, not real-device measurements.

## Responsive refinement — 23 October 2026

Portrait tablets use the complete landscape hero after the headline and actions; phones retain the complete portrait art. The image preloads and pin coordinates use the same 760 px breakpoint. This keeps the primary action visible early on tablets without placing copy on the leopard.

The page no longer imposes a 320 px body minimum that overflows when a narrow viewport has a visible scrollbar. Featured cards stack their artwork above the copy through 1280 px; metadata wraps, flex text can shrink, and narrow-screen card/form actions fill their column. Footer links and Folio/picker controls have at least 44 px touch targets. The smallest service picker uses a stacked summary. Touch-only devices avoid sticky hover lifts.

The existing geometry checks were run in Chrome through a temporary, same-origin iframe review page: all 33 pages at 320, 390, 768, 1024, 1200, 1440 and 1920 px, plus 390 px with 200% root text size. Extra homepage checks cover 360, 430, 568 (landscape), 820 and 1199 px. These are browser viewport checks, not physical-device or Safari certification.

## Professional type pass — 25 October 2026 (V38)

`src/styles/refine.css` supersedes the weight notes above: h1/h2 are 800 at -.034em, h3 and card titles 700 at -.02em, eyebrows and price labels 700, buttons 700, prices 700 with tabular lining numerals, and body copy on dark grounds 450 so light-on-dark text does not look thin. Kerning and ligatures are explicit, `font-synthesis` is off (the true italic is always used), headings use `text-wrap: balance` and paragraphs `text-wrap: pretty`. Still Archivo only, weight and tracking only.
