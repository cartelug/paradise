import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
const folder='source-assets/v24-photography';
const {photos}=JSON.parse(await readFile(`${folder}/credits.json`,'utf8'));
for(const photo of photos) {
  for(const width of [640,1280,1920]) {
    const image=()=>sharp(`${folder}/${photo.source}`).rotate().resize(width,Math.round(width/1.5),{fit:'cover',position:photo.crop || 'centre'});
    await image().avif({quality:64,effort:4}).toFile(`public/images/${photo.asset}-${width}.avif`);
    await image().webp({quality:85,effort:4}).toFile(`public/images/${photo.asset}-${width}.webp`);
  }
  console.log(`Prepared ${photo.asset}: ${photo.location} (${photo.publishedOn})`);
}
