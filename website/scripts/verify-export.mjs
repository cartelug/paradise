import { access, readdir, readFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(project, '..');
if (basename(project) !== 'website' || basename(repository) !== 'paradise') throw new Error('Unexpected export location.');

async function filesBelow(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesBelow(full));
    else found.push(full);
  }
  return found;
}

const all = await filesBelow(repository);
const publicFiles = all.filter(file => !file.startsWith(resolve(repository, '.git')) && !file.startsWith(project));
const html = publicFiles.filter(file => extname(file) === '.html');
if (html.length !== 29) throw new Error(`Expected 29 generated HTML pages; found ${html.length}.`);

const textFiles = publicFiles.filter(file => ['.html', '.css', '.js', '.xml'].includes(extname(file)));
const missing = new Set();
let combined = '';
for (const file of textFiles) {
  const source = await readFile(file, 'utf8');
  combined += source;
  for (const match of source.matchAll(/\/paradise\/([^\s"'<>),?#]*)/g)) {
    const relative = decodeURIComponent(match[1]);
    if (!relative) continue;
    try { await access(resolve(repository, relative)); } catch { missing.add(relative); }
  }
}

if (missing.size) throw new Error(`Missing exported references:\n${[...missing].sort().join('\n')}`);
if (combined.includes('api.fontshare.com')) throw new Error('The export still contains a Fontshare dependency.');
if (combined.includes('Montserrat-VariableFont_wght.ttf')) throw new Error('The export still references the retired Montserrat TTF.');
for (const retired of ['app.js', 'styles.css']) {
  try { await access(resolve(repository, retired)); throw new Error(`Retired root asset still exists: ${retired}`); } catch (error) {
    if (error instanceof Error && error.message.startsWith('Retired')) throw error;
  }
}

console.log(`Verified ${html.length} HTML pages and ${textFiles.length} generated text assets; every /paradise/ reference resolves.`);

