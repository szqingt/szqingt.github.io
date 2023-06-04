import { describe, it, expect, afterEach } from 'vitest'
import { resolve } from 'node:path'
import { existsSync, rmSync, readFileSync } from 'node:fs'
import FancyLink, { getPageAllValidFancyLinkInfo } from '../src/fancyLink'
import { readdirSync } from 'node:fs'

const TEST_DATA = [
  {
    attribs: {
      'data-is-fancy-link': 'true',
      href: 'https://google.com',
    },
    href: 'https://google.com',
    name: 'google',
  },
  {
    href: 'https://bing.com',
    name: 'bing',
  },
  {
    href: 'https://google.com',
    name: 'google1',
  },
]

describe('getHtmlPageAllValidUrlForATage', () => {
  it('getHtmlPageAllValidUrlForATage should collect page all Url', () => {
    const allUrl = getPageAllValidFancyLinkInfo(resolve(__dirname, './index.html'))
    expect(allUrl).toMatchSnapshot()
  })
})

// describe('fancy link', () => {

//   // it('fancy link should generate preview file', () => {

//   //   const collect = FancyLink()
//   //   const doneHook = collect.hooks['astro:build:done']
//   //   doneHook && doneHook({
//   //     dir: new URL('fiel:///Users/never_1992/project/szqingt.github.io/fancy-link'),
//   //     pages: [{
//   //       pathname: ''
//   //     }],
//   //     routes: []
//   //   })
//   // })

//   // it('fancy link should generate preview file with target path', () => {

//   //   const collect = FancyLink({
//   //     outPath: resolve(__dirname),
//   //   })
//   //   const doneHook = collect.hooks['astro:build:done']
//   //   doneHook && doneHook({
//   //     dir: new URL('fiel:///Users/never_1992/project/szqingt.github.io/fancy-link'),
//   //     pages: [{
//   //       pathname: ''
//   //     }],
//   //     routes: []
//   //   })
//   // })

//   it('fancy link should generate without google',async () => {

//     const collect = FancyLink({
//       exclude: ['google']
//     })
//     const doneHook = collect.hooks['astro:build:done']
//     doneHook && await doneHook({
//       dir: new URL('fiel:///Users/never_1992/project/szqingt.github.io/fancy-link'),
//       pages: [{
//         pathname: ''
//       }],
//       routes: []
//     })

//     expect(readdirSync(resolve(__dirname, '__fancyLinkPrview'))).toStrictEqual([ '-78bd255e.png' ])
//   }, {
//     timeout: 2 * 60 * 1000
//   })
// })