import type { AstroIntegration } from "astro"
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseDocument, DomUtils } from "htmlparser2"
import captureWebsite from "capture-website"
import { isValidUrl, previewFileName } from "./utils"

interface Options {
  outPath?: string // relative astro outDir public
}

interface LinkInfo {
  href: string
  attribs: {
    [name: string]: string
  }
}

export function getPageAllValidFancyLinkInfo(pagePath: string): LinkInfo[] {

  if (!existsSync(pagePath)) return []
  const htmlSring = readFileSync(resolve(pagePath), {
    encoding: 'utf-8'
  })
  const dom = parseDocument(htmlSring)
  const allFancyLinkEle = DomUtils.getElementsByTagName('fancy-link', dom.children)
  const allValidUrlInfo = allFancyLinkEle.map(aEle => {
    const href = DomUtils.getAttributeValue(aEle, 'href') || ''
    return {
      href,
      attribs: aEle.attribs
    }
  })
  return allValidUrlInfo
}

function getCaptureLinks(dir: URL, pages: { pathname: string }[]) {
  const allPagePath = pages.map(page => dir.pathname + page.pathname + '/index.html')
  const allLink = allPagePath.map(path => getPageAllValidFancyLinkInfo(path)).flat(1)
  const matchLink = allLink.filter(({ href }) => isValidUrl(href))

  return matchLink.reduce((arr, cur) => {
    if (arr.every(v => v.href !== cur.href)) {
      arr.push(cur)
    }
    return arr
  }, [] as LinkInfo[])
}

async function capture(path: string, href: string) {
  const fileName = resolve(path, `${previewFileName(href)}.png`)
  const darkFileName = resolve(path, `${previewFileName(href, true)}.png`)
  try {
    await Promise.allSettled([
      captureWebsite.file(href, fileName, {
        overwrite: true,
        width: 1280,
        height: 800,
      }),
      captureWebsite.file(href, darkFileName, {
        overwrite: true,
        darkMode: true,
        width: 1280,
        height: 800,
      })
    ])
  } catch (e) {
    console.error('captureWebsite error:', e)
  }
}

function getInjectScript(outPath: string) {
  let content = readFileSync(resolve(new URL(".", import.meta.url).pathname, "./injectScript.prebuilt.js"), {
    encoding: "utf-8"
  })
  
  // replace path
  content = content.replace('__previewPath', `'/${outPath}'`)
  return content
}

function FancyLink(options?: Options): AstroIntegration {

  const { outPath = '__fancyLinkPreview' } = options || {}

  return {
    name: 'fancy-link',
    hooks: {
      "astro:config:setup"({ injectScript }) {
        const content = getInjectScript(outPath)
        injectScript('head-inline', content)
      },
      async "astro:build:done"({ dir, pages }) {
        const captureLinks = getCaptureLinks(dir, pages)
        const _outPath = resolve(dir.pathname, outPath)
        for (const { href } of captureLinks) {
          await capture(_outPath, href)
        }
      }
    }
  }
}

export default FancyLink