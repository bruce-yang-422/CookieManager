# GitHub Release

tag: `v0.3.2`

Release title: `Cookie Manager v0.3.2`

Previous tag: `v0.3.1`

Release notes（可直接貼至 GitHub）

```markdown
Cookie Manager v0.3.2 修正網站資料清除失敗的問題。

### 修正

- 修正依網站清除資料時，Chrome 將來源清單判定為物件而拒絕執行的問題。此修正涵蓋 127.0.0.1 等網站。
- 清除所有網站資料時，排除來源清單也會以 Chrome API 所需的陣列格式傳入。

### 安裝

- **Chrome 線上應用程式商店（建議）**會在新版上架後自動更新。
- **手動安裝**
  1. 下載本次發行附件 cookie-manager-v0.3.2.zip 並解壓縮。
  2. 開啟 chrome://extensions 或 edge://extensions。
  3. 啟用「開發人員模式」。
  4. 點選「載入未封裝項目」，選擇解壓縮後包含 manifest.json 的資料夾。

### 驗證

- 已通過 TypeScript 型別檢查與 Vite 正式建置。
- 已確認 ZIP 內的 manifest.json 版本為 0.3.2。
```

發行附件為 `Releases/cookie-manager-v0.3.2.zip`。

在 GitHub 的「Select a previous tag to create generated release notes」選擇 `v0.3.1`。
