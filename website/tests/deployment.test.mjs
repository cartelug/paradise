import test from 'node:test';
import { execFileSync } from 'node:child_process';
test('encrypted upload verification, canonical-before-alias ordering and safe incremental deployment', () => {
  execFileSync('python3', ['tests/deploy-ftps.test.py'], { cwd: new URL('../', import.meta.url), stdio: 'pipe' });
});
