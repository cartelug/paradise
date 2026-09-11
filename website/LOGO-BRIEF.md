# Prompt — redo the Pardus logo sizing and positioning

A standing brief for the homepage logo and every place the lockup or the leopard mark
appears. Written so it can be re-run: the geometry section is measured from the artwork,
not estimated, so the numbers can be checked rather than taken on trust.

---

## The prompt

> Redo the size and positioning of the Pardus logo across the homepage and everywhere
> else the lockup appears — header, mobile menu, hero, manifesto, footer and the opening
> sequence.
>
> The logo is currently sized by container width, so its height falls out of the SVG's
> aspect ratio and nobody controls it. In a 106px header with 15px of padding the lockup
> renders 94.3px tall, which leaves 0px of breathing room and drops the "Travel.Explore"
> deck onto the header's bottom border. Fix the cause, not the symptom: make the lockup
> size itself from a single control — the cap height of PARDUS — and let width, height and
> optical alignment derive from it. Tie the header's own height to the same system so the
> two can never disagree again.
>
> Then art-direct the marks rather than scattering them:
>
> - The header lockup must sit optically centred in the bar with real clearance top and
>   bottom, at one size on both the light and dark header, and its ink — not its SVG
>   bounding box — must align to the page gutter.
> - The lockup is three decks already (leopard / PARDUS / LUXURY ESCAPES). Do not stack a
>   fourth HTML "Travel.Explore" under it in a navigation bar. Make that deck opt-in and
>   use it only where there is vertical room, which is the opening sequence.
> - The hero watermark is behind the artwork at 32% opacity, over the brightest part of
>   the picture. It reads as a scratch across the sky, not as a brand mark. Rebuild it as
>   a deliberate right-hand signature — mark, hairline, "Africa to the world",
>   "Travel.Explore" — as one cluster, above the media, with the tonal support it needs to
>   be legible over a sunset.
> - On phones, do not show a third leopard 80px below the header's leopard when the hero
>   kicker already says the same words. Cut it and let the headline take the space.
> - The footer watermark is at 4.5% opacity and positioned so four fifths of it is clipped
>   off the top of the panel. Either make it visible as an emboss or remove it; do not
>   leave it as a stray tail.
>
> Verify with real screenshots at 320, 390, 834, 1180, 1440 and 1920 px wide, plus a short
> landscape viewport for the opening. Rebuild and export the GitHub Pages output. No
> layout change may push the logo past its container at any of those widths.

---

## Measured geometry

Taken with `getBBox()` from the live SVG in `src/data/logo.json`, not estimated.

**Full lockup** — `viewBox="0 0 900 370"`

| Element | x | y | width | height |
|---|---|---|---|---|
| All ink | 22 | 15.9 | 851.5 | 338.7 |
| Leopard | 193.7 | 15.9 | 573.3 | 110.9 |
| PARDUS letters | 27.3 | 161.4 | 846.2 | **122.5** |
| Aircraft | 181.2 | 221.5 | 99.8 | 26.5 |
| LUXURY ESCAPES + rules | 22 | 329.8 | 840 | 24.8 |

**Symbol only** — `viewBox` trimmed to `193 15 575 113`, so a set width yields a
predictable height (ink aspect ratio 5.09 : 1).

### The derivation

`--brand-cap` is the printed cap height of PARDUS. Since the letters measure 122.5 viewBox
units tall, one viewBox unit is `--brand-cap / 122.5` pixels — that is `--brand-unit`.
Everything else follows:

```
lockup box width   = 900  × --brand-unit
lockup box height  = 370  × --brand-unit   ( ≈ 3.02 × --brand-cap )
printed ink width  = 851.5 × --brand-unit
left  dead space   = 22   × --brand-unit   ← negative margin trims it
right dead space   = 26.5 × --brand-unit   ← negative margin trims it
```

Trimming both margins makes the element's layout box equal its printed ink, so the P
lands on the gutter and the header can be sized against a height that is known before the
SVG paints.

---

## The scale

| Breakpoint | `--header-h` | `--brand-cap` | Lockup box | Clearance in bar |
|---|---|---|---|---|
| ≥ 1517px | 96px | 22px (clamp ceiling) | 162 × 66 | 15px |
| 1440px | 96px | 20.9px | 153 × 63 | 16px |
| 1180px | 96px | 17.5px (clamp floor) | 129 × 53 | 21px |
| ≤ 980px | 86px | 16.5px | 121 × 50 | 18px |
| ≤ 760px | 76px | 15px | 110 × 45 | 15px |
| ≤ 390px | 76px | 14px | 103 × 42 | 17px |

Other contexts override `--brand-cap` on their own container:

| Context | `--brand-cap` | Why |
|---|---|---|
| Mobile menu | `--header-h × .235` | A full-screen panel, not a 76px bar |
| Footer sign-off | `clamp(20px, 2vw, 26px)` | A step above the header; it is the sign-off |
| Opening sequence | `min(clamp(30px, 6.6vw, 62px), 8.8svh)` | Height-capped so a landscape phone still fits the loader |

Rules that hold at every size:

1. The lockup never exceeds `--header-h` minus 28px inside the header bar.
2. The light and dark headers use the same size. A logo that resizes between pages reads
   as a bug.
3. `--header-h` drives the header height, the hero's `min-height`, `scroll-padding-top`
   and `:target` scroll margin. They are one number, not four.
4. `.brand-link` keeps `min-height: 44px` regardless of how small the lockup gets.

---

## Mark placement

| Where | Treatment |
|---|---|
| Hero, ≥ 761px | Right-hand signature cluster: mark (`clamp(150px, 15.5vw, 218px)`) → gold hairline → "Africa to the world" → "Travel.Explore", right-aligned to the gutter, `z-index: 2` above the media. The hero vignette carries a top-right corner falloff so the cluster reads over the sunset without a visible patch behind it. |
| Hero, ≤ 760px | Hidden. The kicker below already says it, and the header lockup is 80px away. |
| Manifesto | `clamp(96px, 9vw, 132px)`, aligned to the paragraph's first line rather than floated against its centre. Visible on mobile at 104px instead of being hidden. |
| Footer | Emboss at 7.5% opacity, fully inside the panel, rotated −4°. |

---

## Verification

```sh
cd website
npm run check && npm test
PARDUS_BASE=/paradise/ npm run build && node scripts/export-github.mjs
```

Then screenshot at 320 / 390 / 834 / 1180 / 1440 / 1920 and one short landscape viewport,
and confirm for each: the lockup is inside the header with clearance top and bottom, its
ink starts at the gutter, and nothing in the hero signature cluster wraps.
