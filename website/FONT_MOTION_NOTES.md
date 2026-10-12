# V28 — typography and animation update

Newsreader replaces Fraunces for display text. Manrope replaces the active Satoshi/Montserrat stack for body text and controls. The approved Pardus logo remains vector artwork. The selected hero is “The world. Your way.” with Plan your escape as its primary action.

## Font delivery

- Three local WOFF2 files: Newsreader roman, Newsreader italic and Manrope roman.
- Newsreader retains both genuine variable axes: weight 200–800 and optical size 6–72. Manrope retains weight 200–800.
- The files are copied unchanged from pinned Fontsource packages. Both licences are retained in `public/fonts/`.
- Roman display and UI fonts are preloaded. Home additionally preloads the visible display italic. All faces use `font-display: swap`; unsupported glyphs use the system fallback.
- There are no production requests to a font API or CDN. Newsreader optical sizing is automatic and font weights use the real variable files.
- Original font files remain available for rollback and legacy exports, but the active layout no longer loads them.
- All three active files total 303,708 bytes. No Core Web Vitals improvement is claimed without measurement.

## CSS system

`typography.css` follows the existing page CSS and owns the shared family, scale, leading and reading-width decisions. Rem bounds preserve zoom and user font settings; headings balance naturally; paragraphs use comfortable measures. Phone supporting text is larger, input text remains at least 16 px, actions stack when needed and focus is visible on both light and dark surfaces. Prices retain tabular numerals and wrap without hiding their basis.

`motion.css` owns interaction timing, hero arrival, menu opening, navigation feedback and a small heading entrance. Cards and copy stay readable. New keyframes animate transform/opacity. Reduced motion removes decorative movement. The existing photographed leopard renderer retains its static poster and failure fallback.

The intro no longer waits for font, image or optional renderer readiness. Its target is 1,150 ms with a 380 ms fade; Skip/Escape remain available and deadlines release the page after failure. These are configured timings rather than real-device performance measurements.

Pause scene is a real button. Its preference survives visibility and page-cache changes and is stored locally. A saved pause or initial reduced motion prevents renderer initialisation. Reduced-motion changes can enable the scene later. The control is hidden if graphics fail. Scroll updates read layout before writing styles and stop scheduling work in hidden tabs.

## Design guidance

The two project skills in `.agents/skills/` are Frontend Design from Anthropic and Web Design Guidelines from Vercel. Their source instructions and discovery metadata are preserved. They guide the type/interaction pass without adding browser code or replacing the Astro framework.

The personal Skills service rejected its separate save attempt with HTTP 422. The guidance is installed and versioned in this website project; no personal Skills-page installation is claimed.

Sources:

- https://fontsource.org/fonts/newsreader/about
- https://fontsource.org/fonts/manrope/about
- https://github.com/anthropics/skills/tree/main/skills/frontend-design
- https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
- https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md

## Verification

Run the existing Astro check, project tests, GitHub Pages build, export and export verification. The additional lifecycle tests cover persisted pause and initial reduced motion. Check every output's local font references and the files' real variation axes. Browser inspection depends on the available preview environment; distinguish source checks from actual browser and real-device evidence.

This release updates the current production typography and motion foundation. The separately approved Satguru structure remains in the saved homepage design proof and its integration plan; this CSS release does not claim that whole structural migration is deployed.
