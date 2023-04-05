import { defineConfig, presetIcons, presetUno } from 'unocss'
import logo from './public/faviocn.svg'

export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
      collections: {
        custom: {
          ['site-logo']: `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200.000000 200.000000">
          <g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
          fill="currentColor">
          <path d="M100 1400 l0 -500 199 0 199 0 4 -87 c7 -141 58 -227 166 -280 45
          -22 73 -28 148 -31 l93 -4 17 -55 c62 -196 265 -343 474 -343 230 0 442 172
          489 398 51 244 -98 502 -332 576 l-55 17 -4 93 c-3 75 -9 103 -31 148 -53 108
          -139 159 -279 166 l-88 4 0 199 0 199 -500 0 -500 0 0 -500z m800 201 l0 -99
          -87 -4 c-197 -10 -302 -115 -311 -310 l-4 -88 -99 0 -99 0 0 300 0 300 300 0
          300 0 0 -99z m349 -315 c37 -20 51 -55 51 -130 l0 -64 -52 -17 c-149 -48 -277
          -174 -322 -319 l-18 -56 -63 0 c-35 0 -76 5 -90 12 -50 23 -55 47 -55 290 1
          238 4 258 51 284 36 20 459 20 498 0z m285 -420 c105 -51 161 -144 161 -266 0
          -85 -21 -142 -74 -203 -82 -92 -237 -121 -353 -64 -160 79 -215 278 -118 430
          80 126 246 170 384 103z"/>
          </g>
          </svg>
          `
        }
      }
    }),
    presetUno(),
  ],
})
