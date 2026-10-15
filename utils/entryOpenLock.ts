const TAIWAN_OFFSET_MS = 8 * 60 * 60 * 1000;

export const getEntryOpenAt = (year: number) => Date.UTC(year + 1911, 6, 5) - TAIWAN_OFFSET_MS;
export const getEntryOpenLabel = (year: number | string) => `${Number(year)}/07/05 00:00`;

export const getLatestEntryYear = (now = Date.now()) => {
  const currentYear = new Date(now + TAIWAN_OFFSET_MS).getUTCFullYear() - 1911;
  return now >= getEntryOpenAt(currentYear) ? currentYear : currentYear - 1;
};

export const getAvailableEntryYears = (now = Date.now()) =>
  Array.from({ length: 6 }, (_, i) => getLatestEntryYear(now) - i);

export const isEntryYearLocked = (year: number | string, now = Date.now()) => {
  const value = Number(year);
  return !Number.isInteger(value) || value < 1 || value > getLatestEntryYear(now);
};

export const getEntryLockMessage = (year: number | string) =>
  Number.isInteger(Number(year)) && Number(year) > 0
    ? `${Number(year)} 年分享尚未開放，開放時間為 ${getEntryOpenLabel(year)}（台灣時間）`
    : '請選擇有效的會考年度';
