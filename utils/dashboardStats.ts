import { GRADES } from '../constants';
import { ScoreEntry } from '../types';

export const SUBJECTS = [
  { key: 'chinese', name: '國文' }, { key: 'english', name: '英語' },
  { key: 'math', name: '數學' }, { key: 'nature', name: '自然' }, { key: 'social', name: '社會' },
] as const;
export interface DashboardFilters { year: string; region: string; identity: string }
export const percentage = (count: number, total: number) => total ? count / total * 100 : 0;
const identityOf = (entry: ScoreEntry) => entry.studentIdentity || '一般生';
export function normalizeTimestamp(timestamp: number): number | null {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  const value = timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
  return Number.isFinite(new Date(value).getTime()) ? value : null;
}
export function summarizePoints(entries: ScoreEntry[]) {
  const values = entries.map(e => e.totalPoints).filter(value => typeof value === 'number' && Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  const n = values.length;
  const quantile = (p: number) => {
    if (!n) return null;
    const position = (n - 1) * p;
    const low = Math.floor(position);
    return values[low] + (values[Math.ceil(position)] - values[low]) * (position - low);
  };
  return { count: n, average: n ? values.reduce((a, b) => a + b, 0) / n : null,
    min: n ? values[0] : null, max: n ? values[n - 1] : null,
    median: quantile(0.5), q1: quantile(0.25), q3: quantile(0.75) };
}
function groupEntries(entries: ScoreEntry[], key: (entry: ScoreEntry) => string) {
  const groups = new Map<string, ScoreEntry[]>();
  for (const entry of entries) {
    const name = key(entry);
    const group = groups.get(name) || [];
    group.push(entry);
    groups.set(name, group);
  }
  return [...groups].map(([name, rows]) => ({ name, rows, count: rows.length, share: percentage(rows.length, entries.length) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-Hant'));
}
export function calculateDashboardStats(entries: ScoreEntry[], filters: DashboardFilters, now = Date.now()) {
  const filtered = entries.filter(e => (filters.year === 'all' || String(e.year) === filters.year)
    && (filters.region === 'all' || e.region === filters.region)
    && (filters.identity === 'all' || identityOf(e) === filters.identity));
  // Taiwan has no daylight-saving time; use UTC+8 regardless of the viewer's timezone.
  const dayStart = Math.floor((now + 8 * 3600_000) / 86400_000) * 86400_000 - 8 * 3600_000;
  const timestamps = filtered.map(e => normalizeTimestamp(e.timestamp)).filter((value): value is number => value !== null);
  const subjects = SUBJECTS.map(subject => {
    const counts = Object.fromEntries(GRADES.map(grade => [grade, 0])) as Record<string, number>;
    for (const entry of filtered) {
      const grade = entry.scores?.[subject.key];
      if (Object.prototype.hasOwnProperty.call(counts, grade)) counts[grade]++;
    }
    const valid = Object.values(counts).reduce((a, b) => a + b, 0);
    return { ...subject, valid, counts, percentages: Object.fromEntries(GRADES.map(grade => [grade, percentage(counts[grade], valid)])),
      aShare: percentage(counts['A++'] + counts['A+'] + counts.A, valid) };
  });
  const aCounts = Array(6).fill(0) as number[];
  let completeGrades = 0;
  const writingCounts = Array(7).fill(0) as number[];
  for (const entry of filtered) {
    const grades = SUBJECTS.map(subject => entry.scores?.[subject.key]);
    if (grades.every(grade => GRADES.includes(grade))) {
      completeGrades++;
      aCounts[grades.filter(grade => grade.startsWith('A')).length]++;
    }
    const writing = entry.scores?.writing;
    if (typeof writing === 'number' && Number.isInteger(writing) && writing >= 0 && writing <= 6) writingCounts[writing]++;
  }
  const writingValid = writingCounts.reduce((a, b) => a + b, 0);
  const schools = groupEntries(filtered.filter(e => e.school?.trim()), e => JSON.stringify([e.region, e.school.trim()]))
    .map(group => ({ ...group, region: group.rows[0].region, school: group.rows[0].school.trim(),
      share: percentage(group.count, filtered.length), points: summarizePoints(group.rows) }));
  const years = groupEntries(filtered, e => String(e.year)).map(group => ({ ...group, points: summarizePoints(group.rows) }))
    .sort((a, b) => Number(a.name) - Number(b.name));
  const regions = groupEntries(filtered, e => e.region);
  return { filtered, total: filtered.length,
    today: timestamps.filter(time => time >= dayStart && time < dayStart + 86400_000 && time <= now).length,
    latest: timestamps.length ? timestamps.reduce((latest, value) => Math.max(latest, value), 0) : null,
    schoolCount: schools.length, regionCount: regions.length,
    subjects, completeGrades, writingValid,
    aDistribution: aCounts.map((count, a) => ({ name: `${a}A`, count, share: percentage(count, completeGrades) })),
    writingDistribution: writingCounts.map((count, grade) => ({ name: `${grade}級分`, count, share: percentage(count, writingValid) })),
    regions, schools, years, identities: groupEntries(filtered, identityOf),
    points: filters.region === 'all' ? null : summarizePoints(filtered),
  };
}
