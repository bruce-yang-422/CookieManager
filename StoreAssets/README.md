# Chrome Web Store 圖片資產

此資料夾為繁體中文商店頁準備，圖片可直接上傳；尚未代為上傳。

| 檔案 | 尺寸 | 上傳欄位 |
| --- | --- | --- |
| store-icon-128.png | 128×128 | 商店圖示 |
| 01-dashboard-1280x800.png | 1280×800 | 在地化螢幕截圖，第 1 張 |
| 02-cookie-editor-1280x800.png | 1280×800 | 在地化螢幕截圖，第 2 張 |
| small-promo-440x280.png | 440×280 | 小型宣傳圖（選用） |
| marquee-promo-1400x560.png | 1400×560 | 大型宣傳圖（選用） |

展示圖以實際 Vue 介面截圖排版，Cookie、網站清單與網站圖示皆為示範資料；不包含個人瀏覽資料。宣傳圖沿用既有品牌圖示，採科技藍、餅乾金與簡潔排版。

已確認所有展示圖與宣傳圖為 8-bit RGB PNG，沒有 alpha 透明通道。商店圖示保留既有 PNG 透明背景。

規格來源：https://developer.chrome.com/docs/webstore/cws-dashboard-listing

## 上架文字

[listing.md](listing.md) 收錄目前版本（v0.2.0）的商店文字，可直接複製貼上：

- 商品詳細資料的說明（繁體中文、English、日本語）
- 隱私權實務：單一用途說明、各權限的理由、網站存取權限的理由

撰寫商店說明時，請用一般使用者看得懂的語言描述功能，不要在一句中列舉大量技術名詞。v0.2.0 曾因列出「HTTP 快取、Cache Storage、Service Worker、Local Storage、IndexedDB…」被以「關鍵字垃圾內容」退件。權限理由欄位只給審查人員看，可以寫得技術化。
