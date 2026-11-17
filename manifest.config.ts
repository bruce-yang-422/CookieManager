import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  // 名稱與說明依瀏覽器語言顯示，文字在 public/_locales/*/messages.json
  name: '__MSG_extName__',
  version: pkg.version,
  description: '__MSG_extDescription__',
  default_locale: 'en',
  icons: {
    16: 'assets/icons/icon16.png',
    32: 'assets/icons/icon32.png',
    48: 'assets/icons/icon48.png',
    128: 'assets/icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: '__MSG_extName__',
    default_icon: {
      16: 'assets/icons/icon16.png',
      32: 'assets/icons/icon32.png',
    },
  },
  options_page: 'src/dashboard/index.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  permissions: ['cookies', 'storage', 'favicon'],
  host_permissions: ['<all_urls>'],
})
