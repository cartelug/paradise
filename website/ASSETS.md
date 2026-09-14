# Image sources

Approved Pardus logo: user-uploaded JPEG. Photography reused from the previous Pardus concept. These are illustrative stock images, not evidence of owned properties or supplier partnerships. Confirm rights and destination accuracy before a public launch.

The logo in `public/brand/` is a deterministic vector reconstruction of the approved JPEG. It preserves the leopard outline, aircraft, wordmark and tagline. Primary, light and monochrome versions include SVG and real-alpha PNG exports from 512 to 4096 pixels wide. The opening animation uses separate vector paths from `src/data/logo.json`.

## Typography

- Satoshi Light, Regular, Medium and Bold were supplied by the user in `satoshi.zip` and converted locally from OTF to WOFF2 for web delivery.
- Montserrat was supplied by the user in `montserrat.zip`; the variable TTF was converted locally to WOFF2. The OFL text is kept at `public/fonts/Montserrat-OFL.txt`.
- Fraunces is provided by the checked-in `@fontsource-variable/fraunces` dependency.

Confirm that the supplied Satoshi files are approved for public web use before a commercial launch. The site no longer loads fonts from Fontshare.

## V3 commissioned visual

The responsive `v3-studio-*` AVIF and WebP files were generated for Pardus V3 with the built-in OpenAI image-generation workflow on 14 September 2026. They depict a fictional private-travel planning table and do not represent a named property, partner or destination.

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
