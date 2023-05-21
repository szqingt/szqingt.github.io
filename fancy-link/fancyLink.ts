import type { AstroIntegration } from "astro"
import { readFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { parseDocument, DomUtils } from "htmlparser2"
import { isValidUrl, previewFileName } from "./utils"
import captureWebsite from "capture-website"

interface Options {
  outPath?: string // relative astro outDir
  exclude?: string[]
}

interface LinkInfo {
  href: string
  attribs: {
    [name: string]: string;
  };
  name?: string
}

export function getPageAllValidATageInfo(pagePath: string): LinkInfo[] {

  if (!existsSync(pagePath)) return []
  const htmlSring = readFileSync(resolve(pagePath), {
    encoding: 'utf-8'
  })
  const dom = parseDocument(htmlSring)
  const allAEle = DomUtils.getElementsByTagName('a', dom.children)
  const allValidUrlInfo = allAEle.map(aEle => {
    const href = DomUtils.getAttributeValue(aEle, 'href') || ''
    return {
      href,
      attribs: aEle.attribs,
      name: DomUtils.textContent(aEle)
    }
  })
  return allValidUrlInfo
}

function fancyLinkFilter(linkInfo: LinkInfo) {
  const fancyLinkAttrName = 'data-is-fancy-link'
  // rfc
  // data-is-fancy-link => "" data-is-fancy-link="true" => "true"
  return isValidUrl(linkInfo.href) && typeof linkInfo.attribs[fancyLinkAttrName] === 'string'
}

function getCaptureLinks(dir: URL, pages: { pathname: string }[], exclude: string[]) {
  const allPagePath = pages.map(page => dir.pathname + page.pathname + '/index.html')
  const allLink = allPagePath.map(path => getPageAllValidATageInfo(path)).flat(1)
  const matchLink = allLink.filter(fancyLinkFilter).filter(({ href }) => !exclude.length || exclude.every(v => !href.includes(v)))

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
        overwrite: true
      }), captureWebsite.file(href, darkFileName, {
        overwrite: true,
        darkMode: true
      })
    ])
  } catch (e) {
    console.error('captureWebsite error:', e);
  }
}

function FancyLink(options?: Options): AstroIntegration {

  const { outPath = '__fancyLinkPreview', exclude = [] } = options || {}

  return {
    name: 'collect-link-data',
    hooks: {
      async "astro:build:done"({ dir, pages }) {
        const captureLinks = getCaptureLinks(dir, pages, exclude);
        const _outPath = resolve(dir.pathname, outPath)
        for (const {href} of captureLinks) {
          await capture(_outPath, href)
        }
      }
    }
  }
}

export default FancyLink