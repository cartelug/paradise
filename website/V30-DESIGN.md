# PARDUS V30: the blue-hour redesign

Brief from the site owner (14 October 2026): the V29 site felt flat and ugly. It had no section gradients, an odd condensed typeface and almost no scroll behaviour. Bring back the V25 build with the leopard in the background and use that hero. Bring back the preloader and never remove it again. Redesign the whole site, make the mobile menu perfect, use symbols (SVG icons), no emoji.

## Fixed elements (not up for redesign)

1. The V25 hero: leopard portrait, overwater villas, Dubai skyline at sunset, yacht (`images/pardus-hero-*-v25-*`). It sits behind the live headline.
2. The preloader: the V25 opening, restored. Gold leopard trace, wordmark, aircraft, globe and route arcs, curtains. It is a hard rule that it stays in every future build. See `CLAUDE.md` and `tests/preloader.test.mjs`.
3. The approved logo, offer data, price wording, verified photography and travel-desk content.

## Palette: lifted from the hero photograph

| Token | Value | Use |
| --- | --- | --- |
| Midnight | `#050c1a` | page base, footer, menu |
| Deep sea | `#0a1c33` | raised night surfaces |
| Lagoon | `#0d5560` to `#168a93` | teal glows, gradient sections |
| Champagne | `#d9bc82` / `#ecd7a8` | actions, rules, numerals |
| Ember | `#f0a24b` | sunset glow, used only inside gradients |
| Ivory | `#f6f1e7` to `#ebe2cf` | light reading sections |
| Ink | `#0b1626` | text on ivory |

## Type

- Display: Montserrat variable, weight 700, tracking -.022em, line height 1.05 to 1.1, with the true Montserrat italic for accent words. Headline sizes were reduced about 24% from the serif sizes because Montserrat is wider.
- Interface and body: Montserrat variable, 15 to 17 px body, 1.7 line height, lines under 70 characters; labels at 11 px, weight 600, tracked .22em; prices in Montserrat 600.
- A fluid scale from phone to wide desktop (`clamp`). Prices use tabular numerals.
- No emoji, and no text glyphs standing in for icons.

## Layout concept

```
PRELOADER  logo draws itself > curtains part
HERO       [ headline, 2 actions ........ leopard (photo) ]
           [ glass price rail: Maldives | Seychelles | Dubai ]
NIGHT>LAGOON  signature escapes: two large photo cards
IVORY      what we arrange: sticky heading left, four service rows right
SUNSET     full-bleed yacht band, image scales on scroll
IVORY>SAND three more destinations + Safari and Zanzibar
NIGHT      why Pardus: three promises with icons
LAGOON     travel desk
NIGHT      enquiry form, footer
```

Left-aligned copy throughout. Photography carries the colour. Gradients are used to blend sections into each other (night to lagoon, lagoon to night, ivory to sand, night to ember at the horizon), not as decoration inside cards.

## Scroll and motion (one orchestrated language)

- Header: transparent over the hero, then a blurred midnight bar. A thin gold progress line follows the scroll.
- Hero: the photograph drifts slowly, moves with scroll (parallax), and responds gently to a fine pointer. The copy lifts and fades as it leaves.
- Sections: headings and cards rise in once, with a short stagger. Images unveil with a clip reveal and a small parallax inside their frame.
- Yacht band: the image scales down as it enters.
- Everything pauses off-screen or in a hidden tab, and is removed under reduced motion. All content is in the HTML before any script runs.

## Mobile menu

A full-height dialog with a gradient night panel. Each destination has an SVG symbol. Large tap targets, current page marked, the primary action pinned at the foot with contact details, staggered entrance, closes on Escape, backdrop, link tap and the close button, locks page scroll, returns focus to the menu button, and respects safe-area insets and reduced motion.

## Icons

One SVG sprite (`Icon.astro`) in a single stroke style. No emoji. No arrow or plus glyphs in text.

## Build and verification

Astro check, node tests (including the preloader guard), production build, export to the repository root, `verify:export`, then browser screenshots at 320, 390, 768, 1024 and 1440 px with the preloader on and skipped.

## V30.2 notes: the living hero, the phone hero, the service picker

Why these choices. The competitor sites could not be loaded from the build environment, so this is reasoning from the research that could be reached, not a visual comparison.

- **Cost early.** Sources agree that hiding price until late in a funnel raises abandonment, so every destination on the first phone screen carries a "From USD" price.
- **No hidden swipe.** Carousels hide content and the first slide wins, so the three destinations sit side by side instead of in a swipe strip.
- **Thumb-reachable action.** Tap targets are 44 px or more everywhere (54 px for buttons, 64 px for picker tiles) and a floating action follows the visitor on phones.
- **Build a journey, hand it to an adviser.** A&K lets visitors build a tailored journey and save it for an adviser. The picker does the same in one screen, and carries the choices into the enquiry.
- **What nobody else has.** A brand animal that watches you, blinks and follows your finger or tilt, plus the opening animation on every page.

