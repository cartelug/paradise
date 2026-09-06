import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanBrief, validDeparture } from '../src/scripts/brief.ts';

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
  input.set('email', 'not-a-planner-field@example.invalid');
  const brief = cleanBrief(input);
  assert.equal(brief.name, 'A traveller');
  assert.equal(brief.notes.length, 1500);
  assert.equal(brief.date, '');
  assert.equal(Object.hasOwn(brief, 'email'), false);
  assert.equal(Object.keys(brief).length, 9);
});
