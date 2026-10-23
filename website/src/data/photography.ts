import { v31Photography } from './v31-photography.ts';
// V31 photography swap-in. Each place on the site that shows a photograph asks for a slot. When the matching photograph has
// been dropped into source-assets/v31-photography/ and prepared (scripts/prepare-v31-photography.mjs), the slot uses it,
// with the alt text written in credits.json; until then it keeps the current V24 picture passed as the fallback.
export type PhotoSlot = 'hero-maldives' | 'maldives' | 'zanzibar' | 'seychelles' | 'safari-uganda' | 'safari-family' | 'europe' | 'dubai'
  | 'yacht' | 'corporate' | 'journal-safari' | 'journal-process'
  | 'dubai-desert' | 'dubai-creek' | 'dubai-downtown' | 'dubai-beach' | 'dubai-dining' | 'dubai-skyline';
type Prepared = { slot: PhotoSlot; asset: string; alt: string };
const ready = new Map((v31Photography as Prepared[]).map(entry => [entry.slot, entry]));

export function photo(slot: PhotoSlot, fallback: { image: string; alt: string }): { image: string; alt: string } {
  const entry = ready.get(slot);
  return entry ? { image: entry.asset, alt: entry.alt } : fallback;
}
