import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateDashboardStats, summarizePoints } from '../utils/dashboardStats';
import { Region, ScoreEntry } from '../types';
import { NATIONAL_STATS, NATIONAL_TOTALS } from '../data/nationalStats';
const now = new Date('2026-10-15T00:30:00+08:00').getTime();
const makeEntry = (patch: Partial<ScoreEntry> = {}): ScoreEntry => ({
  id: 'one', year: 115, school: '同名高中', department: '', studentIdentity: '一般生', region: Region.KEELUNG_TAIPEI_NEWTAIPEI,
  totalPoints: 30, timestamp: now, scores: { chinese: 'A++', english: 'A+', math: 'A', nature: 'B', social: 'C', writing: 0 }, ...patch,
});
const all = { year: 'all', region: 'all', identity: 'all' };

test('filters intersect and cross-region point averages are suppressed', () => {
  const entries = [makeEntry(), makeEntry({year:114}), makeEntry({region:Region.TAOYUAN}), makeEntry({studentIdentity:'原住民生'})];
  assert.equal(calculateDashboardStats(entries, all, now).points,null);
  const stats = calculateDashboardStats(entries, {year:'115', region:'基北區', identity:'一般生'},now);
  assert.equal(stats.total,1); assert.equal(stats.points?.median,30);
});
test('partial grades use per-subject denominators, missing writing is not zero', () => {
  const malformed = makeEntry({scores: {chinese:'A++', english:'', math:'', nature:'', social:'', writing:undefined} as unknown as ScoreEntry['scores']});
  const stats=calculateDashboardStats([makeEntry(),malformed],all,now);
  assert.equal(stats.subjects[0].valid,2); assert.equal(stats.subjects[1].valid,1);
  assert.equal(stats.completeGrades,1); assert.equal(stats.aDistribution[3].count,1);
  assert.equal(stats.writingValid,1); assert.equal(stats.writingDistribution[0].count,1);
});
test('Taiwan today boundaries and seconds/milliseconds work independently of host timezone', () => {
  const previousDay=new Date('2026-10-14T23:59:59+08:00').getTime();
  const midnight=new Date('2026-10-15T00:00:00+08:00').getTime();
  const stats=calculateDashboardStats([makeEntry({timestamp:previousDay}),makeEntry({timestamp:midnight/1000}),makeEntry({timestamp:now}),makeEntry({timestamp:NaN})],all,now);
  assert.equal(stats.today,2); assert.equal(stats.latest,now);
});
test('schools with the same name in different regions stay separate', () => {
  const stats=calculateDashboardStats([makeEntry(),makeEntry({region:Region.TAOYUAN}),makeEntry({school:''})],all,now);
  assert.equal(stats.schoolCount,2); assert.equal(stats.schools[0].count,1);
  assert.ok(Math.abs(stats.schools[0].share - 100/3) < 1e-9);
});
test('median and interpolated quartiles exclude invalid points and support zero', () => {
  const values=[0,10,20,30,NaN,Infinity,-1].map(totalPoints=>makeEntry({totalPoints}));
  assert.deepEqual(summarizePoints(values),{count:4,average:15,min:0,max:30,median:15,q1:7.5,q3:22.5});
  assert.equal(summarizePoints([]).median,null);
});
test('empty data uses zero counts and no invented percentages', () => {
  const stats=calculateDashboardStats([],all,now);
  assert.equal(stats.total,0); assert.equal(stats.latest,null); assert.equal(stats.completeGrades,0);
  assert.equal(stats.aDistribution.every(row=>row.count===0&&row.share===0),true);
});
test('official categories reconcile with valid candidate totals and percentages', () => {
  for(const year of Object.keys(NATIONAL_STATS) as (keyof typeof NATIONAL_STATS)[]) {
    assert.equal(NATIONAL_STATS[year].reduce((sum,row)=>sum+row.count,0),NATIONAL_TOTALS[year]);
    for(const row of NATIONAL_STATS[year]) assert.equal(row.percentage,Number((row.count/NATIONAL_TOTALS[year]*100).toFixed(2)));
  }
});
