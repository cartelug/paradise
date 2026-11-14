import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
test('blocked session storage still shows the permanent branded opening and releases by deadline', async () => {
  const source = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  const bootstrap = source.match(/const bootstrap = `([\s\S]*?)`;/)[1];
  const classes = new Set(), timers = [];
  const root = { dataset: {}, classList: { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)) } };
  let released = false;
  vm.runInNewContext(bootstrap, { document: { documentElement: root, querySelector: () => ({ removeAttribute: () => { released = true; } }) }, sessionStorage: { getItem() { throw Error('blocked'); } }, performance: { now: () => 0 }, setTimeout: callback => { timers.push(callback); return 1; } });
  assert.ok(classes.has('intro-active') && classes.has('intro-full'));
  timers[0]();
  assert.ok(!classes.has('intro-active') && classes.has('is-ready') && released);
});
