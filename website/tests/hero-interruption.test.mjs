import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import vm from 'node:vm';
const compiled = await build({ entryPoints: [new URL('../src/scripts/hero-rotation.ts', import.meta.url).pathname], bundle: true, write: false, format: 'iife', target: 'es2022' });
const script = compiled.outputFiles[0].text;
function rig() {
  const events = new Map(), timers = new Map(); let serial = 0;
  const listen = (name, callback) => { if (!events.has(name)) events.set(name, []); events.get(name).push(callback); };
  const dispatch = name => { for (const callback of events.get(name) || []) callback({ persisted: true }); };
  const classes = new Set(['is-ready']);
  const root = { classList: { contains: name => classes.has(name) } };
  const media = new Map();
  const matchMedia = query => {
    if (!media.has(query)) media.set(query, { matches: false, addEventListener: (_, callback) => listen(query, callback) });
    return media.get(query);
  };
  const image = { complete: true, naturalWidth: 941, decode: () => Promise.resolve(), addEventListener() {}, removeEventListener() {} };
  const slides = Array.from({length: 5}, (_, n) => ({ dataset: { state: n === 0 ? 'current' : 'idle' }, aria: n ? 'true' : null, querySelector: () => image, setAttribute(_, value) { this.aria = value; }, removeAttribute() { this.aria = null; } }));
  const rotator = { dataset: { hold: '3000', fade: '1400' }, style: { setProperty() {} }, getClientRects: () => [1], querySelectorAll: () => slides };
  const hero = { querySelector: () => rotator };
  const document = { documentElement: root, querySelector: () => hero, hidden: false, addEventListener: listen };
  const timeout = (callback, ms) => { timers.set(++serial, { callback, ms }); return serial; };
  const clear = id => timers.delete(id);
  const window = { setTimeout: timeout, addEventListener: listen };
  class Observer { observe() {} disconnect() {} }
  vm.runInNewContext(script, { window, document, matchMedia, AbortController, MutationObserver: Observer, IntersectionObserver: Observer, setTimeout: timeout, clearTimeout: clear });
  const flush = async () => { for (let i=0;i<8;i++) await Promise.resolve(); };
  const tick = async ms => { const ready = [...timers].filter(([, timer]) => timer.ms <= ms); for (const [id, timer] of ready) if (timers.delete(id)) timer.callback(); await flush(); };
  return { classes, slides, image, media, dispatch, tick, flush, timers, document };
}

test('Pause during a dissolve returns to the first still frame and stale work cannot resume it', async () => {
  const r = rig(); await r.tick(3000);
  assert.equal(r.slides[1].dataset.state, 'entering');
  r.classes.add('motion-paused'); r.dispatch('pardus:motion'); await r.tick(2000);
  assert.equal(r.slides[0].dataset.state, 'current');
  assert.equal(r.slides[0].aria, null);
  assert.ok(r.slides.slice(1).every(slide => slide.dataset.state === 'idle' && slide.aria === 'true'));
  assert.equal(r.timers.size, 0);
});

test('A late decode after reduced motion or pagehide cannot start a new fade', async () => {
  const r = rig(); let resolve;
  r.image.decode = () => new Promise(done => { resolve = done; });
  await r.tick(3000);
  r.media.get('(prefers-reduced-motion: reduce)').matches = true;
  r.dispatch('(prefers-reduced-motion: reduce)');
  r.dispatch('pagehide'); resolve(); await r.flush();
  assert.equal(r.slides[0].dataset.state, 'current');
  assert.ok(r.slides.slice(1).every(slide => slide.dataset.state === 'idle'));
  assert.equal(r.timers.size, 0);
});
