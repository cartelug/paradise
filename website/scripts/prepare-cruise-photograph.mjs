import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Source, photographer and commercial licence are recorded beside the original JPEG.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const original = resolve(project, 'source-assets/cruise-2026-10-27/ocean-cruise-alonso-reyes.jpg');
for (const width of [640, 1280, 1920]) {
  const image = sharp(original).resize(width, Math.round(width * 2 / 3), {
    fit: 'cover', position: 'centre', withoutEnlargement: true,
  });
  await image.clone().webp({ quality: 86 }).toFile(resolve(project, `public/images/ocean-cruise-v40-${width}.webp`));
  await image.clone().avif({ quality: 55, effort: 5 }).toFile(resolve(project, `public/images/ocean-cruise-v40-${width}.avif`));
}
console.log('Prepared the ocean cruise photograph at 640, 1280 and 1920 px.');
