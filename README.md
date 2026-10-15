<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YhBSkxVj8QKwOdtCXGbYi_z8gSeFUAc8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 獨立頁面路徑

每個頁面可直接開啟、分享及重新整理；桌面與手機導覽支援另開分頁，瀏覽器上一頁／下一頁會同步頁面。分享表單有未送出的修改時，站內切換及上一頁／下一頁會先顯示離開確認。

| 頁面 | 路徑（相對於網站根目錄） |
| --- | --- |
| 瀏覽錄取資料 | `scores/`（原根目錄仍可使用） |
| 各校最低分數 | `minimums/` |
| 會考統計資料 | `statistics/` |
| 會考志願策略 | `insights/` |
| 分享錄取結果 | `submit/` |
| 我的收藏 | `favorites/` |
| 成績比較 | `compare/` |
| 使用說明 | `guide/` |
| 免責聲明 | `disclaimer/` |
| 隱私權與版權聲明 | `privacy/` |

GitHub Pages 部署範例：`https://tyctw.github.io/shared/statistics/`。
`npm run build` 會產生各路徑的 `index.html`，並設定資源基底路徑，適用於 GitHub Pages 子目錄部署。正式 Node 伺服器以 `NODE_ENV=production npm start` 啟動。

## 數據統計中心

`statistics/` 提供年度、就學區與身分交集篩選，包含各科有效等級分布、0～5A 科數、寫作級分、地區與身分回報比例、年度筆數及學校摘要。每項分布均標示分母；缺漏成績不視為 0 級分。積分平均數、中位數與第 25～75 百分位只在單一就學區顯示，避免混用各區積分制度。今日回報以台灣時間計算。

全國官方資料獨立於平台樣本篩選，分母為五科皆有效考生。0～5A 分類依原表人數加總，再重新計算百分比；來源連結隨官方年度切換。CSV 匯出包含目前篩選下的統計、完整學校列表與選定年度的官方參考資料。

統計與路徑測試：`npx tsx --test tests/dashboardStats.test.ts tests/pageRoutes.test.ts`。
