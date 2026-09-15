import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlannerUrl } from '../src/scripts/folio.ts';

const base = 'https://cartelug.github.io/paradise/';
const folio = overrides => ({ place: '', pace: '', reason: '', items: [], expiresAt: Date.now() + 1000, ...overrides });

test('deselecting a Folio choice removes it from the existing planner link', () => {
  const selected = buildPlannerUrl('journey.html', folio({ place: 'Island', pace: 'Still' }), base);
  const deselected = new URL(buildPlannerUrl(selected, folio({ pace: 'Still' }), base), base);
  assert.equal(deselected.pathname, '/paradise/journey.html');
  assert.equal(deselected.searchParams.has('place'), false);
  assert.equal(deselected.searchParams.get('pace'), 'Still');
});

test('clearing a Folio removes all previous signals and saved items from the planner link', () => {
  const selected = buildPlannerUrl('journey.html?source=folio', folio({
    place: 'Island', pace: 'Still', reason: 'Celebration',
    items: [{ type: 'journey', slug: 'safari-and-shore', label: 'Safari & Shore' }],
  }), base);
  const cleared = new URL(buildPlannerUrl(selected, folio(), base), base);
  assert.deepEqual([...cleared.searchParams], [['source', 'folio']]);
});

test('removing one saved chapter preserves only the current Folio items', () => {
  const selected = buildPlannerUrl('journey.html', folio({
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
