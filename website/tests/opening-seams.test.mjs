import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
const root=new URL('../',import.meta.url);
const meta=JSON.parse(await readFile(new URL('src/data/illustrated-home-artwork.json',root),'utf8'));
test('both opening headings use the newly generated photographic lettering with native transparent masters',async()=>{
 for(const art of ['hero-lettering','escape-lettering']){
  assert.equal(meta.lettering[art].prefix,'pardus-v36');
  assert.match(meta.lettering[art].source,/v36-immersive-lettering/);
  const master=sharp(new URL('source-assets/v34-mobile-illustrated/'+meta.lettering[art].source,root).pathname);
  assert.equal((await master.metadata()).hasAlpha,true);
  const stats=await master.stats();assert.equal(stats.channels[3].min,0);assert.equal(stats.channels[3].max,255);
 }
});
test('the opening keeps the approved exact copy and permanent preloader while joining all three opening sections',async()=>{
 const html=await readFile(new URL('../index.html',root),'utf8');
 assert.match(html,/pardus-v36-hero-lettering-/);assert.match(html,/pardus-v36-escape-lettering-/);
 assert.match(html,/data-pardus-intro/);assert.match(html,/Personally curated\./);
 const css=await readFile(new URL('src/styles/opening-seams.css',root),'utf8');
 assert.match(css,/max-width: 999px/);assert.match(css,/--who-entry-gradient/);assert.match(css,/who-reference::after/);
 assert.match(css,/forced-colors/);assert.match(css,/data-who-flow/);
});
