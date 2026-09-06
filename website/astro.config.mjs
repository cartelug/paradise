import { defineConfig } from 'astro/config';

const base = process.env.PARDUS_BASE || '/';
export default defineConfig({
  site: 'https://cartelug.github.io',
  base,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', assets: 'static' },
  server: { host: '0.0.0.0', port: 4173 },
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: ['terminal.local'] } },
});
