# GitHub Release

tag: `v0.2.0`

Release title: `Cookie Manager v0.2.0`

Previous tag: `v0.1.1`

Release notes（可直接貼至 GitHub）：

```markdown
Cookie Manager v0.2.0：新增網站資料管理，可清除快取、Local Storage、IndexedDB 等網站資料。

### 新功能
- **清除目前網站的資料**：工具列小視窗新增「網站資料」，依「此頁面」或「整個網站」範圍清除，可選擇清除後重新載入頁面。
- **清除指定網站或所有網站**：管理後台工具列新增「清除網站資料」。
  - 指定網站：輸入網域（含 www 與已知子網域）或完整網址（只清除該來源）。
  - 所有網站：可設定時間範圍與排除清單，排除清單會自動儲存。
  - 批次清除：勾選多個網站後從批次列清除；每個網站的操作欄也能單獨清除。
- **可選擇的資料類型**：HTTP 快取、Cache Storage、Service Worker、Local Storage、IndexedDB、檔案系統與 WebSQL、Cookie。預設只勾選快取類，不會讓網站登出。
- **檢視目前頁面的儲存空間**：
  - 小視窗列表顯示用量與各類型數量，點選即可進入管理。
  - Local / Session Storage 可檢視、編輯、刪除。
  - IndexedDB 資料庫與 Cache Storage 可個別刪除，Service Worker 可取消註冊。

### 改進
- 勾選「清除後重新載入頁面」時，會先清除其他資料並立即以略過快取的方式重新載入，HTTP 快取在背景繼續清除，重新整理不必等待。
- 商店名稱更新為「Cookie Manager – Cookies & Site Data」（各語言版本）。

### 權限
- 新增 `browsingData`：清除網站快取與儲存空間。
- 新增 `scripting`：在目前分頁中讀取與管理 Local Storage、IndexedDB、Cache Storage 與 Service Worker。
- 所有資料仍只在瀏覽器本機處理，不會傳送到任何伺服器。詳見[隱私權政策](https://cookie-manager.stack-base.com/privacy.html)。

### 安裝
- **Chrome 線上應用程式商店（建議）**：https://chromewebstore.google.com/detail/cookie-manager/cepibofjjkncodmjaekeonggofoalcjb ，會自動更新。
- **手動安裝**：
  1. 下載本次發行附件 cookie-manager-v0.2.0.zip 並解壓縮。
  2. 開啟 chrome://extensions 或 edge://extensions。
  3. 啟用「開發人員模式」。
  4. 點選「載入未封裝項目」，選擇解壓縮後包含 manifest.json 的資料夾。

從 v0.1.x 升級：直接用新版檔案覆蓋舊資料夾後，在擴充功能頁按「重新載入」。因為新增權限，瀏覽器可能會要求重新同意。分類與設定存在瀏覽器本機，不會遺失。

### 驗證
- 已通過 TypeScript 型別檢查與 Vite 正式建置。
```

附件：`Releases/cookie-manager-v0.2.0.zip`

GitHub 的「Select a previous tag to create generated release notes」：選 `v0.1.1`。

## Chrome 線上應用程式商店上傳

上傳 `Releases/cookie-manager-v0.2.0.zip`，並在「隱私權實務」補上新權限的用途：

- `browsingData`：Clears cache, Cache Storage, Local Storage, IndexedDB, service workers and other site data for the sites the user chooses, only when the user starts a clear action.
- `scripting`：Reads and manages Local Storage, Session Storage, IndexedDB, Cache Storage and service workers of the current tab, only when the user opens the toolbar popup, to show storage usage and let the user view, edit or delete them. No data leaves the browser.
