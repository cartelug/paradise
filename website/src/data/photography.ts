import { v31Photography } from './v31-photography.ts';
import { travelPhotographs } from './travel-photographs.ts';
// V31 photography swap-in. Each place on the site that shows a photograph asks for a slot. When the matching photograph has
// been dropped into source-assets/v31-photography/ and prepared (scripts/prepare-v31-photography.mjs), the slot uses it,
// with the alt text written in credits.json; until then it keeps the current V24 picture passed as the fallback.
export type PhotoSlot = 'hero-maldives' | 'maldives' | 'zanzibar' | 'seychelles' | 'safari-uganda' | 'safari-family' | 'europe' | 'dubai'
  | 'yacht' | 'corporate' | 'journal-safari' | 'journal-process'
  | 'dubai-desert' | 'dubai-creek' | 'dubai-downtown' | 'dubai-beach' | 'dubai-dining' | 'dubai-skyline'
  | 'reset' | 'celebration';
type Prepared = { slot: PhotoSlot; asset: string; alt: string };
const ready = new Map((v31Photography as Prepared[]).map(entry => [entry.slot, entry]));

// The ten V38 travel photographs (website/source-assets/travel-photographs-2026-10-25) take precedence over V31 and V24.
const travel = new Map(travelPhotographs.flatMap(entry => entry.slots.map(slot => [slot, entry] as const)));

export function photo(slot: PhotoSlot, fallback: { image: string; alt: string }): { image: string; alt: string } {
  const current = travel.get(slot);
  if (current) return { image: current.asset, alt: current.alt };
  const entry = ready.get(slot);
  return entry ? { image: entry.asset, alt: entry.alt } : fallback;
}

// Largest published WebP for a picture, for social previews. Older pictures have a 1920 px file; V38 ones stop at their native width.
export function largestImage(name: string): string {
  const prepared = travelPhotographs.find(entry => entry.asset === name);
  return `images/${name}-${prepared ? Math.max(...prepared.widths) : 1920}.webp`;
}
