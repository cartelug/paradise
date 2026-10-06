import sharp from 'sharp';

const folder = 'source-assets/v26';
for (const [name, widths] of [['desktop', [640, 1280, 1536]], ['mobile', [480, 768, 1024]]]) {
  for (const width of widths) {
    const source = () => sharp(`${folder}/scene-${name}.png`).resize({width, withoutEnlargement:true});
    await source().avif({quality:64, effort:4}).toFile(`public/images/pardus-scene-${name}-v26-${width}.avif`);
    await source().webp({quality:86, effort:4}).toFile(`public/images/pardus-scene-${name}-v26-${width}.webp`);
  }
  console.log(`Prepared V26 ${name} scenery`);
}
for (const pose of ['open', 'blink']) {
  for (const width of [1024, 1536]) {
    await sharp(`${folder}/leopard-${pose}.png`).resize({width}).webp({quality:92, alphaQuality:100, effort:5}).toFile(`public/images/pardus-leopard-${pose}-v26-${width}.webp`);
  }
  console.log(`Prepared V26 leopard ${pose} with alpha`);
}
