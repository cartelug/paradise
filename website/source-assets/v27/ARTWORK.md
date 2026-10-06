# PARDUS V27 hero artwork

Created on 6 October 2026 with the built-in OpenAI image-generation tool. This release replaces the separated V26 animal and scenery with one continuous, opaque photographic illustration. The leopard, terrace, contact shadow, water and distant island setting belong to the same image. There is no animal alpha matte, external silhouette or separate scenery plate.

The scene is an imagined brand campaign, not a verified property, wildlife photograph, supplier partnership or bookable yacht. The approved Pardus logo remains the existing vector reconstruction; no logo or page typography was generated into these images.

## Masters

| File | Native pixels | Purpose |
| --- | --- | --- |
| `hero-desktop.png` | 1672 × 941 | Landscape composition; quiet left side for HTML copy |
| `hero-desktop-blink.png` | 1672 × 941 | Closed-eyelid edit of the landscape master |
| `hero-mobile.png` | 1024 × 1536 | Separate portrait composition; clear sky above the animal |
| `hero-mobile-blink.png` | 1024 × 1536 | Closed-eyelid edit of the portrait master |

The native outputs are recorded above; the requested larger dimensions in the generation brief are not a claim that a 4K master was returned. All four delivered masters are opaque. Originals were copied into this directory without alteration.

`website/scripts/prepare-v27-assets.mjs` creates AVIF and WebP derivatives at 640, 1280 and 1672 px for desktop, and 480, 768 and 1024 px for portrait. Blink companions are WebP at the matching master dimensions. Run it from `website/` with `node scripts/prepare-v27-assets.mjs`. The generated dimensions are recorded in `src/data/hero-artwork.json`.

`HeroArtwork.astro` selects the portrait at widths up to 1100 px and always includes an ordinary responsive image beneath the canvas. `hero-film.ts` samples the complete frame, applies bounded head, chest, ear and camera movement, and blends the companion frame only in small feathered eye regions. Water movement remains below one source pixel. The final shader output is fully opaque. A Canvas fallback provides camera motion and blinks; graphics or loading failure reveals the intact poster. Reduced-motion renders a still frame. Visibility and page-cache lifecycle events pause the controller.

## Generation and edit prompts

### Landscape master — new generation, no reference

Use case: ads-marketing. Asset type: final photographic website hero master for PARDUS LUXURY ESCAPES, a premium travel company. Generate a completely NEW, extraordinarily art-directed, cinematic 16:9 landscape hero image, ideally 3840 x 2160. This must look like expensive real editorial photography with physically coherent depth, lighting and anatomy. No text or logo; page typography will be added separately.

Scene: a breathtaking secluded Indian Ocean island at blue hour just after sunset, photographed from a low elegant dark stone terrace above a calm turquoise cove. In the middle distance, a few exceptional overwater villas glow softly, a sleek small white yacht is anchored, lush distant palms are silhouetted against a narrow warm champagne horizon. The sky is rich midnight navy with restrained warm light at the far right. Create one believable setting, with generous atmosphere, not a collage of separate landmarks.

Subject: one majestic adult African leopard naturally lying on the dark stone terrace at the RIGHT of the composition. Its entire head, BOTH ears, neck, chest and relaxed front paws must be visible, with natural correct proportions. Head at roughly x 77%, y 49%; ears safely below the top 20%; paws around y 85%. Calm alert three-quarter face looking softly toward camera, subtle amber eyes, extraordinary genuine fur and whisker detail. Leopard occupies the right 36% in width and middle/lower 65% in height. It is grounded on the terrace, with natural contact shadow and soft matching golden rim lighting. It must be fully photographed IN the scene with seamless fur edges, never a pasted cutout. Keep the torso and paw boundaries clean and visible; no disembodied giant head.

Composition: LEFT 45% is beautiful quiet dark navy negative space for large white website typography, with faint distant ocean and atmospheric sky, no animal/bright lights/objects behind that text area. The travel scenery leads gently from that quiet left into the gorgeous leopard on the right. Important villas/yacht stay small and refined around the middle, and must not intersect the leopard face. Bottom 12% is naturally dark to accommodate a destination-price rail. Camera: premium wildlife editorial photograph combined into one coherent luxury travel campaign scene, 85mm optical feel, subtle filmic grain, sharp fur and soft distant water, balanced restrained color. No overly saturated teal, no orange glow halo, no brown rectangle around fur, no visible image seam, no fake bokeh particles, no stars or lens flares, no excessive objects, no city skyline, no people, no added markings, no watermark. Beautiful, composed, quiet, spectacular.

### Portrait master — landscape master as reference

Use case: compositing. Asset type: final PORTRAIT 2:3 mobile website hero for PARDUS LUXURY ESCAPES. Image 1 is the authoritative reference for animal identity, scene, color and photographic quality. Recompose the same beautifully photographed island terrace, overwater villas, anchored yacht and ONE leopard into a tall 2:3 portrait image. Keep exactly the same leopard face, rosettes, amber eyes, correct natural anatomy and relaxed front paws, and the same restrained midnight-navy blue-hour scene with champagne villa lights. This is an art-directed mobile adaptation, not a stretched landscape crop.

CRITICAL COMPOSITION: TOP 43% must be beautifully quiet dark midnight-navy sky, free of animal, bright sun, villas, palms and objects so a mobile website heading and buttons can fit there. The leopard's BOTH ears begin BELOW 49% of the image height; head centered around x 68%, y 66%; head/neck/shoulders/front paws occupy the middle-right and lower third. Entire head and both ears must fit safely INSIDE the picture, with no giant floating head. Ground the leopard naturally on the terrace with genuine contact shadow and seamless fur edges, no cutout, no glow outline, no opaque patch. Show a little calm ocean and the gently lit villas in the middle-left below the empty sky, with the yacht small and elegant. Bottom 10% is dark terrace, calm and uncluttered for a small destination rail. Keep the animal clear of that lowest strip. Expensive realistic editorial photography, coherent light, natural fur detail, dignified and spectacular. No text, logos, watermarks, UI, city landmarks, extra animals or people.

### Landscape blink — landscape master as the edit target

Use case: precise-object-edit. Asset type: the CLOSED-EYELID companion frame for a photographic website animation. Image 1 is the exact edit target. Change ONLY the leopard's TWO EYES from open to fully and naturally CLOSED, as in one calm blink. The upper and lower eyelids gently meet with natural eyelid fur and realistic dark closed-eye creases. Keep the original face angle, forehead, eye sockets and eye positions, whiskers, nose, mouth, ear shapes, head silhouette, rosettes, forepaws and every other part of the image exactly unchanged. Preserve the exact landscape canvas, crop, animal position and proportions, blue-hour lighting, dark stone terrace, yacht, distant villas, water and sky. No change in camera, color grade, brightness, anatomy, background or composition. This is a tiny two-eyelid edit of the original photograph, not a new image or new pose. No text or added objects.

### Portrait blink — portrait master as the edit target

Use case: precise-object-edit. Asset type: CLOSED-EYELID companion frame for an exact photographic mobile website animation. Image 1 is the exact portrait edit target. Change ONLY the leopard's TWO EYES from open to fully and naturally CLOSED in a calm blink, with natural eyelid fur and realistic small dark closed-eye creases. Preserve the exact original eye positions and sockets. Keep EVERY OTHER part of the portrait photograph unchanged: same face angle, forehead, nose, mouth, whiskers, head and ear silhouettes, fur markings, chest, paws, terrace, contact shadow, yacht, island villas, ocean, sky and light. Preserve the exact portrait dimensions and crop. No head tilt, new pose, new animal, composition change, color shift or background change. Only two small eyelid edits. No text or added objects.

## Rendering review

The actual shipped vertex and fragment shaders compiled and rendered through surfaceless Mesa/EGL, using llvmpipe software OpenGL ES. Open-eye, closed-eye and later-motion frames were inspected at 960 × 540 and 375 × 1000. Every pixel remained opaque. A 12-second, 24 fps desktop render is saved at `documents/PARDUS_V27_Motion_Preview.mp4`; the renderer report is `documents/PARDUS_V27_Render_Report.json`. Reproduce using `python scripts/render-hero-qa.py --output /absolute/scratch/path --video` from `website/`.

These are shader rendering checks, not screenshots of browser layout or real-device testing. The 23 automated tests separately cover form/content behavior, animation lifecycle and failure handling, reduced-motion, raster limits and measured head/ear framing across responsive crops. Fresh browser layout QA was unavailable in this release environment.
