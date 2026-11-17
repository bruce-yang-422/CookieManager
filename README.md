<div align="center">

<img src="assets/icons/icon128.png" alt="Cookie Manager" width="96" />

# Cookie Manager

依網站分類、搜尋與刪除 Cookie 的 Chrome / Edge 擴充功能。所有資料只存在本機。

**繁體中文** | [English](README.en.md)

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

</div>

## 目錄

- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [開發指令](#開發指令)
- [專案結構](#專案結構)
- [多國語言](#多國語言)
- [隱私權](#隱私權)
- [發佈到商店](#發佈到商店)
- [已知限制](#已知限制)
- [文件維護](#文件維護)

## 功能特色

### 管理後台

- 依主網站合併顯示 Cookie（例如 `.mail.google.com` 歸在 `google.com`）
- 自訂分類：新增、改名、選顏色、調整順序、刪除
- 搜尋網站、Cookie 名稱或網域
- 單獨刪除單一 Cookie，或刪除整個網站的 Cookie
- 批次操作：勾選多個網站後一次刪除、匯出或移至分類
- Cookie 明細：值、網域、路徑、到期時間、Secure / HttpOnly / SameSite 屬性，可一鍵複製值
- 匯出 Cookie：每個網站可單獨匯出，也可批次匯出多個網站；支援 JSON、Netscape（cookies.txt）與 Header 字串格式，可下載檔案或複製到剪貼簿
- 備份／還原分類資料（備份檔不含 Cookie 內容）
- 介面支援繁體中文、English、日本語，預設跟隨瀏覽器語言，也可手動切換
- 深色模式；Cookie 有變動時自動更新列表
- 最大寬度 1440px，超寬螢幕下置中顯示

### 工具列小視窗（快速工具）

- 列出目前分頁的所有 Cookie，可切換「此頁面」或「整個網站」範圍，並可搜尋
- 建立、編輯與刪除 Cookie（名稱、值、網域、路徑、到期時間、SameSite、Secure、HttpOnly 等）
- 以多種格式匯入與匯出 Cookie：JSON、Netscape（cookies.txt）、Header 字串；匯入時自動判斷格式
- 一鍵刪除目前分頁的所有 Cookie
- 直接替目前網站設定分類，一鍵開啟管理後台

## 技術架構

| 項目 | 使用技術 |
| --- | --- |
| 擴充功能規格 | Chrome Manifest V3 |
| 建置工具 | [Vite](https://vite.dev/) + [CRXJS](https://crxjs.dev/) |
| 前端框架 | [Vue 3](https://vuejs.org/)（Composition API） |
| UI 元件庫 | [Naive UI](https://www.naiveui.com/) |
| 程式語言 | TypeScript（strict 模式） |
| 資料儲存 | `chrome.storage.local`（純本機，無後端） |

## 快速開始

### 環境需求

- [Node.js](https://nodejs.org/) 18 以上
- Google Chrome 或 Microsoft Edge（最新版）

### 安裝與打包

```bash
git clone <repository-url>
cd CookieManager
npm install
npm run build
```

打包結果會輸出到 `extension/` 資料夾。

### 在瀏覽器載入

1. 開啟 `chrome://extensions`（Edge 為 `edge://extensions`）
2. 開啟右上角的 **開發人員模式**
3. 點選 **載入未封裝項目**，選擇 `extension/` 資料夾

修改程式後重新打包，再到擴充功能頁面按外掛卡片上的重新載入（↻）即可。

## 開發指令

| 指令 | 說明 |
| --- | --- |
| `npm run build` | 型別檢查並打包到 `extension/` |
| `npm run watch` | 監看檔案變更，自動重新打包到 `extension/` |
| `npm run typecheck` | 只執行型別檢查 |
| `npm run icons` | 由 `assets/icons/icon.svg` 產生各尺寸 PNG 圖示 |
| `npm run dev` | 啟動 Vite 開發伺服器（熱更新） |

## 專案結構

```text
CookieManager/
├── src/
│   ├── background/        # Service Worker（首次安裝時開啟管理後台）
│   ├── popup/             # 工具列小視窗
│   │   └── components/    # Cookie 編輯表單、匯入面板、匯出面板
│   ├── dashboard/         # 管理後台
│   │   └── components/    # Cookie 明細抽屜、分類管理視窗、匯出視窗
│   ├── lib/               # Cookie 操作、匯入匯出格式、分類備份、圖示、語言選單、主題切換、共用外框
│   ├── i18n/              # 介面翻譯
│   │   └── locales/       # zh-TW.ts（主要）、en.ts、ja.ts
│   ├── storage/           # 分類資料讀寫
│   └── styles/            # 共用樣式
├── public/_locales/       # 擴充功能名稱與說明的翻譯（Chrome 格式）
├── assets/icons/          # 擴充功能圖示（icon.svg 為原始檔）
├── scripts/               # 建置輔助腳本（產生圖示）
├── extension/             # 打包結果（自動產生，請勿手動修改）
├── index.html             # GitHub Pages 介紹網站首頁
├── privacy.html           # 隱私權政策
├── site/                  # 介紹網站共用的樣式與語言切換
├── .nojekyll              # 讓 GitHub Pages 直接提供靜態檔案
├── manifest.config.ts     # Manifest 設定
└── vite.config.ts         # Vite 設定
```

## 多國語言

目前支援：繁體中文（`zh-TW`）、English（`en`）、日本語（`ja`）。

- **介面語言**：預設跟隨瀏覽器語言（中文 → 繁體中文、日文 → 日本語、其他 → English），可在小視窗或管理後台右上角的語言選單切換，設定會在所有頁面同步。
- **翻譯檔**：`src/i18n/locales/`。`zh-TW.ts` 是主要語言，其他語言檔必須包含相同的 key，缺少時 `npm run typecheck` 會報錯。
- **參數與單複數**：訊息中的 `{name}` 會被參數取代；需要區分單複數時寫成 `"單數 | 複數"`，依參數 `n` 選擇。
- **擴充功能名稱與說明**：`public/_locales/<語言>/messages.json`，顯示在瀏覽器的擴充功能頁面與商店。

### 新增語言

1. 複製 `src/i18n/locales/en.ts` 為新語言檔（例如 `ko.ts`）並翻譯
2. 在 `src/i18n/index.ts` 的 `LOCALES`、`DICTIONARIES`、`NAIVE_LOCALES` 與 `detect()` 加入新語言
3. 新增 `public/_locales/<語言>/messages.json`

## 隱私權

- 不收集、不傳送任何使用者資料，沒有後端伺服器
- 不使用分析工具、廣告或任何第三方服務
- 不載入遠端程式碼
- 匯出的 Cookie 檔案直接下載到本機，不經過任何伺服器；檔案含有登入憑證，請妥善保管

完整內容請見 [隱私權政策](privacy.html)。

### 權限說明

| 權限 | 用途 |
| --- | --- |
| `cookies` | 讀取、建立、編輯與刪除 Cookie |
| `storage` | 在本機儲存分類設定 |
| `favicon` | 從瀏覽器快取顯示網站圖示 |
| `<all_urls>` | 管理任何網站的 Cookie |

## 發佈到商店

1. 執行 `npm run build`
2. 將 `extension/` 資料夾的**內容**壓縮成 zip
3. 上傳到 [Chrome Web Store 開發人員資訊主頁](https://chrome.google.com/webstore/devconsole) 或 [Microsoft Edge 合作夥伴中心](https://partner.microsoft.com/dashboard/microsoftedge/)
4. 隱私權政策網址：`https://<帳號>.github.io/<repo>/privacy.html`

### 介紹網站（GitHub Pages）

根目錄的 `index.html` 是工具介紹網站，`privacy.html` 是隱私權政策分頁，兩頁都支援繁體中文、English、日本語（可用 `?lang=en` 等參數指定語言）。

1. 將專案推送到 GitHub
2. 到 repo 的 **Settings → Pages**，Source 選 **Deploy from a branch**
3. Branch 選 `main`，資料夾選 `/ (root)`，按 **Save**

## 已知限制

- 尚未支援無痕模式的 Cookie
- 部分分區 Cookie（CHIPS）可能不會顯示
- 主網站判斷使用內建規則，少數特殊網域可能歸類不精確

## 文件維護

本專案的 README 提供兩種語言，內容需保持同步：

- [README.md](README.md)：繁體中文（主要版本）
- [README.en.md](README.en.md)：English

修改任一份時，請同時更新另一份。
