# Photographic coast — 24 October 2026

AI-generated, illustrative travel composites, made with the built-in image_gen tool. These are brand imagery, not documentary photographs or evidence of a particular package/property. Exact prompts are in `GENERATION_PROMPTS.json`.

| Master | Purpose | Composition |
| --- | --- | --- |
| desktop-master.png | Section 1 desktop/tablet | Wide landscape, quiet left side, complete right-facing leopard on a limestone ledge, coast/Dubai/savannah montage |
| mobile-master.png | Section 1 phones | Separate 9:16 portrait, quiet upper sky, full leopard and destinations lower in the frame |
| coast-master.png | Section 2 introduction | Pale limestone/sand continuing into a natural turquoise cove and deep blue water; no animal or lettering |

The owner approved applying the desktop and phone pair and requested the section-two continuation. The approved Pardus logo, Archivo, exact headline and supporting sentence, live actions, permanent preloader, offer data and contacts are preserved.

`scripts/prepare-photographic-coast.mjs` produces correctly proportioned AVIF/WebP derivatives without enlargement and records native dimensions in `src/data/photographic-coast-artwork.json`. New filenames are versioned independently from V32. The hero picture and its mutually exclusive preloads use the same 767/768 pixel boundary. Section-two decorative artwork is lazy-loaded with an empty alt attribute.

## Layout and continuity

Desktop text is capped at 76px, the logo at 176px, supporting copy at 18px and actions at 14px. The desktop photograph remains at its native ratio; at the narrow end of desktop a minimum stage height gives the copy more room above the whole photograph. Tablet copy uses normal flow. Phone copy also uses normal flow, and the portrait's empty sky sits behind it with a controlled overlap of 92vw. The animal begins below that overlap even when text wraps or is enlarged. The actual head/body/tail/paws are measured in `Hero.astro`.

The hero's foreground fades only below the paws into shared pale ivory `#f4f1e9`. Section two starts in that same colour, reveals the new coastal photograph behind live navy copy, then fades to midnight beneath the destination stage. The fade is a CSS treatment, with no text baked into images. No parallax or continuous animation is applied to the leopard.

## Validation

Browser evidence and viewport checks for this release are recorded alongside these masters in `QA_RESULTS.json`: 21 standard viewports from 320 to 2560px and 11 enlarged-text cases passed, with no detected side overflow, clipped copy, animal overlap, undersized header/hero targets or gap at the shared seam. The 1024px landscape tablet uses the same spacious 640px desktop stage while retaining its menu header. The menu closes with Escape, returns focus and clears scroll lock; the Dubai destination tab, planning route and return-home link were verified.

Astro diagnostics passed with zero errors, warnings or hints; all 48 Node tests passed after the GitHub export, including the permanent preloader guard on all 33 pages. Both GitHub-base and own-domain-base builds passed their reference checks. Temporary public QA files are excluded from production. Checks use simulated Chrome CSS viewports at 100% browser zoom and enlarged actual text, not physical-device certification. Earlier V32 QA remains historical evidence for the preceding composition.
