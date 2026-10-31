import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// V42 (31 October 2026): the five owner-supplied portrait photographs that rotate behind the phone hero.
// Masters are the delivered 941 x 1672 WebP files. Derivatives are never enlarged: 480, 768 and native width,
// as WebP (fallback) and AVIF, named pardus-v42-mobile-hero-<n>-<width>.<ext>.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'source-assets/v42-mobile-hero-rotation');
const output = resolve(root, 'public/images');
await mkdir(output, { recursive: true });

const slides = [1, 2, 3, 4, 5];
let native = null;
for (const n of slides) {
  const file = resolve(source, `hero-${n}.webp`);
  const { width, height } = await sharp(file).metadata();
  if (native && (native.width !== width || native.height !== height)) throw new Error(`hero-${n} must match the other masters (${native.width} x ${native.height})`);
  native = { width, height };
}
const widths = [...new Set([480, 768, native.width])].filter(width => width <= native.width);
for (const n of slides) {
  const file = resolve(source, `hero-${n}.webp`);
  for (const size of widths) {
    const image = sharp(file).resize({ width: size, withoutEnlargement: true });
    await image.clone().webp({ quality: 88, effort: 6 }).toFile(resolve(output, `pardus-v42-mobile-hero-${n}-${size}.webp`));
    await image.clone().avif({ quality: 62, effort: 5 }).toFile(resolve(output, `pardus-v42-mobile-hero-${n}-${size}.avif`));
  }
}
const metadata = { prefix: 'pardus-v42-mobile-hero', count: slides.length, width: native.width, height: native.height, widths };
await writeFile(resolve(root, 'src/data/mobile-hero-rotation.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata));
