
import { getHighlighter } from 'shiki'
import { runAsWorker } from 'synckit'

let h

async function handler(command, options) {
  if (command === 'getHighlighter') {
    h = await getHighlighter(options)
  }
  else if (command === 'codeToHtml') {
    const { code, lang, theme, lineOptions } = options
    const loadedLanguages = h.getLoadedLanguages()
    if (loadedLanguages.includes(lang))
      return h.codeToHtml(code, { lang, theme, lineOptions })
    else
      return h.codeToHtml(code, { lang: 'text', theme, lineOptions })
  }
}

runAsWorker(handler)
