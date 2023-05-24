import { defineConfig } from 'astro/config'
import unocss from "@unocss/astro"
import mdx from '@astrojs/mdx'
import ShikiRemarkPlugin from 'remark-shiki-plugin'
import rehypeExternalLinks from 'rehype-external-links'
import sitemap from '@astrojs/sitemap'
import fancyLinkIntegration from './fancy-link/fancyLink'

function customerHtmlHandle(code: any, html: string, theme: string) {
  const titleReg = /(?:\s|^)title\s*=\s*(["'])(.*?)(?<!\\)\1/
  const match = (code.meta || '').match(titleReg)
  const [_, __, titleValue] = Array.from(match || [])
  if (titleValue) {
    return `<figure class="${theme}-code-container">
      <figcaption class="header"><span class="tite">${titleValue}</span></figcaption>${html}
    </figure>`
  }
  
  return html
} 

// https://astro.build/config
export default defineConfig({
	site: 'https://szqingt.github.io',
	integrations: [mdx(), sitemap(), unocss({ injectReset: true }), fancyLinkIntegration()],
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
        highlightLines: true,
        customerHtmlHandle
      }]
    ],
    rehypePlugins: [
      [rehypeExternalLinks, {
        rel: ['noopener'],
        target: '_blank'
      }]
    ]
	},
});
