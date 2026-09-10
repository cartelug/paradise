import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// 97 Design credit mark for the footer: trimmed and resized from the supplied source badge.
const input = 'source-assets/97-design-logo-source.png';
await mkdir('public/brand', { recursive: true });
const trimmed = sharp(input).trim({ background: '#ffffff', threshold: 12 });
const meta = await trimmed.metadata();
console.log('trimmed size:', meta.width, meta.height);
await trimmed.clone().resize(240, 240).png({ compressionLevel: 9 }).toFile('public/brand/97-design-logo.png');
await trimmed.clone().resize(480, 480).png({ compressionLevel: 9 }).toFile('public/brand/97-design-logo@2x.png');
console.log('97 Design logo exported to public/brand/97-design-logo.png (+@2x).');
