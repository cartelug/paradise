# Separate HD headings and native Who We Are content — 25 October 2026

The owner requested smoother, regenerated isolated HD text; removal of
“Personally curated.” from the section-one headline; an improved “A world of
places” heading pasted into the site and animated; and preservation of the
background. These instructions supersede the earlier complete-artboard visual
implementation for Section 02 and the old three-line hero heading.

## Generated assets

The built-in image-generation tool produced:

- `hero-lettering-master.png`: isolated two-line “Extraordinary journeys.”;
  the third line is absent. Brand tagline elsewhere is preserved.
- `who-lettering-master.png`: isolated desktop heading with photographic
  Mediterranean/coast detail contained in the letterforms.
- `who-lettering-mobile-master.png`: matching large mobile line breaks.
- `desktop-clean.png` and `mobile-clean.png`: precise text/UI-removal edits of
  the existing approved scenery, not new destination compositions.

Exact prompts are saved alongside these files. The mobile PNG contains hidden
RGB colour outside the alpha silhouette; responsive exports retain actual
transparency and the browser review verifies the clean appearance on ivory.
No creative background replacement or new leopard pose was requested.

## Background preservation

The original approved native-size V35 scene remains the base image. Only the
areas containing old baked-in letters, copy, button and service symbols receive
feathered cleanup patches through SVG masks. All scenery outside those localized
patches continues to use the original source image. The cleanup layer's decode
must complete together with the base before either is shown, preventing old
raster lettering from leaking through an image error. CSS gradient joins are
retained. Mobile flow moves the same complete backdrop down as copy grows,
protecting the animal from enlarged text; it never crops the photograph.

`WhoWeAre.astro` now has actual native supporting paragraphs, service symbols
and an About link, rather than a transparent hotspot over a screenshot. The
heading is its own transparent picture with a semantic H2 and its real-text
fallback. Its desktop and portrait lettering use separate responsive sources.
The permanent preloader, shared navigation and hero photography are unchanged.

## Motion and fallbacks

One IntersectionObserver gates a single heading reveal, gentle copy arrival and
brief light sweep masked to the title silhouette. It waits for the preloader's
ready state and the decoded heading. Background and leopard do not animate.
Reduced motion removes these effects. Image errors, no script, text enlargement,
forced colours and print retain readable native headings and controls.

Preparation: `node scripts/prepare-illustrated-home.mjs --lettering-only`.
A single heading can be prepared with `--art=who-lettering-mobile`. Metadata,
native dimensions and source widths are in `illustrated-home-artwork.json`.
Browser review fixture: `tests/opening-v37-qa.html`.

Validation: 42 simulated Chrome viewport/text cases pass, including doubled
native text, full-page overflow, heading containment, image aspect ratios,
minimum action sizes and clearance around the hero leopard. Native heading
fallback, unavailable background fallback and no-script copy/action visibility
were checked separately. See `tests/records/opening-v37-2026-10-25.json`.
These are CSS-viewport checks, not certification of every physical device.
