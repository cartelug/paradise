# Unfolding Earth — section one implementation

The owner selected the uploaded homepage reference on 24 October 2026 and requested an accurate reconstruction of section one. This replaces the earlier resting-leopard hero. Later homepage sections retain their existing implementation.

## Extracted features

| Feature | Reference treatment | Implementation |
| --- | --- | --- |
| Header | Transparent over warm sky | Homepage-only transparent header, ivory surface after scrolling |
| Logo | Primary navy and gold Pardus lockup | Existing approved vector artwork |
| Navigation | Five small navy labels in a single row | Shared destinations, journeys, difference, corporate and journal links |
| Header action | Flat gold rectangle, small radius, white arrow | Live Plan your escape link |
| Hero proportions | Approximately 1024 by 582 | Artwork's native 1663 by 946 ratio on desktop |
| Eyebrow | Widely spaced warm gold capitals | Bespoke luxury travel |
| Headline | Bold navy, three deliberate lines | Extraordinary / journeys. / Personally curated. |
| Supporting copy | Two lines beneath headline | Exact reference wording in live HTML |
| Main actions | Gold primary and ivory outlined secondary | Journey planner link and destinations anchor |
| Leopard | Right-facing walking profile, full tail and paws | Regenerated master with measured protected regions |
| World | Antique atlas curves into three landscapes | Maldives, Dubai and East African safari |
| Light | Ivory clouds, turquoise water, warm sunset | Preserved in regenerated artwork |
| Smaller screens | Adaptation of selected desktop design | Text and controls in normal flow above compact complete artwork |
| Opening | Existing animated brand introduction | Retained on every page |

## Source and exports

The two PNG masters are AI-generated with the built-in image-generation tool, using the owner's uploaded design as the composition reference. They are new assets; previous artwork remains available in version history and source files.

- Desktop master: `desktop-master.png`
- Mobile master: `mobile-master.png`
- Exact prompts: `GENERATION_PROMPTS.json`
- Repeatable format conversion: `website/scripts/prepare-unfolding-earth.mjs`
- Responsive WebP and AVIF variants: `website/public/images/pardus-unfolding-*`

No enlarged export is represented as newly generated native detail. Format conversion preserves composition and aspect ratio. UI words and logo are not embedded in the background; headings remain selectable and controls remain accessible.

The artwork is static, a calmer treatment permitted by the standing project rule. It does not follow the pointer, scroll, touch or device orientation. Existing page-entry animation, navigation transitions and preloader remain.

## Verification

Desktop comparison should be judged against the selected first section at 1024 pixels wide, then checked at standard phone, tablet and desktop widths at 100% browser zoom. The live copy, controls and header must stay clear of the measured leopard regions. The measured outline belongs to the current artwork and must be updated if future artwork changes.

The reference is an AI-generated design image rather than a pixel-exact source design. No numerical fidelity percentage is claimed.

Completed validation on 24 October 2026: Astro checked 92 files with no errors, warnings or hints; all 47 Node tests passed after the GitHub Pages export; both publishing builds resolved all references across 33 HTML pages and 40 generated text assets. Browser evidence is in `QA_RESULTS.json`: 18 normal viewport cases and nine enlarged-text cases, plus the planning route, return-home link and mobile-menu checks. The desktop and phone screenshots show the real browser render.
