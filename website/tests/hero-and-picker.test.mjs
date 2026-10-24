import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import sharp from 'sharp';

const bundled = await build({
  entryPoints: [fileURLToPath(new URL('../src/data/offers.ts', import.meta.url))],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
});
const { services, serviceGroups } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const metadata = JSON.parse(await read('src/data/unfolding-earth-artwork.json'));
const plain = markup => markup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// The owner selected Unfolding Earth on 24 October. Retired V31 coat pins and the
// price dock are not part of this first section; the services below remain.
test('every responsive artwork has a valid, undistorted WebP and AVIF export', async () => {
  for (const scene of ['desktop', 'mobile']) {
    const master = await sharp(resolve(site, 'source-assets/v32-unfolding-earth', `${scene}-master.png`)).metadata();
    assert.equal(master.width, metadata[scene].width);
    assert.equal(master.height, metadata[scene].height);
    for (const width of metadata[scene].widths) {
      for (const ext of ['webp', 'avif']) {
        const file = resolve(site, 'public/images', `pardus-unfolding-${scene}-${width}.${ext}`);
        assert.ok(await exists(file), file);
        const image = await sharp(file).metadata();
        assert.equal(image.width, width);
        assert.ok(Math.abs(image.height - width * master.height / master.width) <= 1);
      }
    }
  }
  assert.match(await read('source-assets/v32-unfolding-earth/ARTWORK.md'), /AI-generated/);
});

test('the hero preloads only the artwork used by its responsive picture', async () => {
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  const hero = html.match(/<section class="hero hero--atlas"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  assert.equal((hero.match(/<picture/g) || []).length, 1);
  assert.match(hero, /fetchpriority="high"/);
  assert.match(hero, /media="\(max-width: 600px\)"/);
  const preloads = html.match(/<link[^>]*rel="preload"[^>]*as="image"[^>]*>/g) || [];
  assert.equal(preloads.length, 2, 'one mutually exclusive preload for each art direction');
  for (const preload of preloads) assert.match(preload, /pardus-unfolding-/);
  assert.match(preloads[0], /max-width: 600px/);
  assert.match(preloads[1], /min-width: 601px/);
  assert.match(html, new RegExp('property="og:image" content="[^"]*pardus-unfolding-desktop-' + metadata.desktop.width + '\\.webp'));
  assert.doesNotMatch(hero, /pardus-hero-desktop|pardus-hero-phone/);
});

test('the selected headline, service sentence and both live actions are present', async () => {
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  const hero = html.match(/<section class="hero hero--atlas"[\s\S]*?<\/section>/)?.[0];
  assert.match(plain(hero), /Bespoke luxury travel Extraordinary journeys\. Personally curated\./);
  assert.match(plain(hero), /Flights, stays, safaris and private experiences, arranged around you\. From Africa to the world\./);
  assert.match(hero, /href="[^"]*journey\.html"[^>]*><span>Plan your escape<\/span>/);
  assert.match(hero, /href="#destinations"[^>]*><span>Explore destinations<\/span><\/a>/);
  assert.ok(html.includes('id="destinations"'), 'secondary action has a real target');
  assert.match(hero, /alt="A leopard walks across an unfolding atlas/);
  assert.equal((hero.match(/<h1\b/g) || []).length, 1);
});

test('the complete walking leopard has measured head, body, tail and paw regions', async () => {
  const markup = await read('src/components/Hero.astro');
  for (const part of ['tail', 'body', 'head', 'paws']) {
    assert.match(markup, new RegExp("part: '" + part + "', d: \\["));
  }
  assert.match(markup, /data-leopard-box/);
  const css = await read('src/styles/hero.css');
  assert.match(css, /object-fit: contain/);
  assert.match(css, /\.hero-stage \{[^}]*aspect-ratio: 1663 \/ 946/);
  assert.match(css, /\.hero-art \{[^}]*position: relative;[^}]*grid-row: 2/);
  assert.doesNotMatch(css, /min-height: 100(?:s|d)?vh/);
});

test('the first section stays calm and clear of retired pins and price overlays', async () => {
  const markup = await read('src/components/Hero.astro');
  assert.match(markup, /data-life="still"/);
  assert.doesNotMatch(markup, /<canvas|hero-life\.ts|hero-rail|class="spot"|hero-services/);
  const css = await read('src/styles/hero.css');
  assert.doesNotMatch(css, /hero-breathe|hl-glow|hl-ignite|--hero-shift|animation:.*infinite/);
  assert.doesNotMatch(await read('src/scripts/ui.ts'), /hero\.style\.setProperty/);
  const motion = await read('src/styles/motion.css');
  assert.match(motion, /prefers-reduced-motion: reduce/);
});

test('homepage header colours are scoped, with the existing approved vector logo', async () => {
  const header = await read('src/components/Header.astro');
  assert.match(header, /<Brand vector light=\{!home\}/);
  const css = await read('src/styles/hero.css');
  assert.match(css, /\.home \.site-header/);
  assert.match(css, /\.home \.desktop-nav a/);
  assert.match(css, /@media \(min-width: 1000px\)/);
  const ui = await read('src/scripts/ui.ts');
  assert.match(ui, /document\.body\.classList\.contains\('home'\) \? '\(min-width: 1000px\)'/);
});

test('the service picker retains every service as a tap target and a plain GET form', async () => {
  const markup = await read('src/components/ServicePicker.astro');
  assert.match(markup, /method="get"/);
  assert.match(markup, /journey\.html/);
  assert.match(markup, /type="checkbox" name="services"/);
  const grouped = serviceGroups.flatMap(group => group.items);
  assert.equal(grouped.length, 13);
  assert.deepEqual([...grouped].sort(), [...services].sort());
});

test('the exported homepage retains the service picker and floating action', async () => {
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  assert.equal((html.match(/<input type="checkbox" name="services"/g) || []).length, 13);
  for (const service of services) assert.ok(html.includes(`value="${service.replace(/&/g, '&amp;')}"`));
  assert.match(html, /<form[^>]*data-picker[^>]*action="[^"]*journey\.html"/);
  for (const hook of ['data-hero-life', 'data-leopard-box', 'data-sticky-cta']) assert.ok(html.includes(hook));
});

test('the enquiry form turns selected services into the start of the note', async () => {
  const script = await read('src/scripts/enquiry.ts');
  assert.match(script, /getAll\('services'\)/);
  assert.match(script, /I would like Pardus to arrange/);
});

test('shared buttons keep their existing press, focus and arrow treatments', async () => {
  const css = await read('src/styles/base.css');
  assert.match(css, /\.btn > :is\(\.icon-arrow-right, \.icon-arrow-up-right, \.icon-arrow-down\)/);
  assert.match(css, /\.btn:active/);
  assert.match(css, /\.btn:focus-visible/);
  assert.match(css, /min-height: 54px/);
});
