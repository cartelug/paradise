import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverEnquiry } from '../src/scripts/deliver.ts';

function withFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return run().finally(() => { globalThis.fetch = original; });
}

test('deliverEnquiry resolves true on a successful response', () => withFetch(
  async (url, options) => {
    assert.equal(url, 'https://example.invalid/f/test');
    assert.equal(options.method, 'POST');
    assert.equal(options.body instanceof FormData, true);
    return { ok: true };
  },
  async () => {
    const result = await deliverEnquiry('https://example.invalid/f/test', new FormData());
    assert.equal(result, true);
  }
));

test('deliverEnquiry resolves false on a non-ok response', () => withFetch(
  async () => ({ ok: false }),
  async () => {
    const result = await deliverEnquiry('https://example.invalid/f/test', new FormData());
    assert.equal(result, false);
  }
));

test('deliverEnquiry resolves false, never throws, when fetch rejects', () => withFetch(
  async () => { throw new TypeError('network error'); },
  async () => {
    const result = await deliverEnquiry('https://example.invalid/f/test', new FormData());
    assert.equal(result, false);
  }
));
