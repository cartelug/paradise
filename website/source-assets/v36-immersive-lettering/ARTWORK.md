# Photographic headline lettering and continuous opening — 25 October 2026

The owner requested regenerated section-one heading art with destination visuals
inside the lettering, a more creative header treatment, and backgrounds that
blend from section one to two and onward. This authorizes the new generated
headline appearance, superseding the earlier visual font restriction for the
hero and Signature Escapes headline only. Actual text, navigation and the real
Pardus logo remain native and unchanged.

The two original alpha-transparent PNGs were created with the built-in image
generation tool. Their exact prompts are in `hero-prompt.txt` and `escape-prompt.txt`.
The designs deliberately embed illustrative coastal, Mediterranean and mountain
scenes inside letterforms; these are generated brand illustrations, not
photographic evidence for a specific offered trip.

The preparation script crops empty alpha padding and produces responsive
alpha-preserving WebP exports under `pardus-v36-*`, retaining previous versions.
`illustrated-home-artwork.json` records their dimensions, prefix, source paths
and responsive widths. Semantic H1/H2 wording remains the approved tagline and
“Your next escape.”. `ArtHeading` retains its image-error, no-JavaScript,
enlarged-text and print fallbacks. No extra font is downloaded.

`opening-seams.css` blends the existing hero through a smooth gradient sampled
from the top edge of the actual desktop or mobile Who We Are reference. The
small bottom fade of Who We Are meets the existing pale coastal intro, which
already transitions into the midnight destination stage. Original photos,
leopard pose and measured animal coordinates remain unchanged. The gradient
is static and never follows a visitor. Native text fallbacks use a matching
pale seam rather than a blue artwork edge.

Validation: 42 simulated Chrome viewport/text cases pass, including doubled
native hero text, whole-page overflow, minimum action sizes and measured copy
clearance from the leopard. See `tests/records/opening-v36-2026-10-25.json` and
`tests/opening-v36-qa.html`. These are CSS-viewport checks, not certification of
every physical device or browser engine. A soft, feathered desktop copy wash
keeps the ordinary supporting sentence legible over the lagoon without a card.
