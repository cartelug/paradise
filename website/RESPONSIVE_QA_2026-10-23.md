# Pardus responsive release acceptance — 23 October 2026

The responsive refinement passes **408 settled-layout browser cases with no remaining findings**. Six specialists reviewed typography and shared controls, the homepage and approved hero, navigation and footer, inner-page cards and forms, photography, and the visual generation plan.

## Browser coverage

| Coverage | Viewports / setting | Passing cases |
| --- | --- | ---: |
| All 33 routes: core layout | 320, 390, 768, 1024, 1200, 1440 and 1920 CSS px wide | 231 |
| All 33 routes: remaining phone sizes | 360 × 740, 375 × 667, 412 × 915, 430 × 932 | 132 |
| Homepage: additional breakpoint and height checks | Extra cases from 20 widths, including 760/761, 1023/1024, 1199/1200; 1440 × 900 and 1920 × 1080 | 12 unique additions |
| All 33 routes: enlarged text | 390 × 844, 200% root font | 33 |
| **Total** | Unique route/width/height/text-size combinations | **408** |

Every route was checked at all six standard phone viewports: 320 × 640, 360 × 740, 375 × 667, 390 × 844, 412 × 915 and 430 × 932. The ordinary cases keep page zoom at 100%. The enlarged-text cases double the root font from 16 to 32 px; they are not true 200% browser zoom.

Checks measure page width, text ranges within buttons/cards/links/labels, SVG arrow containment, hidden local text overflow, native form-control bounds, broken loaded images and 44 px control targets. Homepage checks also open, scroll and close the mobile menu and saved-trips panel. Hero checks wait for pin placement and measure the approved outline, protected head/paws, artwork aspect ratio, pin links/clearance and the maximum permitted 1.03 breathing envelope. All three desktop pins are present at 1440 × 900 and 1920 × 1080.

The supported cloud-browser interface ran `tests/responsive-qa.html` and its `tests/hero-geometry.js` probe. This covers the phone-fit and hero-geometry requirements without using the legacy Python browser launchers. Reveals and arrivals settle before their final layout is measured. A project identity guard prevents a shared preview change from being mistaken for a Pardus failure. Transient detached-document runs were repeated successfully; only the latest result for each exact case is retained in [the JSON evidence](tests/records/responsive-2026-10-23.json).

Separate live interaction checks confirmed the full introduction appears and releases automatically, a subsequent page uses the quick introduction, the scene pause/resume control changes the animation play state, and selecting Flights plus Boat & yacht cruises carries both choices into the enquiry notes. No enquiry was sent.

## Fixes accepted

- Buttons and their text can shrink and wrap inside their actual cards, with trailing SVG arrows retained inside the pill.
- Footer/email text, header tools, the menu ornament and saved-trips panel stay within the viewport; overlays accommodate safe areas and dynamic height.
- Destination and journey cards align prices and actions; card headings and metadata wrap without forcing a wider grid.
- Planner fields respond to their container width, including narrow laptop columns, and native controls have explicit shrink bounds.
- The tablet hero stacks copy/actions above the complete artwork from 761 to 1023 px. The phone service summary shows the full selection above its action.
- Inner-page headings are bounded by both their intended character width and their container. This resolved the 200% text overflow on Contact, Concept Note and Mediterranean at Human Pace.

## Photography and release checks

Eight native 1536 × 1024 illustrative Dubai images are integrated into the existing photo slots, three experience cards and four discovery tiles. Their exact prompts, truthful alt text and provenance accompany the source masters. The responsive AVIF/WebP derivatives include interpolated 1920 px versions; no native 4K claim is made. Existing offer data and the approved leopard artwork are retained.

Release acceptance also requires Astro diagnostics, all 47 Node tests after the Pages export, both production builds, local-reference/canonical verification and a clean cPanel ZIP. Final command results are recorded in the release handover.

These are Chromium CSS-viewport simulations and settled-layout measurements. Physical devices, Safari, real browser zoom, touch hardware and a full temporal/accessibility audit are not certified by this report. The fixture is kept under `tests/`; its temporary public copy is removed before production builds.
