// 將 assets/icons/icon.svg 轉成擴充功能需要的各尺寸 PNG
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'icons')
const svg = readFileSync(join(iconsDir, 'icon.svg'))

for (const size of [16, 32, 48, 128]) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
  writeFileSync(join(iconsDir, `icon${size}.png`), png)
  console.log(`icon${size}.png`)
}
