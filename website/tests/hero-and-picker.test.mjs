import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Bundle the production data module so its Astro-style relative imports resolve.
const bundled = await build({
  entryPoints: [fileURLToPath(new URL('../src/data/offers.ts', import.meta.url))],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
});
const { services, serviceGroups } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

// The layered, animated leopard hero and the "What should we arrange?" picker (V30.2).
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const exists = async file => { try { await access(file); return true; } catch { return false; } };

test('the hero leopard is built from layers that exist on disk', async () => {
  for (const name of [
    'pardus-leopard-v30.avif', 'pardus-leopard-v30.webp', 'pardus-leopard-v30-eyes.avif', 'pardus-leopard-v30-eyes.webp', 'pardus-leopard-v30-mask.webp',
    'pardus-world-desktop-v30-640.avif', 'pardus-world-desktop-v30-1280.webp', 'pardus-world-desktop-v30-1536.avif',
    'pardus-world-mobile-v30-480.avif', 'pardus-world-mobile-v30-768.webp', 'pardus-world-mobile-v30-1024.avif',
    'pardus-thumb-maldives.webp', 'pardus-thumb-seychelles.webp', 'pardus-thumb-dubai.webp',
  ]) assert.equal(await exists(resolve(site, 'public/images', name)), true, `${name} is missing: run scripts/prepare-v30-hero-layers.py`);
});

test('the generated layer geometry puts the leopard on the right and the blink patch over its eyes', async () => {
  const layers = JSON.parse(await read('src/data/hero-layers.json'));
  const { left, top, width, height } = layers.desktop.leopard;
  assert.ok(left > 50 && left < 75, `leopard left ${left}`);
  assert.ok(left + width > 100, 'the cutout must run past the right edge of the picture so its cut edge is never seen');
  assert.ok(top > 0 && top + height < 105, `leopard top/height ${top}/${height}`);
  const { eyes, blink } = layers.leopard;
  for (const eye of Object.values(eyes)) {
    assert.ok(eye.x > blink.left && eye.x < blink.left + blink.width, 'an eye lies outside the blink patch horizontally');
    assert.ok(eye.y > blink.top && eye.y < blink.top + blink.height, 'an eye lies outside the blink patch vertically');
  }
  assert.ok(blink.width < 60 && blink.height < 20, 'the blink patch must stay a small patch over the eyes');
  const css = await read('src/styles/hero-layers.css');
  assert.match(css, new RegExp(`--lx: ${left}%`), 'hero-layers.css is out of date with hero-layers.json');
});

test('the hero keeps every part of the animated leopard and honours pause and reduced motion', async () => {
  const markup = await read('src/components/Hero.astro');
  for (const hook of ['data-hero-life', 'data-leopard-box', 'data-leopard-eyes', 'hl-world', 'hl-breath', 'hl-rim', 'data-hero-motes', 'hero-life.ts', 'data-hero-spots']) {
    assert.ok(markup.includes(hook), `Hero.astro lost "${hook}"`);
  }
  const script = await read('src/scripts/hero-life.ts');
  for (const behaviour of ['prefers-reduced-motion', 'motion-paused', 'visibilitychange', "dataset.quality = 'lite'", 'slowBlink']) {
    assert.ok(script.includes(behaviour), `hero-life.ts lost "${behaviour}"`);
  }
  const motion = await read('src/styles/motion.css');
  assert.match(motion, /html\.motion-paused[^{]*\.hl-breath/, 'Pause scene must stop the breathing');
  assert.match(motion, /prefers-reduced-motion: reduce[\s\S]*\.hl-breath/, 'reduced motion must stop the breathing');
});

// The owner found the earlier leopard unsettling for some clients (15 October 2026): glowing eyes, a head that followed the
// pointer, finger or tilted phone, a flare and a buzz when touched. It must stay warm and regal: alive, never watching the visitor.
test('the hero leopard is calm: no glowing eyes, no following the visitor, no reaction to a touch', async () => {
  const markup = await read('src/components/Hero.astro');
  assert.doesNotMatch(markup, /hl-glow/, 'the leopard must not have glowing eyes');
  const script = await read('src/scripts/hero-life.ts');
  for (const forbidden of ['pointermove', 'pointerdown', 'touchmove', 'deviceorientation', 'vibrate', 'startle', 'glint', 'scrollY']) {
    assert.ok(!script.includes(forbidden), `hero-life.ts must not use "${forbidden}": the leopard never reacts to the visitor`);
  }
  const css = await read('src/styles/hero.css');
  assert.doesNotMatch(css, /hl-glow|hl-ignite|--spot|--push/, 'hero.css must not carry glow, ignite, pointer-light or scroll-push rules');
  assert.match(script, /slowBlink/, 'the leopard keeps a slow, relaxed blink');
  assert.match(css, /hl-breathe/, 'the leopard keeps breathing');
  // The animal sways slowly (more than ten seconds a turn would be too still; faster than about six would look restless).
  assert.match(script, /Math\.sin\(now \/ 6900\)/);
});

test('the phone dock shows all three destinations and prices at once, with no hidden swipe', async () => {
  const css = await read('src/styles/hero.css');
  assert.match(css, /\.hero-offers \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/, 'the dock must be a three-column grid on phones');
  assert.doesNotMatch(css, /scroll-snap-type/, 'the dock must not be a swipe carousel');
  const markup = await read('src/components/Hero.astro');
  assert.doesNotMatch(markup, /hero-dots|hero-rail-foot/);
});

test('the service picker offers every service as a tap target and is a plain GET form', async () => {
  const markup = await read('src/components/ServicePicker.astro');
  assert.match(markup, /method="get"/);
  assert.match(markup, /journey\.html/);
  assert.match(markup, /type="checkbox" name="services"/);
  // Every one of the 13 services is reachable through the groups the picker renders.
  const grouped = serviceGroups.flatMap(group => group.items);
  assert.equal(grouped.length, 13);
  assert.deepEqual([...grouped].sort(), [...services].sort());
});

test('the exported homepage ships the picker, the layered hero and the floating button', async () => {
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  assert.equal((html.match(/<input type="checkbox" name="services"/g) || []).length, 13, 'the homepage must carry 13 service checkboxes');
  const escaped = value => value.replace(/&/g, '&amp;');
  for (const service of services) assert.ok(html.includes(`value="${escaped(service)}"`), `missing service ${service}`);
  assert.match(html, /<form[^>]*data-picker[^>]*action="[^"]*journey\.html"/);
  for (const hook of ['data-hero-life', 'data-leopard-box', 'data-leopard-eyes', 'data-sticky-cta']) assert.ok(html.includes(hook), `index.html lost ${hook}`);
  assert.ok(html.includes('pardus-world-desktop-v30') && html.includes('pardus-leopard-v30'), 'index.html does not use the layered hero images');
});

test('the enquiry form turns ?services= into the start of the note', async () => {
  const script = await read('src/scripts/enquiry.ts');
  assert.match(script, /getAll\('services'\)/);
  assert.match(script, /I would like Pardus to arrange/);
});

test('buttons share one system: a round arrow on every trailing arrow, press and focus states', async () => {
  const css = await read('src/styles/base.css');
  assert.match(css, /\.btn > :is\(\.icon-arrow-right, \.icon-arrow-up-right, \.icon-arrow-down\)/);
  assert.match(css, /\.btn:active/);
  assert.match(css, /\.btn:focus-visible/);
  assert.match(css, /min-height: 54px/);
});

test('the hero pins place themselves', async () => {
  const script = await read('src/scripts/hero-life.ts');
  for (const behaviour of ['layoutSpots', "dataset.off = 'true'", 'is-measuring', "dataset.spots = 'ready'"]) assert.ok(script.includes(behaviour), `hero-life.ts lost "${behaviour}"`);
  const markup = await read('src/components/Hero.astro');
  assert.match(markup, /key: 'maldives'[\s\S]*key: 'dubai'[\s\S]*key: 'yacht'/, 'Maldives must keep first claim on space');
  assert.doesNotMatch(markup, /hero-services/, 'the first screen stays uncluttered: the services are listed lower down, in "What we arrange"');
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  assert.equal((html.match(/class="spot"/g) || []).length, 3, 'the homepage must carry three pins');
});

