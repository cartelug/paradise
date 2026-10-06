# Image sources

Approved Pardus logo: user-uploaded JPEG. V24 refreshes the destination and yacht photography with verified, freely licensed Unsplash photographs. Retained legacy assets are documented below. Photography illustrates locations and experiences; it is not evidence of owned properties or supplier partnerships.

The logo in `public/brand/` is a deterministic vector reconstruction of the approved JPEG. It preserves the leopard outline, aircraft, wordmark and tagline. Primary, light and monochrome versions include SVG and real-alpha PNG exports from 512 to 4096 pixels wide. The current header and footer use faithful vector paths from `src/data/logo.json`. V22 traces the 1280 × 720 approved October logo, including its diagonal aircraft; the original is preserved in `source-assets/pardus-approved-logo-2026-10.jpeg`.

## Typography

- Satoshi Light, Regular, Medium and Bold were supplied by the user in `satoshi.zip` and converted locally from OTF to WOFF2 for web delivery.
- Montserrat was supplied by the user in `montserrat.zip`; the variable TTF was converted locally to WOFF2. The OFL text is kept at `public/fonts/Montserrat-OFL.txt`.
- Fraunces is provided by the checked-in `@fontsource-variable/fraunces` dependency.

Confirm that the supplied Satoshi files are approved for public web use before a commercial launch. The site no longer loads fonts from Fontshare.

## Travel.Explore sandbank scene (retained legacy asset)

The `section-3-sandbank-*` family was the former homepage Travel.Explore chapter, produced by `scripts/prepare-images.mjs` from `source-assets/section-3-sandbank-desktop.png` (1672 × 941) and `-mobile.png` (941 × 1672), added on 11 September 2026 (commit 687c32d). Their source was not recorded when they were added. Confirm the source and usage rights before a commercial launch.

## Retired artwork (removed in V21)

No page uses these families any more, so V21 removed them from `public/images`, `source-assets` and the image script. They remain in git history: `pardus-hero-*` (earlier AI-generated homepage hero), `section-2-coast-*`, `section-4-terrace-*` and `section-5-arrival-*` (V4 scroll scenes, source not recorded), and `v3-studio-*`, generated for Pardus V3 with the built-in OpenAI image-generation workflow on 14 September 2026, depicting a fictional private-travel planning table. Its prompts are kept below for the record.

Desktop prompt: “Create a cinematic editorial photograph of a refined dark-stone travel-planning table on an East African coastal terrace at blue hour, with a tactile route map, brass compass, navy folio, handwritten planning card, understated sunglasses and one white frangipani; quiet-luxury magazine art direction, generous negative space, no people, logos, readable text or conspicuous wealth symbols.”

Mobile prompt: “Create a coordinated portrait version of the same coastal planning-table scene for a narrow screen, with the objects forming a confident diagonal through the lower two-thirds and a calmer upper quarter; preserve the restrained navy, slate, ivory and brass palette; no people, logos or readable text.”

`public/brand/97-design-logo.png` (+`@2x`) is the 97 Design maker's mark used for the "Made by 97 Design" footer credit, trimmed and resized from `source-assets/97-design-logo-source.png` by `scripts/prepare-97-logo.mjs`.

- hero: https://images.unsplash.com/photo-1762254923872-5bdc4210eb90?auto=format&fit=crop&w=2000&q=85
- maldives: https://images.pexels.com/photos/9482140/pexels-photo-9482140.jpeg?auto=compress&cs=tinysrgb&w=1500
- zanzibar: https://images.unsplash.com/photo-1762118817730-955d832b2cb7?auto=format&fit=crop&w=900&q=80
- africa: https://images.unsplash.com/photo-1599921777960-ac7c40d1bc60?auto=format&fit=crop&w=1000&q=80
- europe: https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80
- dubai: https://images.unsplash.com/photo-1744416328915-1341add4a393?auto=format&fit=crop&w=1000&q=80
- seychelles: https://images.pexels.com/photos/30358268/pexels-photo-30358268.jpeg?auto=compress&cs=tinysrgb&w=1100
- corporate: https://images.pexels.com/photos/20562278/pexels-photo-20562278.jpeg?auto=compress&cs=tinysrgb&w=1400

## V20 coastal horizon

The `v20-horizon-*` family was generated with the built-in OpenAI image tool on 15 September 2026. The landscape and portrait masters are separate compositions of an imagined Indian Ocean coastline at blue hour, with granite, palms, distant islands and a small warm architectural light. They do not depict a verified named hotel or supplier. The brief calls for natural photographic detail, generous clear sky for the separately rendered Pardus identity, and no text or logos.

Desktop sources: 960 and 1586 pixels wide. Mobile sources: 480 and 960 pixels wide. AVIF is preferred, with WebP fallback. `Horizon.astro` selects the correct art direction; the opening uses the smaller derivatives. Masters and six image-generated UI concepts, with their prompts, are included in the separate V20 handoff. Sharp produced the responsive size and format derivatives. Brand marks and all text remain real vector/HTML elements.

## V22 walking leopard and yacht scene

Generated on 4 October 2026 with OpenAI image generation. The photographic leopard is an eight-frame transparent 4 × 2 walk cycle, converted to `leopard-walk.webp` and animated with CSS. It is a decorative Pardus brand character, not wildlife footage. The yacht scene is a generic, imagined Indian Ocean sunset with no identifiable operator, property or destination landmark. It has AVIF/WebP responsive derivatives at 640, 1280 and 1920 pixels. It is not evidence of a named vessel being available.

Generation briefs: a realistic adult leopard walking elegantly in eight consistent right-facing poses, locked camera and baseline, transparent background, natural anatomy and no text or logos; a cinematic photographic white motor yacht on calm teal ocean water at sunset, generic island coastline, restrained luxury styling, generous dark space for HTML copy, no text, logos or identifiable landmarks. Sharp produced size and format derivatives; all copy and the approved logo remain native HTML/vector elements.

## V23 cinematic assets

Generated with OpenAI ImageGen on 4 October 2026: `source-assets/v23-island-hero.png` and `source-assets/v23-leopard-walk.png`. The hero depicts an imagined Indian Ocean island, not a named property. It was prompted as a striking sunset photograph with a crescent of white sand, luminous turquoise lagoons, palms, overwater villas and open space on the left for live text. The leopard was prompted as a consistent realistic adult in sixteen right-facing walk-cycle poses, a locked camera and ground baseline, natural anatomy and real alpha transparency. A second image edit removed the background while preserving the animal poses.

`website/scripts/prepare-v23-assets.mjs` creates responsive AVIF/WebP hero derivatives and aligns the sixteen alpha poses into one horizontal WebP sprite. Frame anchors are recorded in `source-assets/v23-frame-alignment.json`. The original approved logo is animated directly from the established vector paths; no new logo was generated.

## V24 researched destination photography

Verified on 4 October 2026. All eight selected photographs are freely usable for commercial web display under the [Unsplash License](https://unsplash.com/license), not Unsplash+. Dates below are the uploader’s publication dates, not claimed capture dates. These are real location photographs, replacing the active generated hero/yacht scenes and the older destination families. They do not establish a resort or vessel partnership, or guarantee that a pictured property is included in a sample price.

| Asset | Location | Photographer | Published | Source |
| --- | --- | --- | --- | --- |
| `hero-maldives-v24` | Maldives | Rafael Peier | 2026-06-24 | [Photo](https://unsplash.com/photos/zJ5IHm2UyVI) |
| `maldives-v24` | JOALI Maldives, Muravandhoo Island, Maldives | Fayaz Moosa | 2025-07-03 | [Photo](https://unsplash.com/photos/2jUzVYS5URE) |
| `seychelles-v24` | La Digue Island, Seychelles | Datingscout | 2025-02-17 | [Photo](https://unsplash.com/photos/KxKzp4e7gak) |
| `dubai-v24` | Dubai Marina, Dubai, United Arab Emirates | Nejc Soklič | 2026-01-10 | [Photo](https://unsplash.com/photos/city-skyline-at-dusk-with-warm-orange-sky-2sTdng2g7mM) |
| `africa-v24` | Amboseli National Park, Kenya | Sweder Breet | 2025-02-02 | [Photo](https://unsplash.com/photos/wZE7X2sYgfU) |
| `zanzibar-v24` | Z-Lodge Zanzibar, Zanzibar, Tanzania | Jack Balke | 2025-09-16 | [Photo](https://unsplash.com/photos/pZo2wyXQr-Q) |
| `europe-v24` | Santorini, Greece | User_Pascal | 2025-05-23 | [Photo](https://unsplash.com/photos/EBtf5Zpgips) |
| `yacht-dubai-v24` | Dubai Marina, Dubai, United Arab Emirates | Dawid Tkocz | 2026-01-15 | [Photo](https://unsplash.com/photos/RYnf6TWBaQc) |

Masters, download URLs, alt text and SHA-256 checksums are in `website/source-assets/v24-photography/credits.json`. `website/scripts/prepare-v24-photography.mjs` produces local 3:2 crops as AVIF/WebP at 640, 1280 and 1920 pixels. The new versioned filenames avoid stale image caches. The V23 generated leopard and approved vector logo remain unchanged.

## V25 campaign artwork

Generated with the built-in image-generation tool on 5 October 2026. A realistic leopard is combined with island villas, a yacht and Dubai-inspired city lights in a deliberate campaign composite. The scenes do not coexist geographically; the artwork does not show a specific bookable property. Desktop master: `website/source-assets/v25/pardus-hero-desktop.png` (1536 × 1024). Portrait master: `website/source-assets/v25/pardus-hero-mobile.png` (1024 × 1536). Full prompts are in `website/source-assets/v25/ARTWORK.md`. Responsive AVIF/WebP versions are produced by `website/scripts/prepare-v25-assets.mjs`. Portrait art is selected below 900 px; the logo still uses the approved vector paths. The V24 real destination and Dubai yacht photographs remain active throughout the rest of the website. The earlier walking sprite is retained as an archive; the new hero makes the large leopard the central subject of the animated background.

## V26 independent leopard and scenery layers

The V25 campaign composite was separated with the built-in image-generation tool on 6 October 2026 into transparent open-eye and closed-eye leopard layers, plus clean landscape and portrait scenery plates. Masters and exact prompts are in `website/source-assets/v26/`; `website/scripts/prepare-v26-assets.mjs` creates local responsive AVIF/WebP scenery and alpha WebP animal layers. The animation deforms the animal mesh and blends only the eye regions for blinking. This remains a stylised brand montage, not real wildlife footage or a geographic scene. The original V25 artwork remains the static loading/failure fallback.

## V27 continuous island campaign

Generated on 6 October 2026 with the built-in OpenAI image tool: one landscape master, its closed-eyelid edit, a separate portrait composition and its closed-eyelid edit. The animal, terrace, contact shadow and island setting form a single opaque image; no cutout or animal alpha texture is used. Native pixels are 1672 × 941 for landscape and 1024 × 1536 for portrait. The imagined blue-hour island, villas and yacht do not identify a verified property or operator. Exact generation and edit prompts, master paths and rendering provenance are in `website/source-assets/v27/ARTWORK.md`. `website/scripts/prepare-v27-assets.mjs` creates responsive AVIF/WebP derivatives. The shader samples matching eye regions for blinks and makes small bounded movements within the full image. The approved vector logo and verified V24 destination photographs remain active.
