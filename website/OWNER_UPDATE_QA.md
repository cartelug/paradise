# Pardus owner updates — delivery and QA

12 November 2026. [Draft pull request #4](https://github.com/cartelug/paradise/pull/4). Source and generated GitHub output are on the review branch. Nothing has been merged or deployed.

| Page | Result |
| --- | --- |
| Home | Aircraft-free V44 lettering, live “Personally curated.”, readable Who We Are and the six destinations in the requested order. Logo, permanent preloader, leopard geometry and rotation preserved. |
| About | Supplied story, founder biography, vision/mission, five values, promise and three collections in the requested sequence. Existing difference and booking content retained; voice, founder visibility and portrait are data driven. |
| Destinations | Maasai Mara and Uganda gorillas have proper pages and real licensed photos with credits. Europe and East Africa remain collections. New packages request a quote. |
| Packages and yacht cards | Complete proposal fields, explicit price approval and guarded genuine promotions. The six existing destination starting prices and four yacht rates are unchanged. |
| Terms, enquiries and planner | Exact shared fare notice, footer anchor, conditional flight-card warning and notice at the end of drafts/briefs and in online payloads. |

## Verification

- **99/99 Node tests** pass; Astro check has **0 errors, 0 warnings, 0 hints**. All four existing Python unit tests pass.
- **12/12 browser-smoke phases** pass, executed in groups. The full **35-page × 7-viewport matrix (245 checks)** passes.
- **35 pages × six phone widths plus 200% text (245 fit checks)** pass. The final charter-card refinement was additionally checked on both affected pages at all seven matrix views and all seven fit settings.
- **26 hero/text-size checks**, from 320px to 1920px at 100% and 200% text, pass.
- **Four axe scans**, home and About at 390px and 1440px, find **zero violations**.
- An isolated build verifies founder hiding, the supplied third-person story, flight-card warnings, a genuine promotional price and suppression of an unapproved numeric price.
- Full sample enquiry: destination → quote/inclusions → notice → correctly addressed draft to **bookings@pardusescapes.com**, ending with the exact notice. Online success, confirmation, reset, saved copy and failure fallback also pass with interception. **No emails were sent.**
- Both hosting builds pass link/reference checks for **35 HTML pages and 43 generated text assets**. The **591-file cPanel ZIP** passes CRC verification.

The existing browser test was hardened against an image completing between two asynchronous reads and against CSS smooth scrolling moving a synthetic tap. Selection, image-completion and broken-image assertions were retained; per-choice checked-state assertions were added. Default test scope remains every page.

## Mobile performance

Same local static-server profile for both versions: 390 × 844, DPR 3, touch/mobile, CPU 4×, 1.6 Mbps down, 0.8 Mbps up, 40ms latency, repeat visitor, shipped news fixture. Three fresh-context runs per version.

| Measure | Original | Updated |
| --- | ---: | ---: |
| Median Largest Contentful Paint | 5,608 ms | 5,572 ms |
| Lettering transferred | 217,972 bytes | 190,500 bytes |

Loading is effectively unchanged within the variation of this small lab sample; lettering transfer is **12.6% smaller**. This is a local comparison, not a live-domain performance claim. Raw runs are in the records folder.

## Screenshots

| View | Evidence |
| --- | --- |
| Home hero | [390px](tests/records/owner-updates-2026-11-12/home-390.png) · [1440px](tests/records/owner-updates-2026-11-12/home-1440.png) |
| Who We Are | [390px](tests/records/owner-updates-2026-11-12/who-we-are-390.png) |
| About page | [390px](tests/records/owner-updates-2026-11-12/about-390.png) · [1440px](tests/records/owner-updates-2026-11-12/about-1440.png) |
| Package and inclusions | [Uganda gorillas](tests/records/owner-updates-2026-11-12/package-uganda-gorillas-390.png) |
| Fare notice before enquiry | [390px](tests/records/owner-updates-2026-11-12/enquiry-fare-notice-390.png) |

[Machine-readable results](tests/records/owner-updates-2026-11-12/acceptance-summary.json).

## Remaining owner items and verification limits

The user approved the portrait shown in chat for **Saidah Namusoke**. The original image file was not exposed to the build tools. The portrait remains null, with no placeholder or generated likeness. A downloadable JPG/PNG attachment is needed to use that exact photograph.

Brand wording, the founder biography and service collections still require owner review before merge. Supplier quotations, approved new prices, verified phone/WhatsApp, registrations, social links, payment/cancellation terms and a consumer/travel-law review remain owner inputs. The bookings team needs a named follow-up owner. Staff must include the exact fare notice on every airfare quotation and confirmation email; there is no outgoing quotation template in this repository.

The shared browser preview relay was unavailable. Browser QA used the actual static export on localhost, simulated Chromium viewports and text scaling; it does not certify physical devices or Safari. The live enquiry endpoint and verified WhatsApp number are not configured, so real inbox delivery and a real WhatsApp conversation were not tested. No deployment was attempted, as the brief requires owner approval first.
