import test from 'node:test';
import assert from 'node:assert/strict';
import { briefText, cleanBrief, normalisePlannerDraft, resolvePlannerContext, validDeparture, validEmail } from '../src/scripts/brief.ts';

test('departure validation handles optional dates, the local cutoff, and calendar validity', () => {
  const minimum = '2026-09-06';
  for (const value of ['', '2026-09-06', '2026-12-31', '2028-02-29']) {
    assert.equal(validDeparture(value, minimum), true, value);
  }
  for (const value of ['2026-09-05', '2027-02-29', '2026-11-31', '2026-13-01', '09/07/2026', 'invalid']) {
    assert.equal(validDeparture(value, minimum), false, value);
  }
});

test('journey brief accepts only defined fields and bounds free text', () => {
  const input = new FormData();
  input.set('name', '  A traveller  ');
  input.set('notes', 'x'.repeat(2000));
  input.set('saved', 's'.repeat(2000));
  input.set('priorities', 'Privacy');
  input.append('priorities', 'Exceptional food');
  input.set('unexpected', 'not-a-planner-field');
  const brief = cleanBrief(input);
  assert.equal(brief.name, 'A traveller');
  assert.equal(brief.notes.length, 1500);
  assert.equal(brief.saved.length, 1000);
  assert.equal(brief.date, '');
  assert.equal(brief.priorities, 'Privacy, Exceptional food');
  assert.equal(Object.hasOwn(brief, 'unexpected'), false);
  assert.equal(Object.keys(brief).length, 21);
});

test('optional email validation accepts plausible addresses and rejects malformed input', () => {
  for (const value of ['', 'traveller@example.com', 'name+journey@example.travel']) assert.equal(validEmail(value), true, value);
  for (const value of ['missing-at.example.com', '@example.com', 'name@', 'name @example.com']) assert.equal(validEmail(value), false, value);
});

const savedFolio = {
  place: 'Island', pace: 'Still', reason: 'Celebration',
  items: [
    { type: 'destination', label: 'Maldives' },
    { type: 'destination', label: 'South Africa' },
    { type: 'journey', label: 'Safari & Shore' },
    { type: 'journey', label: 'Private Island Reset' },
  ],
};

test('every saved Folio chapter reaches the cleaned and downloaded journey brief', () => {
  const context = resolvePlannerContext({}, savedFolio, new URLSearchParams());
  const data = new FormData();
  Object.entries(context).forEach(([name, value]) => data.set(name, value));
  const brief = cleanBrief(data);
  assert.equal(brief.destination, 'Maldives');
  assert.equal(brief.style, 'Safari & Shore');
  assert.equal(brief.saved, 'Maldives, South Africa, Safari & Shore, Private Island Reset');
  assert.match(briefText(brief), /Saved inspiration: Maldives, South Africa, Safari & Shore, Private Island Reset/);
});

test('explicit URL choices take precedence over a draft, and draft edits take precedence over the Folio', () => {
  const draft = { place: 'Wild', pace: '', reason: 'Family', destination: 'South Africa', style: 'A different idea', saved: 'A previous personal selection' };
  const context = resolvePlannerContext(draft, savedFolio, new URLSearchParams('reason=Business&style=Executive+Arrivals&saved=New+inspiration'));
  assert.equal(context.place, 'Wild');
  assert.equal(context.pace, '');
  assert.equal(context.destination, 'South Africa');
  assert.equal(context.reason, 'Business');
  assert.equal(context.style, 'Executive Arrivals');
  assert.equal(context.saved, 'New inspiration');
  const cleared = resolvePlannerContext(draft, savedFolio, new URLSearchParams('place=&saved='));
  assert.equal(cleared.place, '');
  assert.equal(cleared.saved, '');
});

test('draft restoration rejects malformed fields and bounds accepted personal notes', () => {
  const restored = normalisePlannerDraft({ name: { invalid: true }, notes: 'x'.repeat(1700), place: '', priorities: 'Privacy, Exceptional food', unexpected: 'ignore' });
  assert.equal(Object.hasOwn(restored, 'name'), false);
  assert.equal(Object.hasOwn(restored, 'unexpected'), false);
  assert.equal(restored.notes.length, 1500);
  assert.equal(restored.place, '');
  assert.equal(restored.priorities, 'Privacy, Exceptional food');
  assert.deepEqual(normalisePlannerDraft(['invalid']), {});
});
