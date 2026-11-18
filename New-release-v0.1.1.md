# GitHub Release

tag: `v0.1.1`

Release title: `Cookie Manager v0.1.1`

Previous tag: `v0.1.0`

Release notes（可直接貼至 GitHub）：

```markdown
Cookie Manager v0.1.1：內建分類支援多國語言，並大幅擴充自動分類。

### 改進
- 內建分類名稱會跟著介面語言（繁體中文、English、日本語）顯示；自訂過的名稱維持不變。
- 自動分類新增約 1,200 個日本、英美與國際常用網域，總數從約 900 個增加到約 2,100 個，涵蓋購物、新聞、影音、金融、生活服務、線上工具等。
- 政府與教育分類新增日、韓、英、澳、加、紐、法等國的政府與學校網域結尾，以及線上課程、檢定考試與學術資料庫。
- 更新 128 像素擴充功能圖示。

### 修正
- 主網域判斷新增 `ad.jp`、`lg.jp`、`ed.jp`、`gr.jp`、`gc.ca`、`govt.nz`、`gouv.fr` 等二級網域。例如日本地方政府網站（`.lg.jp`）現在能正確歸入「政府與教育」。
  - 這類網域底下的網站分組會變得更細，若先前曾手動指定分類，可能需要重新指定。

### 安裝
1. 下載本次發行附件 cookie-manager-v0.1.1.zip 並解壓縮。
2. 開啟 chrome://extensions 或 edge://extensions。
3. 啟用「開發人員模式」。
4. 點選「載入未封裝項目」，選擇解壓縮後包含 manifest.json 的資料夾。

從 v0.1.0 升級：移除舊版後載入新資料夾，或直接用新版檔案覆蓋舊資料夾後在擴充功能頁按「重新載入」。分類與設定存在瀏覽器本機，覆蓋檔案並重新載入不會遺失；若移除擴充功能，請先在管理後台匯出分類備份。

### 驗證
- 已通過 TypeScript 型別檢查與 Vite 正式建置。
```

附件：`Releases/cookie-manager-v0.1.1.zip`

GitHub 的「Select a previous tag to create generated release notes」：選 `v0.1.0`。
