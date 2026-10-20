# V31 hero artwork provenance

The homepage hero from V31 (launch on pardusescapes.com, October 2026) is **AI-generated, illustrative** artwork, approved by the site owner. It was created with a built-in image-generation tool. The owner's original leopard portrait was the only reference for the animal, and earlier campaign art was used for concept continuity. The destinations in the coat are deliberately surreal miniatures. They are not named resorts, hotels or yachts, and they are not package inclusions.

The artwork shows one leopard resting in **left profile**, looking far to the left and never at the viewer. Travel scenes are woven into its coat: overwater villas, a superyacht, a dhow, Seychelles granite, a Santorini dome and a safari tent. Gold flight lines run from its whiskers to a small jet, acacias, elephants and a Dubai-like skyline sit along its back, and its paws rest in a blue-hour lagoon.

## Files

The files are copied unchanged from the owner's pack (`pardus/hero-v2/`). AVIF copies at the same sizes are made with sharp in `website/public/images/`, and nothing is upscaled.

| File | Size | Use |
| --- | --- | --- |
| `pardus-hero-desktop-1536.webp` | 1536 x 1024 (3:2) | Main desktop hero; also the `og:image` |
| `pardus-hero-desktop-960.webp` | 960 x 640 (3:2) | Smaller desktop and tablet landscape |
| `pardus-hero-phone-1024.webp` | 1024 x 1536 (2:3) | Phone, high density |
| `pardus-hero-phone-640.webp` | 640 x 960 (2:3) | Phone, small |

`GENERATION_PROMPTS.txt` in this folder records the final prompts and reference roles exactly as supplied.

## How the website uses it

- `website/src/components/Hero.astro` serves one art-directed `<picture>`. Phones and portrait screens, `(max-width: 760px), (max-aspect-ratio: 11/10)`, get the portrait art. Every other screen gets the landscape art.
- The stage keeps the art's native aspect ratio, so the head, ears, whiskers and paws are never cropped. On very large screens the 1536 px file is upscaled slightly, which was accepted.
- The leopard's outline is measured on each artwork as rectangles in picture percentages (`outline` in `Hero.astro`): jet, flight lines, head, chest, paws and back. Headline, copy, buttons, price bar and header must never touch any of them. The gold pins sit on the travel scenes in the coat and must never touch the head, paws, jet or flight lines. `website/tests/browser-smoke.py` (phases `leopard`, `pins` and `phone`) measures this.
- Motion: a very slow scale from 1.00 to 1.03 and back (20 s each way), and nothing else. Pause scene and reduced motion show the still picture.
