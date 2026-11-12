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

test('explicitly approved supplied prices retain USD without an invented UGX conversion', () => {
  for (const offer of [...offers, ...cruiseTypes].filter(offer => offer.priceApproved)) {
    const price = displayPrice(offer);
    assert.equal(price.currency, 'USD');
    assert.equal(price.hasStartingPrice, true);
    assert.equal(price.secondary, null);
    assert.match(price.amount, /^USD /);
    assert.equal('fromUGX' in offer, false);
  }
});

test('an explicitly supplied UGX amount takes precedence while retaining USD context', () => {
  const price = displayPrice({ priceApproved: true, fromUGX: 10_500_000, fromUSD: 2_950 });
  assert.equal(price.currency, 'UGX');
  assert.equal(price.amount, 'UGX 10,500,000');
  assert.equal(price.secondary, 'USD 2,950');
  assert.equal(priceText({ priceApproved: true, fromUGX: 10_500_000, fromUSD: 2_950 }), 'From UGX 10,500,000');
  assert.equal(displayPrice({ priceApproved: true, fromUGX: 10_500_000, fromUSD: null }).secondary, null);
});

test('invalid or absent amounts never produce a misleading numeric starting price', () => {
  for (const amount of [null, undefined, 0, -1, NaN, Infinity]) {
    const fallback = displayPrice({ priceApproved: true, fromUGX: amount, fromUSD: 2_950 });
    assert.equal(fallback.amount, 'USD 2,950');
    const unknown = displayPrice({ priceApproved: true, fromUGX: amount, fromUSD: null });
    assert.equal(unknown.hasStartingPrice, false);
    assert.equal(unknown.currency, null);
    assert.equal(priceText({ priceApproved: true, fromUGX: amount, fromUSD: null }), 'Request a quote');
  }
});

// The new default does not remove the prices the owner had already supplied.
test('all six retained offers and four yacht rates keep their exact approved USD amounts', () => {
  const expected = { maldives: 2950, seychelles: 2450, dubai: 1250, africa: 3250, zanzibar: 3950, europe: 3850 };
  for (const [slug, amount] of Object.entries(expected)) {
    const offer = offers.find(item => item.slug === slug);
    assert.equal(offer.fromUSD, amount);
    assert.equal(offer.priceApproved, true);
  }
  assert.deepEqual(cruiseTypes.map(offer => offer.fromUSD), [450, 280, 650, 1200]);
});
