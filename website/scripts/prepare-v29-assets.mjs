import sharp from 'sharp';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const project = fileURLToPath(new URL('../', import.meta.url));
for (const [variant, widths] of [['desktop',[960,1600,2400]],['mobile',[640,1024]]]) {
  for (const width of widths) {
    const input = resolve(project, `source-assets/v29/hero-${variant}.png`);
    await sharp(input).resize({width}).webp({quality:82}).toFile(resolve(project, `public/images/hero-v29-${variant}-${width}.webp`));
    await sharp(input).resize({width}).avif({quality:54,effort:5}).toFile(resolve(project, `public/images/hero-v29-${variant}-${width}.avif`));
  }
}
console.log('V29 art-directed hero derivatives prepared.');
