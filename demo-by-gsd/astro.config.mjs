// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://wangjs-jacky.github.io',
  base: '/get-shit-done-study',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
