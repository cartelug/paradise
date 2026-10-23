# Pardus Luxury Escapes — visual generation and component plan

Project: `cartelug/paradise`, production domain `https://pardusescapes.com`, GitHub Pages copy `https://cartelug.github.io/paradise/`. Source files live under `website/`; repository-root HTML and images are generated output. Status: **eight assets generated and integrated; browser layout acceptance complete**. This plan is grounded in the current destination, journey and photography data. All eight Dubai images have been generated and integrated. The [release QA report](RESPONSIVE_QA_2026-10-23.md) records 408 passing layout cases and the limits of this browser review.

## Existing decisions to preserve

- Keep the owner-approved V31 leopard hero, its landscape and portrait art, its unobstructed head/paws, its calm breathing motion and its pause/reduced-motion behaviour. The generic Dubai hero scenes below are for destination/editorial use, never replacements for that homepage artwork.
- Keep the permanent branded preloader on every page and both full/quick versions. New photography must not delay the opening indefinitely.
- Preserve the primary tagline, **Extraordinary journeys. Personally curated.**, the approved logo, the current five navigation labels and **Plan your escape** as the primary action.
- Follow current `CLAUDE.md`: **Archivo only**, roman and italic, site-wide. README and older HANDOVER descriptions of Montserrat are historical. Do not introduce a font change as part of image generation.
- Keep offer prices, durations, inclusions, verified company details and official travel-desk content unchanged. Do not invent accommodation inventory, availability, partners, reviews or credentials.
- No emoji or text-glyph icons. Extend the existing 24 px SVG family in `src/data/icons.ts` only where necessary; use its 1.5 stroke, round caps and joins.
- Existing authentic photography is a valid fallback. A new generated picture only replaces it when it is accurate, useful, integrated, and truthfully described.

## Current Dubai production register

The current release integrates eight illustrative Dubai assets. Generation uses the **built-in image-generation tool**, one distinct scene per asset. The accepted tool outputs are native **1536 × 1024** landscape images. They are not native 2400 px, 4K, 48 MP, documentary photography, or photographs of a specific contracted property or yacht.

| Asset ID | Photo slot | Intended consumers | Current status |
| --- | --- | --- | --- |
| `dubai-marina` | `dubai` | Dubai destination hero/cards, homepage Dubai escape and Celebration in Two Acts journey | Generated and integrated |
| `dubai-yacht` | `yacht` | Homepage cruise band, cruise hero and Dubai yacht experience card | Generated and integrated |
| `dubai-dining` | `dubai-dining` | Dubai dining/stay experience card | Generated and integrated |
| `dubai-desert` | `dubai-desert` | Dubai desert experience card | Generated and integrated |
| `dubai-creek` | `dubai-creek` | New Dubai four-tile gallery | Generated and integrated |
| `dubai-downtown` | `dubai-downtown` | New Dubai four-tile gallery | Generated and integrated |
| `dubai-beach` | `dubai-beach` | New Dubai four-tile gallery | Generated and integrated |
| `dubai-skyline` | `dubai-skyline` | New Dubai four-tile gallery | Generated and integrated |

The `PhotoSlot` union has been extended for the six individual Dubai slots. The shared `dubai` and `yacht` slots continue to serve existing components. Every new gallery tile needs a concise live caption, truthful alt text and the same disclosure treatment as the other generated Dubai imagery. The new images are destination illustrations, not evidence of current availability, exact views from a booked room, a named dining venue, or a particular charter vessel.

Other destination photography is retained. The six destination-card and journey mappings below identify the complete visual system, not a mandate to replace every existing image. The approved homepage leopard remains unchanged. The 14-scene optional Dubai queue later in this document is **future work**, separate from these eight current production assets.

## Art direction

Use believable editorial travel photography: natural light, controlled contrast, clean colour, real material texture, and ordinary atmospheric depth. Dubai should feel specific and inhabited, with a balance of skyline, waterfront, desert, heritage, and everyday discovery. Avoid exaggerated gold grading, floating architecture, plastic surfaces, repeated buildings, fake signage, and generic luxury stock clichés.

Generate one distinct scene per asset. Keep page headings, prices, ratings, labels, destination names, and all calls to action as live HTML. Do not generate these into photographs. Keep the established logo unchanged. Use the site's existing SVG icon family or create matching SVG symbols in code; raster generation is unsuitable for small interface symbols.

## Complete destination-card plan

Six destination cards and their detail pages already exist. Images flow through `src/data/photography.ts` and `src/data/v31-photography.ts`, with source originals and provenance in `source-assets/v31-photography/credits.json`.

| Live card / route | Existing photo slot | New scene brief | Existing content to retain | Caption/alt constraint |
| --- | --- | --- | --- | --- |
| The Maldives / `destination-maldives.html` | `maldives` | Natural lagoon, sand and overwater architectural detail; no invented named resort | Destination copy, offer duration, price and inclusions | Remove any old named-property alt if replaced; describe generated architecture as illustrative |
| Zanzibar / `destination-zanzibar.html` | `zanzibar` | Palm-lined shore with plausible Indian Ocean light; distinguish from Maldives villas | Destination copy, Stone Town/coast story and safari combination | Do not imply a particular resort, private access or exact hotel |
| Seychelles / `destination-seychelles.html` | `seychelles` | Granite boulders, palm-fringed shoreline and clear shallows | Existing island-hopping and nature-led content | Named island only when reference-verified; generic coast is labelled as illustrative |
| East Africa / `destination-africa.html` | `safari-uganda` | Believable East African savannah and wildlife in natural habitat | Wildlife-not-guaranteed language and existing safari offer | Current caption says Amboseli, Kenya; if a new Uganda/generic scene is used, update the caption to match instead of relabelling geography |
| Europe / `destination-europe.html` | `europe` | Mediterranean waterfront or coastal settlement with credible real-world form | Existing culture/coast story and offer | Current caption says Santorini; either verify and depict that location or change caption to a truthful wider-region description |
| Dubai / `destination-dubai.html` | `dubai` | Dubai Marina at late afternoon or blue hour, referenced architecture, ordinary city scale | City/desert/coast narrative and all supplied offer data | Generated Marina-inspired scene uses an illustrative waterfront caption and alt text |

### Existing reusable photography slots

These 12 pre-existing slots cover the existing pages without inventing new destination listings. Retain verified photography outside the `dubai` and `yacht` replacements in this release. The other scene briefs are future options only; generate separate scenes when a genuine component need is approved.

| Slot / source filename | Existing consumers | Current treatment / future scene brief |
| --- | --- | --- |
| `hero-maldives` / `hero-maldives.jpg` | Private Island Reset journey and related surfaces; **not** the leopard homepage hero | Calm unbranded overwater/lagoon setting at dusk; retained this release |
| `maldives` / `maldives.jpg` | Maldives destination, featured escape and Maldives journal | Lagoon and considered island-stay atmosphere; retained this release |
| `zanzibar` / `zanzibar.jpg` | Zanzibar destination, Safari & Shore journey, Zanzibar journal | Shoreline distinct from Maldives; retained this release |
| `seychelles` / `seychelles.jpg` | Seychelles destination and featured escape | Granite-and-palm coastline; retained this release |
| `safari-uganda` / `safari-uganda.jpg` | East Africa destination card and page | Verified country/landscape or truthfully generic East African scene; retained this release |
| `safari-family` / `safari-family.jpg` | Family in the Wild journey | Natural savannah discovery setting; do not fabricate recognisable customers or a particular sold vehicle/camp; retained this release |
| `europe` / `europe.jpg` | Europe destination and Mediterranean at Human Pace journey | Mediterranean coast with accurate caption; retained this release |
| `dubai` / `dubai.jpg` | Dubai destination, featured escape and Celebration in Two Acts journey | Replace through the shared slot with generated illustrative `dubai-marina`; integrated |
| `yacht` / `yacht.jpg` | Homepage private-cruises section and `cruises.html` | Replace through the shared slot with illustrative `dubai-yacht`; no named vessel or charter inventory claim; integrated |
| `corporate` / `corporate.jpg` | Corporate travel and Executive Arrivals journey | Unbranded airport lounge / refined travel context; no implied owned aircraft; retained this release |
| `journal-safari` / `journal-safari.jpg` | Safari editorial | Distinct plausible wildlife/landscape scene; no guaranteed sighting implication; retained this release |
| `journal-process` / `journal-process.jpg` | How a Journey Comes Together editorial | Tactile travel planning still life without readable fake bookings, documents, customer details or invented prices; retained this release |

### Signature journey card mapping

| Existing journey | Image slot | Distinct visual purpose |
| --- | --- | --- |
| Safari & Shore | `zanzibar` | Show the slower coastal conclusion rather than duplicate the safari visual |
| Private Island Reset | `hero-maldives` | Quiet dusk scene contrasts with daytime Maldives destination image |
| Celebration in Two Acts | `dubai` | City energy leading into the island narrative |
| Family in the Wild | `safari-family` | Open landscape and discovery; no invented family testimonial or likeness |
| Mediterranean at Human Pace | `europe` | Coherent, unhurried coast/culture setting |
| Executive Arrivals | `corporate` | Business travel context without asserting owned fleet or a specific airline cabin |

### Component text and symbol register

| Existing content group | Keep as live text | Existing SVG names |
| --- | --- | --- |
| Destination cards / chips | Place names, countries, nights, price bases, summaries and links | `pin`, `clock`, `arrow-right`, `bookmark` |
| Offer inclusions | Hotel nights, breakfast, airport transfers and every other supplied inclusion | Use existing inclusion component; `bed`, `dining`, `car`, `check` where already mapped |
| Travel services | Flights, luxury hotels & resorts, private transfers, visa guidance, boat & yacht cruises | `plane`, `bed`, `car`, `passport`, `yacht` |
| Further services | Safaris, honeymoons, family holidays, group travel, corporate travel, private tours, activities, custom itineraries | `paw`, `heart`, `sun`, `users`, `briefcase`, `landmark`, `sparkle`, `compass` |
| Brand promises / booking | Personal attention, thoughtful details, seamless service, existing booking-step copy | `chat`, `heart`, `shield`, existing step symbols |
| Contact / travel desk | Real email addresses, verified telephone, dated official notices and source links | `mail`, `phone`, `chat`, `news`, `external` |
| Controls | Menu, saved trips, close, pause, play, filters and enquiry validation | `menu`, `bookmark`, `close`, `pause`, `play`, accessible live control labels |

## Future Dubai scene / variation queue — 14 optional assets

These are future scene or crop variations, not additional images claimed as generated in this release. Where a subject overlaps the eight current production assets, generate another version only if it serves a distinct composition or editorial purpose. They are not new destination inventory, bookable experiences or claims that every place is offered. Do not add 14 new pages solely because images exist.

| Future asset ID | Proposed subject / variation | Potential use | Frame and safe crop | Status |
| --- | --- | --- | --- | --- |
| `dubai-skyline-editorial-v2` | Skyline and Burj Khalifa, alternate daylight mood | Dubai editorial feature; never the approved leopard homepage hero | 16:9; central 55% subject safe area | Optional future |
| `dubai-downtown-v2` | Downtown from a distinct pedestrian viewpoint | Future Downtown editorial variation | 3:2; allow 4:3 crop without clipped landmark | Optional future |
| `dubai-marina-v2` | Marina at another time of day | Future card/editorial variation, only if useful | 3:2; balanced waterfront and towers | Optional future |
| `dubai-jumeirah-coast` | Jumeirah shoreline with distant Burj Al Arab | Coastal supporting scene | 3:2; plausible landmark scale; level horizon | Optional future |
| `dubai-desert-v2` | Dunes with a different light and composition | Future desert editorial variation | 3:2; dune texture and calm horizon | Optional future |
| `dubai-creek-abra-v2` | Abra crossing Dubai Creek | Future heritage variation | 3:2; vessel and waterside context in safe area | Optional future |
| `dubai-al-fahidi` | Heritage lane and wind-tower architecture | Old Dubai editorial scene | 3:2; preserve architectural character in 4:3 crop | Optional future |
| `dubai-palm-jumeirah` | Palm shoreline or reference-verified aerial | Possible Palm editorial scene | 3:2; verified geography required | Optional future |
| `dubai-bluewaters` | Waterfront and Ain Dubai location marker | Waterfront editorial scene | 3:2; complete wheel in safe crop | Optional future |
| `dubai-city-walk` | Pedestrian City Walk streetscape | City discovery editorial scene | 3:2; avoid invented readable shop names | Optional future |
| `dubai-jumeirah-beach-v2` | Beach with alternate coast/city balance | Future beach editorial variation | 3:2; no private-access implication | Optional future |
| `dubai-madinat-waterways` | Madinat waterways and architectural context | Future heritage/coast editorial | 3:2; reference-verified architecture | Optional future |
| `dubai-museum-future` | Museum of the Future exterior | Future architecture editorial | 3:2; exact geometry/calligraphy needs reference or authentic photo | Optional future |
| `dubai-evening-waterfront` | Restrained blue-hour waterfront | Closing Dubai editorial section | 16:9; realistic reflections and calm highlights | Optional future |

For any live place omitted here, add one register entry with its exact name, verified visual reference, route, usage, crop, alt text, and prompt. Do not add redundant files merely to inflate the count.

## Prompt system

Use the following base instructions with one scene module. The final generation log must retain the complete prompt, output filename, tool mode, date, and accept/reject decision.

**Base prompt**

> Use case: photorealistic-natural. Asset type: editorial destination photograph for the existing Pardus Luxury Escapes website. Create a natural, credible photograph of [SCENE]. Use coherent real-world architecture and geography, believable scale, restrained colour, realistic light falloff, fine natural texture, and a level horizon. Compose as a landscape photograph with the main subject inside the central 55% so desktop and mobile card crops retain it. Leave useful breathing room around landmark edges. One continuous photograph, no collage. No marketing copy, logos, captions, watermarks, invented readable signage, fantasy buildings, excessive HDR, orange-teal filters, plastic surfaces, or oversharpening. This is an illustrative generated image and must not purport to document current conditions or a named bookable property.

**Current eight-asset brief**

These modules describe the intended scene and acceptance criteria. The final provenance log must retain the actual complete tool prompt for each generated output; a planned module is not a claim that it was the verbatim generation prompt.

| Current asset | Scene brief |
| --- | --- |
| `dubai-marina` | A naturally exposed Marina waterfront with credible tower spacing, calm dusk reflections and enough architectural breathing room for hero and card crops. |
| `dubai-yacht` | An unbranded motor yacht on Dubai coastal water, realistic hull, railings, wake and skyline scale; illustrative, with no claim that this exact vessel is offered. |
| `dubai-dining` | A refined unbranded Dubai dining setting with natural table materials and believable ambient light; no named venue, invented menu, hotel identity or bookable-view guarantee. |
| `dubai-desert` | Rolling Dubai desert dunes with fine sand texture, natural low-angle light, soft shadows and no fabricated camp infrastructure or implied included activity. |
| `dubai-creek` | Dubai Creek with believable waterfront context and traditional abra character; truthful geographic description and no invented event or specific operator. |
| `dubai-downtown` | Downtown Dubai with a coherent real-world skyline, recognisable landmark proportions, plausible city depth and enough space for the gallery crop. |
| `dubai-beach` | A calm Dubai shore with natural sea, sand and distant city context; no private-access, named-hotel or exact-property-view implication. |
| `dubai-skyline` | An expansive Dubai skyline with coherent architecture, realistic atmospheric depth and restrained natural light; the gallery scene does not replace the approved leopard hero. |

**Scene briefs for retained slots and future alternatives**

| Slot | Scene module |
| --- | --- |
| `hero-maldives` | A quiet Maldivian lagoon at blue hour, unbranded overwater architecture in the middle distance, restrained warm room lights and realistic calm-water reflections; no identifiable resort or promise of a specific room. |
| `maldives` | A bright but naturally exposed Maldivian lagoon, pale sand and a small amount of unbranded overwater architectural detail, turquoise shallows with believable depth transitions and a gentle horizon. |
| `zanzibar` | A plausible palm-fringed Zanzibar shore with pale sand, textured Indian Ocean water and soft late-afternoon light; keep the shore recognisably different from an overwater-villa destination and do not invent a hotel. |
| `seychelles` | A Seychelles-inspired granite-and-palm cove with textured pale sand, clear shallows and lush coastal vegetation, natural daylight and coherent boulder shapes; no specific island claim without a verified reference. |
| `safari-uganda` | A natural East African savannah in early morning, believable terrain and native wildlife at an appropriate distance; country and park claims must follow the supplied verified reference, otherwise keep the description regional. |
| `safari-family` | A spacious East African landscape from a plausible safari viewpoint, a winding track and distant native wildlife, warm gentle daylight and a sense of discovery; no invented customers, branded vehicle, lodge or guaranteed animal encounter. |
| `europe` | An unhurried Mediterranean coastal settlement and sea in natural late-afternoon light, credible masonry, vegetation, coastline and everyday scale; no named-location claim unless the supplied reference supports it. |
| `dubai` | Dubai Marina with plausible tower spacing and a recognisable waterfront arrangement based on verified reference, late-afternoon or blue-hour light, believable water reflections and restrained highlights. |
| `yacht` | One generic unbranded white motor yacht on believable Dubai coastal water, enough skyline context to suggest the destination, realistic wake, railings, hull geometry and natural sunset light; no fleet ownership, vessel name or exact charter promise. |
| `corporate` | A refined unbranded airport lounge travel scene with natural daylight, a carry-on case and understated materials, no readable boarding pass, corporate identity, recognisable traveller or owned-aircraft implication. |
| `journal-safari` | A distinct naturally photographed East African wildlife-and-landscape moment, physically plausible animals in suitable habitat and soft daylight; no staged contact or implied guaranteed sighting. |
| `journal-process` | An editorial travel-planning still life on a tactile desk with a closed unbranded notebook, pen and subtle map-like paper texture; no readable customer data, fabricated tickets, passport details, hotel names or prices. |

**Future Dubai prompt modules**

| Asset | Scene module |
| --- | --- |
| Skyline hero | Dubai's skyline in soft morning light, Burj Khalifa clearly identifiable, a plausible city foreground, subtle atmospheric haze, calm sky and an expansive composition suitable for a wide hero. |
| Downtown | A street-to-skyline view of Downtown Dubai in warm afternoon light, Burj Khalifa visible with correct overall proportions, ordinary urban depth and natural surfaces. |
| Marina | Dubai Marina seen from the waterfront promenade in late-afternoon light, believable tower spacing and reflections, boats only where geographically plausible, balanced foreground water and skyline. |
| Jumeirah coast | Dubai's Jumeirah coastline with the recognisable sail-shaped Burj Al Arab visible at a plausible scale in the distance, turquoise water and pale sand in natural daylight. |
| Desert | Unspoilt rolling Dubai desert dunes at sunrise, fine sand texture, long soft shadows, gradual warm colour transitions, no vehicles, no camps, no promotional objects. |
| Creek | A traditional wooden abra crossing Dubai Creek in gentle daylight, rippling water, a credible waterside architectural backdrop and ordinary human scale. |
| Al Fahidi | A quiet Al Fahidi heritage lane with sand-toned walls, wind-tower architecture, real plaster texture and soft side light; no fake historic inscriptions. |
| Palm Jumeirah | A natural coastal photograph of Palm Jumeirah based on the supplied verified location reference; preserve the actual geographic arrangement and avoid inventing neighbouring buildings. |
| Bluewaters | Bluewaters Island's waterfront with Ain Dubai recognisable in a verified geographic arrangement, clear daylight, realistic pedestrian scale, correct wheel geometry. |
| City Walk | A credible City Walk pedestrian streetscape in Dubai, restrained modern façades, planting and street furniture, subtle life at a distance, no prominent readable business branding. |
| Jumeirah beach | An open Jumeirah beach scene with pale sand, clear Gulf water and a credible Dubai city backdrop, peaceful natural daylight, no invented private club or exclusive-access cues. |
| Madinat | Madinat Jumeirah waterways and traditional-inspired buildings based on the supplied location reference, gentle reflections, natural materials, no fabricated restaurant or hotel branding. |
| Museum | Museum of the Future exterior based precisely on a supplied verified photographic reference; preserve its distinctive shape and real façade geometry. If exact façade calligraphy cannot be retained, use authentic licensed photography instead. |
| Evening waterfront | A believable Dubai waterfront at blue hour, a credible city skyline, restrained warm window lights, natural water reflections, no fireworks, artificial neon, or fantasy skyline. |

For future generation, use photographic references for every distinctive landmark before generation. Source rights must allow the intended use. A generation reference is evidence for visual accuracy, not permission to reproduce a photographer's distinctive composition.

## Component-by-component implementation

| Component | Visual treatment | Live text rules | Symbol treatment | Responsive requirements |
| --- | --- | --- | --- | --- |
| Homepage hero | Preserve the approved V31 leopard desktop/phone artwork and native aspect ratios; do not replace with the Dubai queue | Real HTML heading, supporting copy, CTA; let wording wrap naturally; avoid manual desktop `<br>` breaks on phones | Existing arrow / navigation SVG and current priced pins | At 320px and above, keep every label and control clear of the measured leopard outline; preserve uncut head, ears, whiskers and paws |
| Destination / place cards | One specific place image; consistent 4:3 display ratio | Name, location, category and summary are independent text fields; no title ellipsis that hides place identity; summaries may be editorially shortened | Pin, arrow, bookmark as consistent SVGs where the feature exists | `minmax(0, 1fr)` grid tracks; `min-width: 0` text containers; naturally growing cards; aligned CTA row without fixed text height |
| Place detail hero | Use the place's own image and a larger derivative | Unique H1, real location, verified content only | Breadcrumb and location SVGs | A mobile H1 must stay readable without horizontal clipping; gallery does not force viewport width |
| Gallery | Related scene views only; no duplicate image masquerading as different viewpoints | Descriptive alt text; optional real HTML captions | Gallery arrows and close controls | Touch-sized controls; keyboard navigation when a lightbox exists; images remain within the viewport |
| Category / experience cards | Distinct editorial image matched to existing category | Live category name and factual short description | Existing matching icon family | A single clear reading order; one-column fallback before labels become cramped |
| Fact / feature cards | No unnecessary image if a symbol is clearer | Verified label/value; allow values and units to wrap together thoughtfully | SVG stroke width and optical size consistent | Prevent isolated orphaned units; no fixed-height clipping; support long values |
| Testimonials / people | Preserve supplied authentic photos only | Do not fabricate reviews, identities or roles | Quote SVG if already part of design | Long names and multi-line quotes must fit without clipping |
| Navigation / footer | Existing brand assets; no decorative photo required | Legible live links and contact information | Accessible close/menu/social SVGs | No desktop nav squeeze; full mobile menu text; long email/URL wrapping; visible keyboard focus |
| Contact / inquiry | Optional quiet editorial feature image | Form labels, errors and success messages are live text | Form icons only when useful | Inputs use readable sizing; validation text grows naturally; buttons wrap safely; never claim a submission succeeded unless it did |

## Text, symbols and normal-zoom layout acceptance

- Keep the normal browser zoom at 100% during the main responsive matrix. Do not use CSS `zoom`, a transformed page wrapper, smaller root font sizing, or disabled browser text scaling to hide layout faults.
- Use fluid type with sensible minimums and maximums. Body copy remains readable; line length and layout should change before text is made unnaturally small.
- Remove accidental `word-break: break-all`, overly narrow flex children, forced title heights, `white-space: nowrap` on long text, and desktop-only manual line breaks.
- Use `overflow-wrap: anywhere` for long user-entered tokens such as URLs and emails, not indiscriminately for polished display headings.
- Use logical padding and gaps. Give text grid/flex children `min-width: 0`; use `minmax(0, 1fr)` where intrinsic content otherwise expands a grid.
- Give icons explicit inline/block dimensions and `flex-shrink: 0`; align them to the first line or centre of a defined control. Decorative icons use `aria-hidden="true"`; icon-only actions need accessible names.
- Text must not be baked into a generated graphic. Any map, route, price, date, metric or contact detail must be based on verified data and rendered accessibly.
- Validate 320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1366, 1440 and 1920 CSS-pixel widths at normal zoom. Include phone landscape and short desktop viewports.
- Then check 200% zoom/text enlargement and reduced motion as accessibility checks. Passing sampled widths is evidence of robust responsive behaviour, not proof that every physical device is perfect.
- Across every route: no document horizontal overflow, overlap, clipped card title, mid-word heading breaks, separated symbol/label pairs, hidden CTA, broken image, inaccessible mobile navigation, or layout jump caused by missing image dimensions.

## Image delivery and performance

1. Preserve approved originals and record provenance. Use the existing V31 photography slot system and its six new Dubai slots. Place accepted originals under `website/source-assets/v31-photography/`; write truthful `alt`, `source: "AI-generated, illustrative"` and crop focus into `credits.json`. Current generated originals are native **1536 × 1024**. Preserve this fact in provenance; do not describe them as native 2400 px, 4K or 48 MP.
2. Use `website/scripts/prepare-v31-photography.mjs` to produce the site's existing 640, 1280 and 1920 px AVIF/WebP variants and the generated slot map. The 1920 px derivatives interpolate the 1536 px originals; they do not contain native 1920 px detail. Do not hand-edit `src/data/v31-photography.ts` or create a competing image naming system. The existing `Picture.astro` consumes these derivatives. Additional Dubai gallery assets need a deliberate extension of the same image system rather than loose hard-coded filenames.
3. Set explicit source dimensions or `aspect-ratio` to reserve space. Use `srcset` and accurate `sizes` for grid breakpoints. Set a per-image `object-position` where the safe crop differs.
4. Prioritise the main above-fold hero only. Lazy-load below-fold cards and galleries; do not preload every generated image.
5. Start with visual quality targets of roughly 60–160 KB for card images and 180–350 KB for desktop hero images, then assess actual fidelity and network cost. These are working budgets, not reasons to visibly damage an image.
6. Write truthful alt text from the accepted image. Do not call an illustration an actual property photograph, current view, supplied service, or documentary image. Decorative photography can use empty alt text when nearby content already conveys its purpose.
7. If generated images could imply real accommodation, bookable property, current venue conditions, or a service actually provided, use authentic approved photographs or add a concise visible illustrative-image disclosure near the relevant content. Do not bury a material distinction in alt text.

## Final generation and QA log

For each accepted asset, record:

| Field | Required value |
| --- | --- |
| Asset ID | Register ID above or an exact existing-place ID |
| Consuming route/component | Actual source route and component |
| Place verification | Reference source and any visual limitations |
| Final prompt | Complete prompt used, including scene and crop instructions |
| Tool mode | Built-in image generation, unless the user explicitly chooses a supported fallback |
| Accepted original | Exact filename and dimensions |
| Web derivatives | Exact filenames, dimensions, formats and byte sizes |
| Crop/focal point | Desktop, mobile and card `object-position` decisions |
| Accessible description | Alt text or decorative designation |
| Acceptance result | Architecture, horizon, texture, people, signage, crop and responsive checks |

Publish only assets that are actually integrated and verified in their intended components. Keep unused accepted images in an organised asset pool for later work; keep future generation items clearly marked as pending.


## Release completion gate

Update the current production register only after all eight outputs exist, their provenance and actual dimensions are recorded, the consuming components use them, card/gallery crops have been reviewed, and the appropriate build/export checks pass. Until that confirmation, the status remains **integration in progress**. A generation-plan entry alone does not prove that an image has been generated or shipped.
