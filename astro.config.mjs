import { defineConfig } from 'astro/config';
import unocss from "@unocss/astro";
import mdx from '@astrojs/mdx';
import ShikiRemarkPlugin from 'remark-shiki-plugin';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://szqingt.github.io',
	integrations: [mdx(), sitemap(), unocss()],
	markdown: {
    // shikiConfig: {
    //   langs: [],
    //   wrap: true,
    //   theme: ['vitesse-dark', 'vitesse-light']
    // },
		syntaxHighlight: false,
    remarkPlugins: [
      [ShikiRemarkPlugin, {
        themes: ['vitesse-dark', 'vitesse-light'],
        generateMultiCode: true,
        highlightLines: true
      }]
    ]
	},
});
