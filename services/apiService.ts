import { ScoreEntry } from '../types';

// TODO: 請將此網址替換成您部署的 Google Apps Script Web App URL
// 注意：每次修改 Google Apps Script 後，必須選擇「部署」->「管理部署」->「編輯」->「版本：新版本」->「部署」，更新才會生效。
const API_URL = 'https://script.google.com/macros/s/AKfycbxRCOjCYMjeAIMT14A1kAIxXiKxt011y7Ctw_0fo_EO_PgUV_Es16uKdE_gG64GNUqh/exec';

/**
 * ============================================================================
 *  Google Apps Script (後端程式碼) - 穩健版
 * ============================================================================
 * 
 * 請將以下程式碼複製到您的 Google Apps Script 編輯器中 (覆蓋原有內容)。
 * 這個版本支援更靈活的資料接收方式，並解決了常見的解析錯誤。
 * 
 * ----------------------------------------------------------------------------
 * 
 * function doGet(e) {
 *   return handleRequest(e);
 * }
 * 
 * function doPost(e) {
 *   return handleRequest(e);
 * }
 * 
 * function handleRequest(e) {
 *   var lock = LockService.getScriptLock();
 *   lock.tryLock(30000);
 * 
 *   try {
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     
 *     // 處理 GET 請求 (讀取資料)
 *     if (!e.postData && (!e.parameter || !e.parameter.data)) {
 *       var rows = sheet.getDataRange().getValues();
 *       var data = [];
 *       // 從第二列開始讀取 (跳過標題)
 *       for (var i = 1; i < rows.length; i++) {
 *         var row = rows[i];
 *         if (!row[0]) continue;
 *         try {
 *           data.push({
 *             id: String(row[0]),
 *             timestamp: Number(row[1]),
 *             year: Number(row[2]),
 *             region: row[3],
 *             school: row[4],
 *             department: row[5],
 *             scores: {
 *               chinese: row[6], english: row[7], math: row[8],
 *               nature: row[9], social: row[10], writing: Number(row[11])
 *             },
 *             totalPoints: Number(row[12]),
 *             totalCredits: row[13] === "" ? undefined : Number(row[13]),
 *             notes: row[14]
 *           });
 *         } catch (err) {}
 *       }
 *       // 回傳 JSON
 *       return ContentService.createTextOutput(JSON.stringify(data))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 * 
 *     // 處理 POST 請求 (寫入資料)
 *     var payloadObj = null;
 *     
 *     // 嘗試解析不同來源的資料
 *     if (e.parameter && e.parameter.data) {
 *       // 來自 URLSearchParams (application/x-www-form-urlencoded)
 *       payloadObj = JSON.parse(e.parameter.data);
 *     } else if (e.postData && e.postData.contents) {
 *       // 來自 Raw JSON (application/json)
 *       payloadObj = JSON.parse(e.postData.contents);
 *     }
 * 
 *     if (!payloadObj || !payloadObj.entry) {
 *       throw new Error("Invalid Data Format");
 *     }
 * 
 *     var entry = payloadObj.entry;
 * 
 *     // 初始化標題列 (如果表格是空的)
 *     if (sheet.getLastRow() === 0) {
 *       sheet.appendRow([
 *         "ID", "Timestamp", "Year", "Region", "School", "Department", 
 *         "Chinese", "English", "Math", "Nature", "Social", "Writing", 
 *         "TotalPoints", "TotalCredits", "Notes"
 *       ]);
 *     }
 * 
 *     sheet.appendRow([
 *       entry.id,
 *       entry.timestamp,
 *       entry.year,
 *       entry.region,
 *       entry.school,
 *       entry.department,
 *       entry.scores.chinese,
 *       entry.scores.english,
 *       entry.scores.math,
 *       entry.scores.nature,
 *       entry.scores.social,
 *       entry.scores.writing,
 *       entry.totalPoints,
 *       entry.totalCredits || "", 
 *       entry.notes || ""
 *     ]);
 * 
 *     return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
 *       .setMimeType(ContentService.MimeType.JSON);
 * 
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } finally {
 *     lock.releaseLock();
 *   }
 * }
 * ----------------------------------------------------------------------------
 */

export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    // 加上 timestamp 防止快取
    const response = await fetch(`${API_URL}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const submitEntry = async (entry: ScoreEntry): Promise<boolean> => {
  try {
    // 使用 URLSearchParams 是與 GAS 溝通最穩定的方式，避免 CORS preflight 問題
    const formData = new URLSearchParams();
    
    const payload = {
      entry: entry
    };
    
    formData.append('data', JSON.stringify(payload));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    
    // GAS 有時會回傳 302 Redirect，fetch 會自動跟隨。
    // 如果回傳的是 HTML 錯誤頁面，response.json() 會失敗。
    const textResult = await response.text();
    
    try {
        const jsonResult = JSON.parse(textResult);
        if (jsonResult.status === 'error') {
            console.error('GAS API Error:', jsonResult.message);
            return false;
        }
        return true;
    } catch (e) {
        // 如果無法解析為 JSON，通常代表 GAS 發生嚴重錯誤或回傳了 HTML
        console.error('Non-JSON response from server:', textResult);
        return false;
    }
    
  } catch (error) {
    console.error('Error submitting data:', error);
    return false;
  }
};