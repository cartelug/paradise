import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';

// Exercise the shipped controllers with a deterministic clock and browser APIs.
// This verifies lifecycle/failure behavior, not visual rendering or shader compilation.
const bundle = async name => (await build({
  entryPoints: [fileURLToPath(new URL(`../src/scripts/${name}.ts`, import.meta.url))],
  bundle: true, write: false, format: 'cjs', platform: 'browser', logLevel: 'silent',
})).outputFiles[0].text;
const [rendererCode, cinematicCode] = await Promise.all([bundle('hero-film'), bundle('cinematic')]);

function fixture(options = {}) {
  const frames = new Map(), events = new Map(), documentEvents = new Map(), canvasEvents = new Map();
  const uniforms = new Map(), media = new Map(), resizers = [];
  let nextFrame = 0, now = 100, draws = 0, intersection;
  const classes = () => {
    const values = new Set();
    return {add: (...keys) => keys.forEach(key => values.add(key)), remove: (...keys) => keys.forEach(key => values.delete(key)),
      contains: key => values.has(key), toggle: (key, value) => value ? values.add(key) : values.delete(key)};
  };
  const gpu = new Proxy({
    createProgram: () => ({}), createShader: () => ({}), createBuffer: () => ({}), createTexture: () => ({}),
    getShaderParameter: () => !options.shaderFailure, getProgramParameter: () => true, getAttribLocation: () => 0,
    getUniformLocation: (_, name) => name, isContextLost: () => false,
    uniform1f: (key, value) => uniforms.set(key, value), uniform2f: (key, ...value) => uniforms.set(key, value),
    uniform4f: (key, ...value) => uniforms.set(key, value), drawElements: () => draws++, drawArrays: () => draws++,
  }, {get: (target, key) => target[key] ?? (String(key).toUpperCase() === key ? 1 : () => {})});
  const paint = new Proxy({}, {get: (_, key) => key === 'drawImage' ? () => draws++ : () => {}});
  const canvas = {width: 1, height: 1, addEventListener: (type, cb) => canvasEvents.set(type, cb),
    getContext: type => {
      if (options.noCanvas) return null;
      if (type === 'webgl') {
        if (options.gpuThrows) throw new Error('GPU disabled');
        return options.canvasOnly ? null : gpu;
      }
      return paint;
    }};
  const background = {naturalWidth: options.width && options.width <= 1100 ? 1024 : 1672, naturalHeight: options.width && options.width <= 1100 ? 1536 : 941, addEventListener: () => {}, decode: async () => {if (options.imageFailure) throw new Error('Artwork unavailable');}};
  const scene = {
    dataset: /** @type {Record<string, string>} */ ({leopardOpen: 'open.webp', leopardBlink: 'blink.webp', leopardOpenSmall: 'open-small.webp', leopardBlinkSmall: 'blink-small.webp', leopardBlinkPortrait: 'portrait-blink.webp'}),
    clientWidth: options.width || 1440, clientHeight: options.height || 840, classList: classes(),
    querySelector: selector => selector === '[data-leopard-canvas]' ? canvas : background,
  };
  const root = {classList: classes(), dataset: {}};
  const hero = {addEventListener: () => {}, getBoundingClientRect: () => ({left: 0, top: 0, width: scene.clientWidth, height: scene.clientHeight})};
  const depth = {style: {setProperty: () => {}}};
  const shell = {setAttribute: () => {}, removeAttribute: () => {}};
  const document = {documentElement: root, hidden: false, fonts: {ready: Promise.resolve()},
    createElement: () => ({getContext: () => paint}),
    querySelector: selector => ({'[data-leopard-scene]': scene, '.escape-hero': hero, '[data-hero-depth]': depth, '[data-pardus-shell]': shell})[selector] || null,
    querySelectorAll: () => [], addEventListener: (type, cb) => documentEvents.set(type, cb),
  };
  class Observer {constructor(cb) {intersection = cb;} observe() {}}
  const window = {devicePixelRatio: 3, IntersectionObserver: Observer,
    clearTimeout, setTimeout, addEventListener: (type, cb) => events.set(type, cb),
    matchMedia(query) {
      if (!media.has(query)) media.set(query, {
        matches: query.includes('1100px') ? scene.clientWidth <= 1100 : query.includes('760px') ? scene.clientWidth <= 760 : false,
        addEventListener(_, cb) {this.change = cb;},
      });
      return media.get(query);
    },
  };
  const module = {exports: {}};
  const sandbox = {module, exports: module.exports, window, document, IntersectionObserver: Observer,
    ResizeObserver: class {constructor(cb) {resizers.push(cb);} observe() {} disconnect() {}},
    Image: class {set src(value) {this.url = value; queueMicrotask(() => this.onload?.());}},
    requestAnimationFrame: cb => {const id = ++nextFrame; frames.set(id, cb); return id;},
    cancelAnimationFrame: id => frames.delete(id), performance: {now: () => now},
    sessionStorage: {setItem: () => {}}, setTimeout, clearTimeout,
  };
  const step = (milliseconds = 1000) => {
    for (let elapsed = 0; elapsed < milliseconds; elapsed += 1000 / 60) {
      now += 1000 / 60;
      const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(cb => cb(now));
    }
  };
  const run = () => {runInNewContext(rendererCode, sandbox); return module.exports.createLeopardMotion(scene);};
  return {scene, canvas, frames, uniforms, media, document, events, root, step, run,
    draws: () => draws, resize: () => resizers.forEach(cb => cb()),
    loseContext: () => canvasEvents.get('webglcontextlost')({preventDefault() {}}),
    async cinematic() {runInNewContext(cinematicCode, sandbox); await new Promise(resolve => setImmediate(resolve));},
    inView: value => intersection([{isIntersecting: value}]),
    hidden: value => {document.hidden = value; documentEvents.get('visibilitychange')();},
  };
}

for (const canvasOnly of [false, true]) {
  test(`${canvasOnly ? 'Canvas' : 'WebGL'} motion pauses, resumes and honors live reduced-motion changes`, async () => {
    const f = fixture({canvasOnly});
    const rig = f.run(); rig.setActive(true, false); await rig.ready;
    assert.equal(f.scene.dataset.leopardMotion, 'running');
    assert.ok(f.scene.classList.contains('leopard-ready'));
    f.step(1600);
    const pose = Number(f.scene.dataset.leopardPose);
    assert.ok(pose > 1);
    rig.setActive(false, false);
    const pausedDraws = f.draws();
    f.step(5000);
    assert.equal(f.frames.size, 0);
    assert.equal(f.draws(), pausedDraws);
    rig.setActive(true, false); rig.setActive(true, false);
    assert.equal(f.frames.size, 1);
    f.step(500);
    assert.ok(Number(f.scene.dataset.leopardPose) < pose + 1, 'resuming must not jump through hidden time');
    rig.setActive(true, true);
    assert.equal(f.scene.dataset.leopardMotion, 'reduced');
    assert.equal(Number(f.scene.dataset.leopardPose), 0);
    assert.equal(f.frames.size, 0);
    if (!canvasOnly) {
      assert.equal(f.uniforms.get('u_time'), 0);
      assert.equal(f.uniforms.get('u_blink'), 0);
      assert.deepEqual([...f.uniforms.get('u_ears')], [0, 0]);
    }
    rig.setActive(true, false);
    assert.equal(f.frames.size, 1);
  });
}

test('hero visibility, hidden tabs and back/forward cache suspend and restore animation', async () => {
  const f = fixture(); await f.cinematic(); f.step(1000);
  f.inView(false); assert.equal(f.frames.size, 0);
  assert.ok(f.root.classList.contains('hero-dormant'));
  f.inView(true); assert.equal(f.frames.size, 1);
  f.hidden(true); assert.equal(f.frames.size, 0);
  f.hidden(false); assert.equal(f.frames.size, 1);
  f.events.get('pagehide')(); assert.equal(f.frames.size, 0);
  f.events.get('pageshow')(); assert.equal(f.frames.size, 1);
  const reduced = f.media.get('(prefers-reduced-motion: reduce)');
  reduced.matches = true; reduced.change();
  assert.equal(f.frames.size, 0);
  assert.equal(f.scene.dataset.leopardMotion, 'reduced');
});

test('missing artwork, shader failure and context loss retain the static hero', async () => {
  for (const options of [{imageFailure: true}, {shaderFailure: true}, {}]) {
    const f = fixture(options), rig = f.run(); rig.setActive(true, false); await rig.ready;
    if (!options.imageFailure && !options.shaderFailure) f.loseContext();
    assert.equal(f.frames.size, 0);
    assert.equal(f.scene.dataset.leopardMotion, 'fallback');
    assert.equal(f.scene.classList.contains('leopard-ready'), false);
  }
});

test('a blocked GPU uses the Canvas renderer; unavailable graphics preserve HTML artwork', async () => {
  const f = fixture({gpuThrows: true}), rig = f.run(); await rig.ready;
  assert.equal(f.scene.dataset.leopardRenderer, 'canvas');
  assert.ok(f.scene.classList.contains('leopard-ready'));
  const blocked = fixture({noCanvas: true});
  assert.equal(blocked.run(), null);
  assert.equal(blocked.scene.dataset.leopardMotion, 'fallback');
  assert.equal(blocked.scene.classList.contains('leopard-ready'), false);
});

test('phone, tablet and desktop canvases keep a bounded raster size and finite layout', async () => {
  for (const width of [320, 375, 768, 1100, 1101, 1440, 2560]) {
    const f = fixture({width, height: width <= 760 ? 1000 : width <= 1100 ? 1080 : 840}), rig = f.run(); await rig.ready;
    assert.ok(f.canvas.width <= 2400 && f.canvas.height <= 1800);
    assert.ok(f.uniforms.get('u_crop').every(Number.isFinite));
    f.scene.clientWidth = 0; f.scene.clientHeight = 0; f.resize();
    assert.ok(f.uniforms.get('u_crop').every(Number.isFinite));
  }
});

test('the photographed head and both ears stay inside the frame across cover crops and maximum camera push', async () => {
  // Bounds measured from the masters, independent of the motion masks.
  for (const [width,height] of [[320,1000],[375,1000],[760,1000],[768,1080],[1100,1080],[1101,820],[1440,820],[2560,1200]]) {
    const f = fixture({width,height}), rig = f.run(); await rig.ready;
    const [x,y,w,h] = f.uniforms.get('u_crop');
    const bounds = width <= 1100 ? [.565,.48,.87,.72] : [.69,.185,.925,.64];
    for (const zoom of [1,1.036]) {
      for (const [px,py] of [[bounds[0],bounds[1]],[bounds[2],bounds[3]]]) {
        const screenX = ((px-x)/w-.5)*zoom+.5;
        const screenY = ((py-y)/h-.5)*zoom+.5;
        assert.ok(screenX > .015 && screenX < .985 && screenY > .015 && screenY < .985,
          `${width} × ${height} crops the head or an ear at camera scale ${zoom}`);
      }
    }
  }
});
