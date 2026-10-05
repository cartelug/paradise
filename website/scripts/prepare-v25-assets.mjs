import sharp from 'sharp';
const folder = 'source-assets/v25';
for (const [name, widths] of [['desktop', [640, 1280, 1536]], ['mobile', [480, 768, 1024]]]) {
  for (const width of widths) {
    const source = () => sharp(`${folder}/pardus-hero-${name}.png`).resize({width, withoutEnlargement:true});
    await source().avif({quality:64, effort:4}).toFile(`public/images/pardus-hero-${name}-v25-${width}.avif`);
    await source().webp({quality:86, effort:4}).toFile(`public/images/pardus-hero-${name}-v25-${width}.webp`);
  }
  console.log(`Prepared V25 ${name} artwork`);
}
