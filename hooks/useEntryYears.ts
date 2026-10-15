import { useEffect, useMemo, useState } from 'react';
import { getAvailableEntryYears, getEntryOpenAt, getLatestEntryYear } from '../utils/entryOpenLock';

export function useEntryYears() {
  const [latest, setLatest] = useState(() => getLatestEntryYear());
  useEffect(() => {
    let timer: number;
    const update = () => {
      const now = Date.now();
      const nextLatest = getLatestEntryYear(now);
      setLatest(nextLatest);
      // Long waits must stay below the browser timer limit; recheck after waking a tab.
      timer = window.setTimeout(update, Math.min(Math.max(getEntryOpenAt(nextLatest + 1) - now, 1), 2_147_483_647));
    };
    const refresh = () => { window.clearTimeout(timer); update(); };
    update();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return useMemo(() => getAvailableEntryYears(getEntryOpenAt(latest)), [latest]);
}
