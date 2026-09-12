import { cp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(project, 'dist');
const repository = resolve(project, '..');
// This export is intentionally available only from the checked-in website/ source.
if (basename(project) !== 'website' || !(await stat(resolve(repository, '.git'))).isDirectory()) {
  throw new Error('Run this script from the website source in the GitHub checkout.');
}
const files = await readdir(output);
if (!files.includes('index.html')) throw new Error('Run the GitHub Pages build first.');
// Remove only known generated output. This prevents stale HTML and hashed assets from
// surviving a deployment while preserving the source, documentation and git metadata.
for (const directory of ['brand', 'fonts', 'images', 'static']) {
  await rm(resolve(repository, directory), { recursive: true, force: true });
}
for (const entry of await readdir(repository, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (/\.(?:html|xml)$/.test(entry.name) || ['robots.txt', 'opening.js', 'app.js', 'styles.css'].includes(entry.name)) {
    await rm(resolve(repository, entry.name), { force: true });
  }
}
for (const file of files) await cp(resolve(output, file), resolve(repository, file), { recursive: true });
await writeFile(resolve(repository, '.nojekyll'), '');
console.log(`Exported ${files.length} entries to the repository root. Existing unrelated files are preserved.`);
