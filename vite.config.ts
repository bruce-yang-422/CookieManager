import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

export default defineConfig({
  plugins: [vue(), crx({ manifest })],
  // 打包結果固定輸出到 extension/，瀏覽器「載入未封裝項目」就選這個資料夾
  build: {
    outDir: 'extension',
    emptyOutDir: true,
    // 外掛從本機載入，不需要為了網路下載拆小檔案
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: { origin: [/chrome-extension:\/\//] },
  },
})
