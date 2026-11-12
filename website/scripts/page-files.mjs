import { access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Public pages in Astro's directory output; legacy redirect files are not pages.
export async function pageFiles(directory) {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && ['index.html', '404.html'].includes(entry.name)) pages.push(entry.name);
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'website') continue;
    try {
      await access(resolve(directory, entry.name, 'index.html'));
      pages.push(`${entry.name}/index.html`);
    } catch { /* Assets and source directories are not public routes. */ }
  }
  return pages.sort();
}
