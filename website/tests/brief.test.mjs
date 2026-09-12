import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanBrief, validDeparture, validEmail } from '../src/scripts/brief.ts';

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
  input.set('priorities', 'Privacy');
  input.append('priorities', 'Exceptional food');
  input.set('unexpected', 'not-a-planner-field');
  const brief = cleanBrief(input);
  assert.equal(brief.name, 'A traveller');
  assert.equal(brief.notes.length, 1500);
  assert.equal(brief.date, '');
  assert.equal(brief.priorities, 'Privacy, Exceptional food');
  assert.equal(Object.hasOwn(brief, 'unexpected'), false);
  assert.equal(Object.keys(brief).length, 20);
});

test('optional email validation accepts plausible addresses and rejects malformed input', () => {
  for (const value of ['', 'traveller@example.com', 'name+journey@example.travel']) assert.equal(validEmail(value), true, value);
  for (const value of ['missing-at.example.com', '@example.com', 'name@', 'name @example.com']) assert.equal(validEmail(value), false, value);
});
