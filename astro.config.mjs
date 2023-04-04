import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://szqingt.github.io',
	integrations: [mdx(), sitemap(), unocss()],
});
