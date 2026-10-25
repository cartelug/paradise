# Who we are — release validation, 25 October 2026

## Scope

Added the approved Section 02 immediately after the existing homepage hero.
The approved desktop and mobile PNG compositions are authoritative; no new
artwork was generated for the implementation. Native-size lossless WebP exports
match every decoded RGB pixel of their respective masters. The normal-size
heading, paragraph and symbols are in the artboards, with matching native HTML
semantics, a real Discover Pardus link, and a readable reflow presentation.

## Browser checks

The cloud Chrome browser passed all 38 viewport/text combinations in
`tests/records/section-two-2026-10-25.json`: 19 viewports from 320 to 2560 CSS
pixels, each at normal root text size and doubled root text size. Checks cover
page/section overflow, intrinsic image aspect ratios, correct portrait versus
landscape source, a minimum 44px action target, action containment and enlarged
text reflow without clipping. These are simulated CSS viewports in Chrome, not
physical-device or cross-engine certification.

The review caught one pre-existing narrow-screen overflow in the animated word
“possibilities.” under the later destinations heading at 320px with doubled root
text. The word wrapper now respects its available width and permits wrapping.
Normal-size appearance is retained.

Additional browser checks passed:

- Discover Pardus activated with Enter and completed navigation to About.
- A deliberately broken image exposed readable native heading, body and action.
- A script-blocked iframe exposed readable native text and the action.
- Desktop and mobile screenshots were reviewed with the complete artwork,
  gradient background, headline, animal and four symbols visible.

## Build checks

- Astro diagnostics: no errors, warnings or hints.
- 55 automated tests pass, including the permanent preloader, existing navigation,
  prices, hero artwork and exact-pixel checks for the new native-size assets.
- GitHub Pages build/export and every exported reference verified.
- Own-domain build and its root-base references verified.
- Development-only QA fixture is excluded from both production exports.

## Limits

Exact source-art preservation does not imply identical device pixels at all
viewport widths: browsers resample images and devices have different pixel
ratios. Enlarged text, image-error, no-script, forced-colour and print modes
intentionally favour readable native text over the fixed-artboard layout.
Forced-colour and print fallbacks were implemented in CSS; those media modes
were not independently exercised in the browser. No cPanel deployment is claimed
by a GitHub push.
