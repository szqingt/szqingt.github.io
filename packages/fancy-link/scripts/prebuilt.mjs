import { build } from 'tsup'

await build({
  name: 'fancy-link prebuilt',
  entry: ['src/injectScript.ts'],
  format: 'iife',
  platform: 'browser',
  minify: true,
  replaceNodeEnv: true,
  outExtension() {
    return {
      js: `.prebuilt.js`,
    }
  }
})

