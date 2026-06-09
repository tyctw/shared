import { ScoreEntry } from '../types';

// ===============================
// API URL（Proxy Server）
// ===============================
const API_URL = '/api';

// ===============================
// Fetch Entries（讀取資料）
// ===============================
export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/entries`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
       console.error('API Error:', data.error);
       return [];
    }

    // Map DB fields back to frontend fields
    return data.map((item: any) => ({
      ...item,
      totalPoints: item.total_points ?? item.totalPoints,
      totalCredits: item.total_credits ?? item.totalCredits,
    })) as ScoreEntry[];
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
    const response = await fetch(`${API_URL}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entry }),
    });

    const data = await response.json();

    if (data.status === 'error') {
      console.error('API Error:', data.message || data.error);
      return false;
    }

    return true;
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
