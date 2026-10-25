# Pardus travel image handoff — 25 October 2026

Ten original PNG image masters for the next Pardus website update. The files are committed individually in this folder and can be used directly from the repository. Their prompts are in [prompts.txt](prompts.txt), and exact dimensions, byte counts, Git blob IDs, SHA-256 checksums and suggested alt text are in [manifest.json](manifest.json).

These are images produced with the built-in image generator in a natural travel-photography style. Camera and RAW descriptions in the prompts describe the intended appearance. The supplied files are PNGs.

## Image inventory

| Filename | Subject | Matching existing photo slot | Native pixels | Size |
| --- | --- | --- | --- | --- |
| [maldives.png](maldives.png) | Maldives | `maldives` | 1586 × 992 | 2.31 MB |
| [seychelles.png](seychelles.png) | Seychelles | `seychelles` | 1586 × 992 | 3.06 MB |
| [dubai.png](dubai.png) | Dubai | `dubai` | 1586 × 992 | 2.13 MB |
| [east-africa.png](east-africa.png) | East Africa | `safari-family` | 1586 × 992 | 2.47 MB |
| [europe.png](europe.png) | Europe | `europe` | 1586 × 992 | 2.89 MB |
| [zanzibar.png](zanzibar.png) | Zanzibar | `zanzibar` | 1586 × 992 | 2.78 MB |
| [yacht.png](yacht.png) | Private yacht | `yacht` | 1586 × 992 | 2.24 MB |
| [executive.png](executive.png) | Executive arrival | `corporate` | 1586 × 992 | 2.21 MB |
| [reset.png](reset.png) | Private island reset | Dedicated experience placement | 1586 × 992 | 2.53 MB |
| [celebration.png](celebration.png) | Celebration evening | Dedicated experience placement | 1585 × 992 | 2.48 MB |

The private island reset and celebration images do not have dedicated slots in the current PhotoSlot union. Add suitable typed entries when implementing those experience sections. Keep the East Africa image associated with the general safari experience.

## Integration task

Start from the latest main branch. Read the root CLAUDE.md, README.md and this file before editing.

1. Prepare responsive AVIF and WebP derivatives from these masters using the existing Sharp-based image workflow. Keep these original PNG files intact. Export only the dimensions the source supports; retain smooth colour and gentle highlights.
2. Wire the six destination images into their matching destination cards, detail pages or existing destination sections. Use the yacht image for private yacht experiences, executive for corporate arrivals, reset for private island or retreat experiences, and celebration for bespoke celebrations.
3. Inspect website/src/data/photography.ts and website/src/data/v31-photography.ts before updating the registry. Existing photography is selected through the photo() helper, whose types and fallbacks should remain consistent.
4. Publish web derivatives under website/public/images/ using clear unique basenames, then reference them through the existing site path() helper so both /paradise/ and the own-domain root work.
5. Check website/src/components/Picture.astro before reusing it. It currently assumes 640/1280/1920 variants and a 1280 × 853 fallback. These masters are approximately 16:10 at the dimensions above. Supply correct intrinsic dimensions and actual variant widths; adapt the component or add a narrowly scoped companion while preserving existing pictures.
6. Review desktop, tablet and phone crops individually. Keep boats, elephants, buildings and other main subjects visible; use appropriate object-position per asset. Match image containers to the intended layout, with native HTML headings and controls. Use concise alt text for content images and empty alt text for purely decorative backgrounds.
7. Lazy-load images below the fold, reserve space to avoid layout shift, and load only the needed responsive variant.

## Preserve the approved site

Follow CLAUDE.md. Keep the permanent preloader on every page, the approved Pardus logo, current Archivo typography, approved calm static leopard and current opening backgrounds. Keep verified prices, offers, contacts, navigation and business copy. Use the new images in the corresponding destination and experience content.

Retain reduced-motion behaviour, image-error and no-script text fallbacks, keyboard focus, readable contrast and 44-pixel tap targets. Review 320–430 px phones, tablet and desktop layouts, plus enlarged text.

## Validation for the later integration

This handoff adds source assets and documentation. The website integration and its release checks are the next task.

Use Node.js 22 or newer. After implementing the image references, run the project's documented GitHub Pages sequence:

```sh
cd website
npm ci
npm run check
PARDUS_BASE=/paradise/ npm run build
npm run export:github
npm test
npm run verify:export
```

The repository requires tests after the export, including the permanent-preloader checks. Run the documented browser smoke and mobile-fit checks against the served GitHub Pages export, following README.md. Review crop quality, missing image requests, sideways overflow, menu behaviour and 200% text size.

Commit the updated Astro source, prepared web images and regenerated GitHub Pages output together, then push main. Report the commit, changed image placements and the checks actually run.

## Message to the next coding agent

Use cartelug/paradise on the latest main branch. Read CLAUDE.md and website/source-assets/travel-photographs-2026-10-25/README.md. All ten PNGs and prompts are already in that folder. Integrate the images into their matching destination and travel-experience sections, create lightweight responsive AVIF/WebP derivatives and preserve the approved Pardus opening, static leopard, permanent preloader, Archivo typography, logo, verified prices and contacts. Check mobile and desktop crops, run the documented checks, rebuild the GitHub Pages export, and commit source plus generated output to main. Report the final commit and validation results.
