import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Bundle the production data module so its Astro-style relative imports resolve.
const result = await build({
  entryPoints: [fileURLToPath(new URL('../src/data/offers.ts', import.meta.url))],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
});
const { displayPrice, priceText, offers, cruiseTypes } = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
);

test('existing supplied prices retain USD without an invented UGX conversion', () => {
  for (const offer of [...offers, ...cruiseTypes]) {
    const price = displayPrice(offer);
    assert.equal(price.currency, 'USD');
    assert.equal(price.hasStartingPrice, true);
    assert.equal(price.secondary, null);
    assert.match(price.amount, /^USD /);
    assert.equal('fromUGX' in offer, false);
  }
});

test('an explicitly supplied UGX amount takes precedence while retaining USD context', () => {
  const price = displayPrice({ fromUGX: 10_500_000, fromUSD: 2_950 });
  assert.equal(price.currency, 'UGX');
  assert.equal(price.amount, 'UGX 10,500,000');
  assert.equal(price.secondary, 'USD 2,950');
  assert.equal(priceText({ fromUGX: 10_500_000, fromUSD: 2_950 }), 'From UGX 10,500,000');
  assert.equal(displayPrice({ fromUGX: 10_500_000, fromUSD: null }).secondary, null);
});

test('invalid or absent amounts never produce a misleading numeric starting price', () => {
  for (const amount of [null, undefined, 0, -1, NaN, Infinity]) {
    const fallback = displayPrice({ fromUGX: amount, fromUSD: 2_950 });
    assert.equal(fallback.amount, 'USD 2,950');
    const unknown = displayPrice({ fromUGX: amount, fromUSD: null });
    assert.equal(unknown.hasStartingPrice, false);
    assert.equal(unknown.currency, null);
    assert.equal(priceText({ fromUGX: amount, fromUSD: null }), 'Quote on request');
  }
});
