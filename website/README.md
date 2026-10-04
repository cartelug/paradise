# Pardus Luxury Escapes — V23

A cinematic luxury travel website in midnight navy, with a new sunset island hero, a sixteen-pose leopard walk, a drawn-logo introduction and richer scroll/hover motion, with the approved Pardus logo, a cinematic walking leopard, prominent Maldives and Seychelles escapes, private boat and yacht experiences, and direct enquiries in USD.

Live website: https://cartelug.github.io/paradise/

The revised four-page concept note is available at `documents/PARDUS_Luxury_Escapes_Concept_Note.pdf`. See [HANDOVER.md](../HANDOVER.md) for business settings and ongoing updates.

## Source and publishing

Edit the Astro source in `website/`. The HTML and assets at the repository root are generated GitHub Pages output. Commit source and generated output together.

```sh
cd website
npm ci
npm run check
npm test
PARDUS_BASE=/paradise/ npm run build
npm run export:github
npm run verify:export
```

Push `main` after reviewing the export. Node.js 22 or newer is required. Local development uses a `/` base; GitHub Pages uses `/paradise/`.

## Editing

- `website/src/data/offers.ts`: suggested stays, experiences and illustrative USD prices, inclusions and price bases.
- `website/src/data/site.ts`: contacts and optional delivery/analytics settings.
- `website/src/pages/`: page content and layouts.
- `website/src/styles/luxury.css`: core design and responsive layouts.
- `website/src/styles/cinematic.css` and `website/src/scripts/cinematic.ts`: V23 introduction, walking leopard, reveal and hover motion.
- `website/scripts/make-concept-note.py`: regenerate the PDF after updating offer data.
- `website/scripts/update-travel-desk.py`: fetch the official Uganda CAA news feed.
- `.github/workflows/travel-desk.yml`: refresh travel updates daily.

At the client’s request, all six destinations and four cruise ideas now show **illustrative sample prices in USD**, with their inclusions and price basis. These are design examples, not supplier quotes or bookable offers. Replace the figures with verified rates and set `sample: false` only when approved. Regenerate the PDF and website together.

Enquiries prepare an email draft for the visitor to send, or download a text brief. Direct server delivery remains disabled until a real endpoint is connected and tested. The existing saved Folio, optional detailed planner, journey ideas and Journal remain available.
