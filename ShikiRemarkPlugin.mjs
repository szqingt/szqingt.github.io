import { createRequire } from 'module'
import { createSyncFn } from 'synckit'
import { visit } from 'unist-util-visit'

function resolveOptions(options) {
  const themes = []
  let darkModeThemes
  if (!options.theme) {
    themes.push('nord')
  } else if ('dark' in options.theme || 'light' in options.theme) {
    darkModeThemes = options.theme
    themes.push(darkModeThemes.dark)
    themes.push(darkModeThemes.light)
  } else {
    themes.push(options.theme)
  }
  return {
    ...options,
    themes,
    darkModeThemes
  }
}

export function ShikiRemarkPlugin(options = {}) {
  let syncRun
  const require = createRequire(import.meta.url)
  syncRun = createSyncFn(require.resolve('./worker.mjs'))
  const { themes, darkModeThemes } = resolveOptions(options);
  syncRun('getHighlighter', { themes })

  // All remark and rehype plugins return a separate function
  return function (tree) {

    visit(tree, 'code', visitor)
    function visitor(node) {
      let highlighted
      if (darkModeThemes) {
        const dark = syncRun('codeToHtml', {
          code: node.value,
          theme: darkModeThemes.dark,
          lang: node.lang || 'text',
        }).replace(`<pre class="shiki ${darkModeThemes.dark}"`, '<pre class="shiki shiki-dark"')
        const light = syncRun('codeToHtml', {
          code: node.value,
          theme: darkModeThemes.light,
          lang: node.lang || 'text',
        }).replace(`<pre class="shiki ${darkModeThemes.light}"`, '<pre class="shiki shiki-light"')

        highlighted = `<div class="shiki-container">${dark}${light}</div>`
      } else {
        highlighted = syncRun('codeToHtml', {
          code: node.value,
          lang: node.lang || 'text',
        })
      }

      node.type = 'html'
      node.value = highlighted
    }

  }
}