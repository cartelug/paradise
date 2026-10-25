# Section 02 — Who we are

The owner approved the gradient-blended desktop and mobile concepts on 25 October 2026 and explicitly requested the same background, designed lettering and symbols in the implementation, then a push to main. This request overrides the earlier Archivo-only visual-heading direction for this section only. The rest of the site keeps its existing typography, hero, permanent preloader, navigation and business data.

The two masters were created with the built-in image-generation tool in the current conversation. They are AI-generated illustrative travel composites, not evidence that the pictured destinations share a real location. The source scene blends Positano-inspired coastal architecture, Seychelles-inspired islands and African savannah with a leopard.

- `desktop-master.png`: 1536 × 1024.
- `mobile-master.png`: 853 × 1844, separately composed for mobile.
- `dimensions.json`: master and responsive export dimensions.
- `generation-brief.md`: generation direction and reference constraints.

`WhoWeAre.astro` uses the approved artboards directly. Native-size WebP files are lossless, with every decoded RGB pixel checked against the PNG master. Smaller exports preserve aspect ratio and use lossless encoding after resizing. At up to 999 CSS pixels the portrait is used; at 1000 CSS pixels and wider the landscape is used. Images have their full intrinsic proportions: no object-fit crop, stretch, cover overlay, blend filter, continuous animation or replacement artwork. Browser resampling at other viewport widths is expected; zero screen-pixel difference on every physical device is not claimed.

The apparent Discover Pardus button has a real, focusable HTML link to `about.html`, aligned in image-relative coordinates. It has a visible focus ring and a minimum 44-pixel target. The full heading, supporting text and services also exist in semantic HTML; the artwork is decorative to assistive technology, so it does not repeat this content. At enlarged root text sizes, failed image loads, without JavaScript, in forced colours and in print, real Archivo text reflows in normal document flow and the CTA remains visible and usable. This accessibility presentation intentionally differs from the fixed artboard.

This is a deliberately artwork-led implementation at the owner's request. Normal-size lettering and paragraph pixels are part of the approved image and are not separately selectable or editable visually. Change approved artwork and matching semantic text together. Preserve the fallback.

`website/tests/section-two-qa.html` is the browser review fixture; copy it temporarily to `public/__qa/section-two.html` for development and remove that public copy before production builds. Responsive evidence is recorded in `website/tests/records/section-two-2026-10-25.json`.
