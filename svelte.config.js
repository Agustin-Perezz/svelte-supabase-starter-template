import { resolve } from 'path';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '200.html',
      precompress: false,
      strict: true
    }),

    alias: {
      $lib: resolve('./src/lib'),
      '$lib/*': resolve('./src/lib/*'),
      $components: resolve('./src/lib/components'),
      '$components/*': resolve('./src/lib/components/*'),
      $schemas: resolve('./src/lib/schemas'),
      '$schemas/*': resolve('./src/lib/schemas/*')
    }
  }
};

export default config;
