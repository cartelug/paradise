import { cp, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(project, 'dist');
const repository = resolve(project, '..');
// This export is intentionally available only from the checked-in website/ source.
if (!project.endsWith('/website') || !(await stat(resolve(repository, '.git'))).isDirectory()) {
  throw new Error('Run this script from the website source in the GitHub checkout.');
}
const files = await readdir(output);
if (!files.includes('index.html')) throw new Error('Run the GitHub Pages build first.');
for (const file of files) await cp(resolve(output, file), resolve(repository, file), { recursive: true });
await writeFile(resolve(repository, '.nojekyll'), '');
console.log(`Exported ${files.length} entries to the repository root. Existing unrelated files are preserved.`);
