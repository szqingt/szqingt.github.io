import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://szqingt.github.io',
	integrations: [mdx(), sitemap(), unocss()],
	markdown: {
		shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme:'vitesse-dark',
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
	}
});
