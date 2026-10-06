import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const artwork={};
for(const name of ['desktop','mobile']){
  const master='source-assets/v27/hero-'+name+'.png';
  const {width,height}=await sharp(master).metadata();
  const widths=[...new Set([...(name==='desktop'?[640,1280]:[480,768]).filter(w=>w<width),width])];
  for(const w of widths){
    await sharp(master).resize({width:w}).avif({quality:65,effort:5}).toFile('public/images/hero-v27-'+name+'-'+w+'.avif');
    await sharp(master).resize({width:w}).webp({quality:89,effort:5}).toFile('public/images/hero-v27-'+name+'-'+w+'.webp');
  }
  await sharp('source-assets/v27/hero-'+name+'-blink.png').resize({width,height,fit:'fill'}).webp({quality:92,effort:5}).toFile('public/images/hero-v27-'+name+'-blink.webp');
  artwork[name]={width,height,widths};
  console.log('Prepared '+name+' '+width+' × '+height);
}
await writeFile('src/data/hero-artwork.json',JSON.stringify(artwork,null,2)+'\n');
