// V45: deterministic delivery sizes for the generated, illustrative desktop scenery.
// No enlargement, cropping, artificial grain, sharpening or colour changes.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const folder = 'source-assets/v45-desktop-coast';
const assets = [
  ['coastal-continuous-master.png', 'pardus-v45-coastal-continuous'],
  ['zanzibar-editorial-master.png', 'pardus-v45-zanzibar-editorial'],
];
const manifest = [];
for (const [file, prefix] of assets) {
  const input = `${folder}/${file}`;
  const { width, height } = await sharp(input).metadata();
  const widths = [...[640, 960, 1280].filter(w => w < width), width];
  for (const size of widths) {
    for (const format of ['webp', 'avif']) {
      const image = sharp(input).rotate().resize({ width: size, withoutEnlargement: true });
      await image[format]({ quality: format === 'webp' ? 86 : 64, effort: 5 }).toFile(`public/images/${prefix}-${size}.${format}`);
    }
  }
  manifest.push({ file, prefix, width, height, widths, sha256: createHash('sha256').update(await readFile(input)).digest('hex'), source: 'AI-generated illustrative travel imagery; not a photograph of an identified property.' });
}
await writeFile(`${folder}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
await writeFile('src/data/desktop-coast.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Prepared desktop coast and Zanzibar images without enlarging the masters.');
