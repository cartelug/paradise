import test from 'node:test';import assert from 'node:assert/strict';import{readFile,access}from'node:fs/promises';
const root=new URL('../',import.meta.url);
test('section one omits the removed phrase while Who We Are uses isolated HD art and a real text/button layer',async()=>{
 const html=await readFile(new URL('../index.html',root),'utf8');const hero=html.match(/<section class="hero hero--atlas"[\s\S]*?<\/section>/)?.[0];
 assert.ok(hero);assert.doesNotMatch(hero,/Personally curated/);assert.match(hero,/pardus-v37-hero-lettering/);
 const who=html.match(/<section class="who-reference"[\s\S]*?<\/section>/)?.[0];assert.ok(who);
 assert.match(who,/pardus-v37-who-lettering-mobile/);assert.match(who,/data-art-key="who-lettering"/);
 assert.match(who,/class="who-native-copy"/);assert.match(who,/class="who-reference-action" href="\/paradise\/about\.html"/);
 assert.match(who,/data-who-base/);assert.match(who,/data-who-image/);
});
test('cleanup masks preserve the original scene outside the old raster text regions',async()=>{
 for(const scene of ['desktop','mobile']){
  const svg=await readFile(new URL(`public/images/pardus-v37-who-mask-${scene}.svg`,root),'utf8');
  assert.match(svg,/<rect /);assert.match(svg,/feGaussianBlur/);
  await access(new URL(`source-assets/v35-who-we-are/${scene}-master.png`,root));
 }
 const css=await readFile(new URL('src/styles/who-we-are.css',root),'utf8');assert.match(css,/mask-image: var\(--who-mask/);
 const script=await readFile(new URL('src/scripts/who-we-are.ts',root),'utf8');assert.match(script,/is-ready/);assert.match(script,/IntersectionObserver/);assert.match(css,/prefers-reduced-motion: reduce/);
});
