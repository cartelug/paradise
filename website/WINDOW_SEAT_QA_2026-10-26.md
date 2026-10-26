# Selected Window Seat section — release verification

Owner-selected reference: `source-assets/v39-window-seat/selected-reference.jpeg`.
The new band replaces only the previous Who We Are and tall destination stage. The hero, permanent preloader, later homepage sections and supplied offer data remain in place.

- `npm run check`: 110 files, no errors, warnings or hints.
- GitHub Pages build: all 33 routes generated; source and exported output included together.
- Full Node test suite with two concurrent workers: 64 passed, zero failed or skipped. Reduced worker concurrency avoids excessive parallel image-decoder memory use.
- `npm run verify:export`: 33 HTML pages and 41 generated text assets verified; every `/paradise/` reference resolves.
- Cloud-browser review: desktop preview, 390 px and 320 px phone frames, plus 390 px with 200% root text size.
- Normal phone and enlarged-text review had document scroll width equal to client width (375 px usable within the 390 px frame with its desktop scrollbar). Every link in the selected band had a target of at least 44 × 44 CSS px.
- At enlarged text, decorative heading artwork yields to native wrapping text and the cards become readable rows.
- Open/close menu verified; Islands link selects the existing Islands & beaches filter and shows Maldives, Seychelles and Safari & Zanzibar.
- The dark header uses the existing white/gold logo and three-line menu; the floating CTA stays hidden while the selected band is visible.
- Transparent portrait, native vector lettering and all three capsule photographs visually inspected on navy. Generated reconstructions follow the selected composition; exact individual rosettes and photographic background details are not claimed to be pixel-identical to the reference.

Browser review used the existing preview daemon and a temporary comparison page. The comparison page is excluded from the shipped export. Physical-device / iOS Safari certification is not claimed.
