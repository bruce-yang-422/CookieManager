// 將 assets/icons/logo.png（原圖）縮成擴充功能需要的各尺寸 PNG
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'icons')
const source = readFileSync(join(iconsDir, 'logo.png'))
const width = source.readUInt32BE(16)
const height = source.readUInt32BE(20)
const href = `data:image/png;base64,${source.toString('base64')}`

// 用 SVG 包住原圖，讓 resvg 以高品質縮放
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <image href="${href}" width="${width}" height="${height}" />
</svg>`

for (const size of [16, 32, 48, 128]) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
  writeFileSync(join(iconsDir, `icon${size}.png`), png)
  console.log(`icon${size}.png`)
}
