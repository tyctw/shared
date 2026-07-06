export const LOCKED_ENTRY_YEAR = 115;
export const ENTRY_OPEN_AT_ISO = '2026-07-07T08:00:00+08:00';
export const ENTRY_OPEN_AT_LABEL = '115/07/07 08:00';

export const isEntryYearLocked = (year: number | string, now = Date.now()) => {
  return Number(year) === LOCKED_ENTRY_YEAR && now < Date.parse(ENTRY_OPEN_AT_ISO);
};

export const ENTRY_LOCK_MESSAGE = `115 年分享尚未開放，開放時間為 ${ENTRY_OPEN_AT_LABEL}`;
