import assert from 'node:assert/strict';
import test from 'node:test';
import { getAvailableEntryYears, getLatestEntryYear, getEntryOpenAt, isEntryYearLocked, getEntryLockMessage } from '../utils/entryOpenLock';
const time = (value: string) => Date.parse(value);

test('ROC 116 opens exactly at July 5 midnight Taiwan time', () => {
  const before=time('2027-07-04T23:59:59.999+08:00');
  const at=time('2027-07-05T00:00:00+08:00');
  assert.equal(getEntryOpenAt(116), at);
  assert.equal(getLatestEntryYear(before),115);
  assert.equal(getLatestEntryYear(at),116);
  assert.equal(isEntryYearLocked(116,before),true);
  assert.equal(isEntryYearLocked(116,at),false);
  assert.deepEqual(getAvailableEntryYears(at),[116,115,114,113,112,111]);
});
test('annual rollover uses Taiwan timezone and handles New Year', () => {
  assert.equal(getLatestEntryYear(time('2028-01-01T00:00:00+08:00')),116);
  assert.equal(getLatestEntryYear(time('2028-07-04T15:59:59Z')),116);
  assert.equal(getLatestEntryYear(time('2028-07-04T16:00:00Z')),117);
  assert.equal(getLatestEntryYear(time('2029-07-05T00:00:00+08:00')),118);
});
test('past years remain open, future and invalid years cannot be submitted', () => {
  const now=time('2027-07-05T00:00:00+08:00');
  assert.equal(isEntryYearLocked('115',now),false);
  assert.equal(isEntryYearLocked('116',now),false);
  for(const value of ['117','9999','foo','',0,-1,115.5,NaN]) assert.equal(isEntryYearLocked(value,now),true);
  assert.match(getEntryLockMessage(117),/117\/07\/05 00:00/);
});
test('115 opens July 5 instead of the old July 7 date', () => {
  assert.equal(isEntryYearLocked(115,time('2026-07-04T23:59:59+08:00')),true);
  assert.equal(isEntryYearLocked(115,time('2026-07-05T00:00:00+08:00')),false);
  assert.deepEqual(getAvailableEntryYears(time('2026-10-15T00:00:00+08:00')),[115,114,113,112,111,110]);
});
