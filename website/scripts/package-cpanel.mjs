// Zips the CONTENTS of website/dist (not the dist folder itself) into website/release/pardus-site-cpanel.zip, ready to
// upload to public_html in cPanel File Manager and Extract. Run it after `npm run build:domain`; it refuses a build that
// was made for GitHub Pages. Pure Node (zlib), so it needs no zip program.
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(project, 'dist');
const output = resolve(project, 'release', 'pardus-site-cpanel.zip');

const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8').catch(() => '');
if (!robots.includes('https://pardusescapes.com/sitemap-index.xml')) {
  throw new Error('website/dist is not a pardusescapes.com build. Run `npm run build:domain` first.');
}
for (const required of ['index.html', '404.html', '.htaccess']) await stat(resolve(dist, required));

async function filesBelow(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesBelow(full));
    else if (entry.isFile()) found.push(full);
  }
  return found;
}

const table = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buffer => { let c = 0xffffffff; for (const byte of buffer) c = table[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
// DOS date and time for the archive entries (the build time; cPanel shows it in File Manager).
const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

const files = (await filesBelow(dist)).sort();
const locals = [], centrals = [];
let offset = 0;
for (const file of files) {
  const name = Buffer.from(relative(dist, file).split(sep).join('/'), 'utf8');
  const data = await readFile(file);
  const packed = deflateRawSync(data, { level: 9 });
  const stored = packed.length >= data.length;
  const body = stored ? data : packed;
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(stored ? 0 : 8, 8);
  local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12); local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(body.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(0x031e, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(stored ? 0 : 8, 10); central.writeUInt16LE(dosTime, 12); central.writeUInt16LE(dosDate, 14); central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(body.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE((0o100644 << 16) >>> 0, 38); central.writeUInt32LE(offset, 42);
  locals.push(local, name, body);
  centrals.push(central, name);
  offset += local.length + name.length + body.length;
}
const directory = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, Buffer.concat([...locals, directory, end]));
const size = (await stat(output)).size;
console.log(`Packed ${files.length} files from website/dist into website/release/pardus-site-cpanel.zip (${(size / 1048576).toFixed(1)} MB).`);
console.log('Upload it to public_html in cPanel File Manager and choose Extract. index.html and .htaccess land directly in public_html.');
