import { resolve } from 'path';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    alias: {
      $lib: resolve('./src/lib'),
      '$lib/*': resolve('./src/lib/*'),
      $components: resolve('./src/lib/components'),
      '$components/*': resolve('./src/lib/components/*'),
      $modules: resolve('./src/lib/modules'),
      '$modules/*': resolve('./src/lib/modules/*')
    }
  }
};

export default config;
