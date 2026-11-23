import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jasonxiang1.github.io',
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'never',
  compressHTML: false,
});
