import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const hero='source-assets/v23-island-hero.png';
for(const size of [640,1280,1920]) {
  await sharp(hero).resize(size).avif({quality:68,effort:4}).toFile(`public/images/island-cinematic-${size}.avif`);
  await sharp(hero).resize(size).webp({quality:86}).toFile(`public/images/island-cinematic-${size}.webp`);
}
const sprite='source-assets/v23-leopard-walk.png';
const {width,height}=await sharp(sprite).metadata();
const w=Math.floor(width/4),h=Math.floor(height/4),layers=[],frames=[];
for(let i=0;i<16;i++) {
  const frame=await sharp(sprite).extract({left:(i%4)*w,top:Math.floor(i/4)*h,width:w,height:h}).ensureAlpha().raw().toBuffer();
  let minX=w,minY=h,maxX=0,maxY=0,headX=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(frame[(y*w+x)*4+3]>48){
    minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    if(y>h*.22&&y<h*.56)headX=Math.max(headX,x);
  }
  const dx=Math.min(w-1-maxX,Math.round(w*.96)-headX),dy=Math.round(h*.92)-maxY;
  const input=await sharp(frame,{raw:{width:w,height:h,channels:4}}).extract({left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1}).png().toBuffer();
  layers.push({input,left:i*w+Math.max(0,minX+dx),top:Math.max(0,minY+dy)});
  frames.push({frame:i+1,baseline:maxY+dy,head:headX+dx});
}
await sharp({create:{width:w*16,height:h,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).webp({quality:92,alphaQuality:100,effort:5}).toFile('public/images/leopard-walk-v23.webp');
await writeFile('source-assets/v23-frame-alignment.json',JSON.stringify({columns:16,cellWidth:w,cellHeight:h,frames},null,2));
console.log('Created cinematic responsive hero and aligned sixteen-frame alpha sprite.');
