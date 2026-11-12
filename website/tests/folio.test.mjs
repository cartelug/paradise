import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlannerUrl } from '../src/scripts/folio.ts';

const base = 'https://cartelug.github.io/paradise/';
const folio = overrides => ({ place: '', pace: '', reason: '', items: [], expiresAt: Date.now() + 1000, ...overrides });

test('deselecting a Folio choice removes it from the existing planner link', () => {
  const selected = buildPlannerUrl('journey/', folio({ place: 'Island', pace: 'Still' }), base);
  const deselected = new URL(buildPlannerUrl(selected, folio({ pace: 'Still' }), base), base);
  assert.equal(deselected.pathname, '/paradise/journey/');
  assert.equal(deselected.searchParams.has('place'), false);
  assert.equal(deselected.searchParams.get('pace'), 'Still');
});

test('clearing a Folio removes all previous signals and saved items from the planner link', () => {
  const selected = buildPlannerUrl('journey/?source=folio', folio({
    place: 'Island', pace: 'Still', reason: 'Celebration',
    items: [{ type: 'journey', slug: 'safari-and-shore', label: 'Safari & Shore' }],
  }), base);
  const cleared = new URL(buildPlannerUrl(selected, folio(), base), base);
  assert.deepEqual([...cleared.searchParams], [['source', 'folio']]);
});

test('removing one saved chapter preserves only the current Folio items', () => {
  const selected = buildPlannerUrl('journey/', folio({
    items: [
      { type: 'journey', slug: 'safari-and-shore', label: 'Safari & Shore' },
      { type: 'destination', slug: 'maldives', label: 'Maldives' },
    ],
  }), base);
  const updated = new URL(buildPlannerUrl(selected, folio({
    items: [{ type: 'destination', slug: 'maldives', label: 'Maldives' }],
  }), base), base);
  assert.equal(updated.searchParams.get('saved'), 'Maldives');
});

test('a saved-trip link opened from a directory page stays at the site root and preserves its anchor', () => {
  const current = 'https://pardusescapes.com/destination-uganda-gorillas/';
  const result = new URL(buildPlannerUrl('/planner/?source=folio#brief', folio({ place: 'Wild' }), current), current);
  assert.equal(result.pathname, '/planner/');
  assert.equal(result.searchParams.get('source'), 'folio');
  assert.equal(result.searchParams.get('place'), 'Wild');
  assert.equal(result.hash, '#brief');
});

test('a missing planner href does not create a nested planner directory', () => {
  const result = new URL(buildPlannerUrl('', folio(), 'https://pardusescapes.com/about/'), 'https://pardusescapes.com');
  assert.equal(result.pathname, '/planner/');
});
