# V42 phone hero rotation — 31 October 2026

Five owner-supplied portrait photographs (941 × 1672 px, WebP) that dissolve into one another behind the phone hero ("Section 1").
They are illustrative AI travel composites: the alt text describes the scene and never names a resort, hotel, airline or vehicle.

| File | Scene | Leopard | SHA-256 |
| --- | --- | --- | --- |
| `hero-1.webp` | Sunset ledge, leopard seen from behind, navy suitcase and leather bag, airliner overhead. The still picture. | yes | `8a2ee21ee4913f937e27b4b3e33f14fb6d5d87bcab713a04f729c01198ad3c5b` |
| `hero-2.webp` | Bright lounge over an East African coast, elephant, champagne suitcase and navy bag. | no | `d2095af8d854d1e7a29e926761b01f4dfa0761471b4114d16fa5bcff800a190f` |
| `hero-3.webp` | Small safari aircraft on a red-earth airstrip, safari vehicle, elephants, luggage. | no | `38bac65e2c112d502a10874971322692217fa7fb14027e8eb812553f509654e1` |
| `hero-4.webp` | Safari vehicle with luggage on a coastal track, leopard resting on a rock. | yes | `37d67a75d121ef26e8b7f59b5a2bef645cfe54f71a6a0dbdf29c2516c1d28d58` |
| `hero-5.webp` | Leopard walking above overwater villas, champagne suitcase and leather bag on a stone terrace. | yes | `9f87605e4123a5311e4095e7334baf3a54fa09ad794c9dd5ba5b2687e15d256c` |

The masters are the delivered files, untouched. Order is the owner's numbering.

## Derivatives

`node scripts/prepare-mobile-hero-rotation.mjs` writes `public/images/pardus-v42-mobile-hero-<n>-<480|768|941>.<webp|avif>` (never enlarged)
and `src/data/mobile-hero-rotation.json`. Run it again only if a master changes.

## Behaviour

- Phones only (`max-width: 767px`). Tablets and desktops keep the single V33 artwork and are given a one-pixel placeholder for these pictures, so they never download them.
- Each photograph is held for 3000 ms and dissolves into the next over 1400 ms (`data-hold` / `data-fade` on `[data-hero-rotator]` in `Hero.astro`). The next photograph stays opaque underneath, so the dissolve never dips; the loop closes from the fifth back to the first.
- The sequence starts when the opening releases the page. A photograph is only faded in after it has downloaded and decoded.
- The first photograph is the still picture without JavaScript, with reduced motion and after Pause scene. The sequence also stops while the tab is hidden or the hero is off screen.
- A 44 × 44 px Pause scene button (phones only, hidden under reduced motion) uses the existing `data-scene-motion` preference, which is saved between pages.
- Nothing reacts to a pointer, finger, tilt or scroll. The leopards are never animated, only dissolved in and out.

## Layout and legibility

The copy overlaps the top 44% of the picture (`margin-top: -78vw` in `hero.css`); every animal and all luggage start at 53% or lower, so they sit about 17vw below the buttons however the copy wraps. A pale veil on `.hero-copy::before` and a soft cloud behind the sentence keep the navy lettering readable over all five skies while the colour of the photograph shows through.

## Leopard outlines

Photographs 1, 4 and 5 carry measured rectangles (left, top, right, bottom in picture percent) for tail, body, head and paws in `Hero.astro` (`slides[].outline`). `browser-smoke.py` phase `leopard` checks that no hero text, button or header control meets any of the three leopards at 19 screen sizes, and `tests/mobile-hero-rotation.test.mjs` checks that every box starts below the copy. If a photograph is replaced, measure its animal again.
