# Image sources

Approved Pardus logo: user-uploaded source artwork. Photography reused from the previous Pardus concept. These are illustrative stock images, not evidence of owned properties or supplier partnerships. Confirm rights and destination accuracy before a public launch.

The exact approved full-colour lockup is preserved as `public/brand/pardus-approved-primary.png`, including the complete metallic-gold aircraft sweep. V20 renders the transparent vector identity in the hero with a separate Luxury Escapes signature, and the standalone leopard in navigation. Travel.Explore is a separate scroll chapter. The raster lockup remains an archival asset.

## Typography

The production build self-hosts Satoshi Light, Regular, Medium and Bold plus the Montserrat variable family as WOFF2. Both families were supplied by the user. Fraunces is bundled from the project dependency. No Fontshare request is used. Confirm Satoshi web-use approval before commercial launch; Montserrat's OFL file is included with the exported fonts.

- hero: https://images.unsplash.com/photo-1762254923872-5bdc4210eb90?auto=format&fit=crop&w=2000&q=85
- maldives: https://images.pexels.com/photos/9482140/pexels-photo-9482140.jpeg?auto=compress&cs=tinysrgb&w=1500
- zanzibar: https://images.unsplash.com/photo-1762118817730-955d832b2cb7?auto=format&fit=crop&w=900&q=80
- africa: https://images.unsplash.com/photo-1599921777960-ac7c40d1bc60?auto=format&fit=crop&w=1000&q=80
- europe: https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80
- dubai: https://images.unsplash.com/photo-1744416328915-1341add4a393?auto=format&fit=crop&w=1000&q=80
- seychelles: https://images.pexels.com/photos/30358268/pexels-photo-30358268.jpeg?auto=compress&cs=tinysrgb&w=1100
- corporate: https://images.pexels.com/photos/20562278/pexels-photo-20562278.jpeg?auto=compress&cs=tinysrgb&w=1400

## Travel.Explore sandbank scene (live)

The `section-3-sandbank-*` family is the homepage Travel.Explore chapter. Its masters are `website/source-assets/section-3-sandbank-desktop.png` (1672 × 941) and `-mobile.png` (941 × 1672), added on 11 September 2026 (commit 687c32d). Their source was not recorded when they were added. Confirm the source and usage rights before a commercial launch.

## Retired artwork (removed in V21)

These families are no longer used by any page and were removed from the published site and the repository in V21. They remain in git history.

- `pardus-hero-*`: an earlier homepage hero, two original AI-generated compositions (1672 × 941 and 941 × 1672) of a golden leopard moving through ocean, savannah, coast, desert and skyline.
- `section-2-coast-*`, `section-4-terrace-*`, `section-5-arrival-*`: V4 scroll scenes, source not recorded.
- `v3-studio-*`: a V3 planning-studio visual generated with the built-in OpenAI image workflow on 14 September 2026, depicting a fictional travel-planning table.

## V20 coastal horizon

The `v20-horizon-*` family was generated with the built-in OpenAI image tool on 15 September 2026. The landscape and portrait masters are separate compositions of an imagined Indian Ocean coastline at blue hour, with granite, palms, distant islands and a small warm architectural light. They do not depict a verified named hotel or supplier. The brief calls for natural photographic detail, generous clear sky for the separately rendered Pardus identity, and no text or logos.

Desktop sources: 960 and 1586 pixels wide. Mobile sources: 480 and 960 pixels wide. AVIF is preferred, with WebP fallback. `Horizon.astro` selects the correct art direction; the opening uses the smaller derivatives. Masters and six image-generated UI concepts, with their prompts, are included in the separate V20 handoff. Sharp produced the responsive size and format derivatives. Brand marks and all text remain real vector/HTML elements.
