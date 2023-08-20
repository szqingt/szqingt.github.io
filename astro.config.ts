import { defineConfig } from 'astro/config'
import unocss from "@unocss/astro"
import mdx from '@astrojs/mdx'
import rehypeExternalLinks from 'rehype-external-links'
import sitemap from '@astrojs/sitemap'
import fancyLinkIntegration from 'fancy-link'
import markdownCodeCopy from './integrations/copyButton'
import ShikiRemarkPlugin from 'remark-shiki-plugin'

// https://astro.build/config
export default defineConfig({
	site: 'https://szqingt.github.io',
	integrations: [markdownCodeCopy(), mdx(), sitemap(), unocss({ injectReset: true }), fancyLinkIntegration()],
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
    ],
    rehypePlugins: [
      [rehypeExternalLinks, {
        rel: ['noopener'],
        target: '_blank'
      }]
    ]
	},
  experimental: {
    viewTransitions: true
   }
});
