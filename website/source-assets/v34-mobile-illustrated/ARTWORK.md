# Illustrated mobile homepage — 24 October 2026

The owner requested a polished mobile homepage, more than 20 generated symbols, transparent designed headline images, refreshed hero backgrounds and animation. These assets were made with the built-in image_gen tool. All are AI-generated, illustrative brand artwork rather than documentary property photographs or booking guarantees.

## Asset placement

| Assets | Live homepage placement |
| --- | --- |
| mobile-hero.png | New portrait hero: pale quiet sky, complete right-facing leopard, coast/Dubai/savannah montage |
| mobile-coast.png | Separate phone composition continuing limestone into the Signature escapes cove |
| hero-lettering-refined.png | Exact three-line primary tagline, clear word spacing, navy Archivo-inspired lettering and a restrained brass route flourish |
| escape-lettering-refined.png | Exact “Your next escape.” heading with clear word spacing, navy and dark brass with a fine route underline |
| flights, resort, transfers, visas | The four essential service choices |
| yacht, safari, private-tours, activities | The four experience choices |
| honeymoon, family, groups | The three occasion choices |
| corporate, bespoke | The two tailored travel choices |
| maldives, seychelles, dubai | The three Signature escapes headings |
| east-africa, europe, zanzibar | The three additional destination cards |
| personal-attention, thoughtful-details, seamless-service | The three service promises |
| world | The hero's bespoke-travel eyebrow |
| travel-journal | The closing enquiry introduction |

There are exactly 24 distinct symbol masters and 24 placements. Each is a bespoke transparent illustration in the same matte ivory, navy and champagne-brass material language. None acts as a fabricated credential or partner badge. Labels, prices, native checkboxes, links, fields and the actual brand logo remain live, readable page content.

Exact root-generation prompts and reference roles are in `ROOT_GENERATION.json`; the spacing-refinement prompts are in `LETTERING_REFINEMENT.json`. The delegated symbol-generation record is in `symbols/SYMBOL_GENERATION.json`; the root-generated flight emblem is recorded in the root file. Original PNGs and the refined lettering variants are preserved; no creative edits are made by the asset pipeline.

## Asset preparation and interaction

`scripts/prepare-illustrated-home.mjs` validates genuine alpha on every symbol and headline, creates 96/192/384px transparent WebP symbol derivatives, trims only empty transparent padding from lettering and exports responsive lettering and background files without enlargement. It records dimensions in `src/data/illustrated-home-artwork.json`. The release requires all 24 symbols. `--partial` is for development while artwork is still arriving and must not be used to certify a release.

`ArtHeading.astro` retains the real H1/H2 wording. The decorative image has empty alt text and is hidden from assistive technology. It becomes visible only after decoding. Image failure shows the actual heading; enlarged actual text also uses the freely wrapping real heading. The exact wording remains in the document for assistive technology and indexing. With scripting disabled, the live heading is the visible default. The only web typeface remains self-hosted Archivo.

`HomeEmblem.astro` gives each illustration explicit dimensions, responsive sources and decorative semantics. Only the small hero emblem loads eagerly; the other symbols load lazily. The illustrated service cards retain their full native checkbox/label targets and carry the same GET values into the enquiry. Entry animations and light selection/hover feedback use transforms and opacity. Reduced motion removes them. The calm leopard never follows, glows, pans or reacts.

The shared pale seam and coastal fade remain. Phone copy stays in normal flow so enlarged text pushes the complete animal safely lower, and tablet/desktop fallbacks retain their prior clearance rules. The original V33 desktop hero and desktop coast remain in use.

## Validation

Current release evidence is recorded in `QA_RESULTS.json`: all 21 standard viewports (320–2560px) and 11 enlarged-text cases passed after the final lettering was integrated. Checks cover visible lettering/animal clearance, text overflow, control targets and the shared seam. All 24 symbols render; all 13 choices retain their inputs. Browser interaction checks confirmed Flights/Safaris reach the planning note and URL, Escape closes the menu and returns focus/clears scroll lock, and a deliberately failed headline request reveals the exact readable text.

Astro diagnostics passed for 98 files with zero errors, warnings or hints. All 52 Node tests passed, including genuine alpha, responsive artwork, actual symbol use, exact semantic headings and the permanent preloader on all 33 pages. Both GitHub-base and own-domain-base builds passed reference validation. Public QA files are excluded. These are simulated Chrome checks at 100% browser zoom and actual enlarged text; physical-device certification is not claimed.
