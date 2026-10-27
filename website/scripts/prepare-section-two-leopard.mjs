import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const original = resolve(root, 'source-assets/v41-section-two-leopard/leopard-soft.png');
for (const width of [320, 640, 1254]) {
  await sharp(original).resize({ width, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100, effort: 5 })
    .toFile(resolve(root, `public/images/pardus-window-leopard-soft-${width}.webp`));
}
console.log('Prepared square section-two leopard with its transparent framing intact.');
