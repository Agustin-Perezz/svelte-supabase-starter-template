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
      '$lib/shared/*': resolve('./src/lib/shared/*'),
      $components: resolve('./src/lib/components'),
      '$components/*': resolve('./src/lib/components/*'),
      $domain: resolve('./src/domain'),
      '$domain/*': resolve('./src/domain/*'),
      $application: resolve('./src/application'),
      '$application/*': resolve('./src/application/*'),
      $infrastructure: resolve('./src/infrastructure'),
      '$infrastructure/*': resolve('./src/infrastructure/*')
    }
  }
};

export default config;
