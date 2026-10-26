import sharp from 'sharp';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const sources = new URL('source-assets/v39-window-seat/', root);
const output = new URL('public/images/', root);
await mkdir(output, { recursive: true });
const records = [];
for (const name of ['maldives', 'seychelles', 'dubai']) {
  const file = new URL(`${name}-window.png`, sources);
  const bytes = await readFile(file);
  for (const width of [224, 448, 887]) {
    await sharp(bytes).resize({ width, withoutEnlargement: true }).webp({ quality: 90, effort: 5 }).toFile(fileURLToPath(new URL(`pardus-window-${name}-${width}.webp`, output)));
    await sharp(bytes).resize({ width, withoutEnlargement: true }).avif({ quality: 75, effort: 4 }).toFile(fileURLToPath(new URL(`pardus-window-${name}-${width}.avif`, output)));
  }
  records.push({ file: `${name}-window.png`, sha256: createHash('sha256').update(bytes).digest('hex'), ...(await sharp(bytes).metadata()) });
}
const leopard = await readFile(new URL('leopard-portrait.png', sources));
for (const width of [320, 640, 1024]) await sharp(leopard).resize({ width, withoutEnlargement: true }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toFile(fileURLToPath(new URL(`pardus-window-leopard-${width}.webp`, output)));
records.push({ file: 'leopard-portrait.png', sha256: createHash('sha256').update(leopard).digest('hex'), ...(await sharp(leopard).metadata()) });
for (const [source, target] of [['leave-ordinary.svg', 'leave-ordinary'], ['choose-your-view.svg', 'choose-your-view'], ['compass-rose.svg', 'compass']]) await copyFile(new URL(source, sources), new URL(`pardus-window-${target}.svg`, output));
await writeFile(new URL('manifest.json', sources), JSON.stringify(records.map(({ file, sha256, width, height, hasAlpha }) => ({ file, sha256, width, height, hasAlpha })), null, 2) + '\n');
console.log('Prepared the selected Window Seat photographs, alpha leopard and vector artwork.');
