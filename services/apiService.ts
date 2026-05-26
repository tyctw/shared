import { ScoreEntry } from '../types';

// ===============================
// API URL（Google Apps Script）
// ===============================
const API_URL =
  'https://script.google.com/macros/s/AKfycbxRCOjCYMjeAIMT14A1kAIxXiKxt011y7Ctw_0fo_EO_PgUV_Es16uKdE_gG64GNUqh/exec';

// ===============================
// Fetch Entries（讀取資料）
// ===============================
export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    const response = await fetch(`${API_URL}?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return Array.isArray(data) ? (data as ScoreEntry[]) : [];
  } catch (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
};

// ===============================
// Submit Entry（寫入資料）
// ===============================
export const submitEntry = async (entry: ScoreEntry): Promise<boolean> => {
  try {
    const formData = new URLSearchParams();

    formData.append(
      'data',
      JSON.stringify({
        entry,
      })
    );

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);

      if (json?.status === 'error') {
        console.error('GAS Error:', json.message);
        return false;
      }

      return true;
    } catch {
      console.error('Invalid JSON response:', text);
      return false;
    }
  } catch (error) {
    console.error('Submit error:', error);
    return false;
  }
};

// ===============================
// Log User Action（你缺的就是這個）
// ===============================
export const logUserAction = (
  action: string,
  detail?: string
): void => {
  try {
    console.log('[USER_ACTION]', {
      action,
      detail: detail ?? '',
      timestamp: Date.now(),
    });

    // 👉 如果你未來要接 analytics（GA / PostHog），可以在這裡加
    // example:
    // analytics.track(action, { detail });

  } catch (error) {
    console.warn('logUserAction failed:', error);
  }
};
