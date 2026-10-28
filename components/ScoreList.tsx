import AdmissionCard from './AdmissionCard';
import { useEntryYears } from '../hooks/useEntryYears';
import React, { useState, useEffect } from 'react';
import { ScoreEntry, StudentIdentity } from '../types';
import { REGIONS } from '../constants';
import { MapPin, Search, Sparkles, Calendar, School, ChevronLeft, ChevronRight, Filter, ChevronDown, RefreshCw, RotateCcw, UsersRound } from 'lucide-react';

interface ScoreListProps {
  entries: ScoreEntry[];
  isLoading?: boolean;
  favoriteIds?: string[];
  toggleFavorite?: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const REPORT_EMAIL = import.meta.env.VITE_REPORT_EMAIL || 'tyctw.analyze@gmail.com';

const hasTotalCredits = (entry: Pick<ScoreEntry, 'totalCredits'>) => typeof entry.totalCredits === 'number';

const compareMinimumAdmissionEntry = (a: ScoreEntry, b: ScoreEntry) => {
  if (a.totalPoints !== b.totalPoints) {
    return a.totalPoints - b.totalPoints;
  }

  if (hasTotalCredits(a) !== hasTotalCredits(b)) {
    return hasTotalCredits(a) ? -1 : 1;
  }

  if (hasTotalCredits(a) && hasTotalCredits(b)) {
    return a.totalCredits - b.totalCredits;
  }

  return 0;
};

const isMinimumAdmissionTie = (entry: ScoreEntry, minimumEntry: ScoreEntry) => {
  if (entry.totalPoints !== minimumEntry.totalPoints) {
    return false;
  }

  if (hasTotalCredits(minimumEntry)) {
    return entry.totalCredits === minimumEntry.totalCredits;
  }

  return !hasTotalCredits(entry);
};

const STUDENT_IDENTITY_FILTERS: StudentIdentity[] = [
  '一般生',
  '低收入戶生',
  '中低收入戶生',
  '直系血親尊親屬支領失業給付者',
  '身心障礙生',
  '原住民生',
  '僑生',
  '蒙藏生',
  '政府派赴國外工作人員子女',
  '境外優秀科學技術人才子女',
  '退伍軍人',
];

const ScoreSkeleton = () => (
  <div aria-hidden="true" className="admission-skeleton motion-safe:animate-pulse">
    <div className="admission-skeleton-line" /><div className="admission-skeleton-title" /><div className="admission-skeleton-subtitle" />
    <div className="admission-skeleton-score" />
    <div className="admission-skeleton-grades">{[0,1,2,3,4,5].map(i=><span key={i} />)}</div>
    <div className="admission-skeleton-line" />
  </div>
);

const ScoreList: React.FC<ScoreListProps> = ({ entries, isLoading, favoriteIds = [], toggleFavorite, onRefresh, isRefreshing }) => {
  const years = useEntryYears();
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterStudentIdentity, setFilterStudentIdentity] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [groupBySchool, setGroupBySchool] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleRefresh = () => {
    if (cooldown === 0 && onRefresh) {
      onRefresh();
      setCooldown(20);
    }
  };

  const clearFilters = () => {
    setFilterRegion('All');
    setFilterYear('All');
    setFilterStudentIdentity('All');
    setFilterSchool('');
    setGroupBySchool(false);
    setCurrentPage(1);
  };

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');

  const listTopRef = React.useRef<HTMLDivElement>(null);

  const minimumAdmissionEntryMap = React.useMemo(() => {
    const map = new Map<string, ScoreEntry>();
    entries.forEach(entry => {
      const key = `${entry.year}-${entry.school}`;
      const current = map.get(key);
      if (!current || compareMinimumAdmissionEntry(entry, current) < 0) {
        map.set(key, entry);
      }
    });
    return map;
  }, [entries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRegion, filterYear, filterStudentIdentity, filterSchool, itemsPerPage, groupBySchool]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (listTopRef.current) {
      const yOffset = -20;
      const y = listTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchRegion = filterRegion === 'All' || entry.region === filterRegion;
    const matchYear = filterYear === 'All' || entry.year === Number(filterYear);
    const matchStudentIdentity =
      filterStudentIdentity === 'All' ||
      (entry.studentIdentity ?? '一般生') === filterStudentIdentity;
    const matchSchool = entry.school.includes(filterSchool);
    return matchRegion && matchYear && matchStudentIdentity && matchSchool;
  });

  const sortedEntries = [...filteredEntries];

  if (groupBySchool) {
    sortedEntries.sort((a, b) => {
      if (a.school !== b.school) {
        return a.school.localeCompare(b.school, 'zh-TW');
      }
      return b.timestamp - a.timestamp;
    });
  }

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleShare = async (entry: ScoreEntry) => {
    const shareText = `【會考落點分享】\n🏫 ${entry.school} (${entry.department})\n📅 ${entry.year}年 | 📍 ${entry.region}\n👤 考生身分：${entry.studentIdentity ?? '一般生'}\n🏆 總積分：${entry.totalPoints}\n\n📝 科目成績：\n國${entry.scores.chinese} 英${entry.scores.english} 數${entry.scores.math} 自${entry.scores.nature} 社${entry.scores.social} 作${entry.scores.writing}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const buildReportMailto = (entry: ScoreEntry) => {
    const subject = `資料錯誤回報：${entry.year}年 ${entry.school} ${entry.department}`;
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const body = [
      '您好，我想回報以下資料可能有誤：',
      '',
      '請在此描述錯誤內容：',
      '- ',
      '',
      '--- 資料內容 ---',
      `資料 ID：${entry.id}`,
      `年份：${entry.year} 年`,
      `區域：${entry.region}`,
      `學校：${entry.school}`,
      `科系/班別：${entry.department}`,
      `考生身分：${entry.studentIdentity ?? '一般生'}`,
      `總積分：${entry.totalPoints}`,
      `總積點：${entry.totalCredits ?? '未提供'}`,
      `國文：${entry.scores.chinese}`,
      `英文：${entry.scores.english}`,
      `數學：${entry.scores.math}`,
      `自然：${entry.scores.nature}`,
      `社會：${entry.scores.social}`,
      `作文：${entry.scores.writing}級`,
      `心得備註：${entry.notes || '無'}`,
      pageUrl ? `頁面：${pageUrl}` : '',
      '',
      '感謝協助修正資料。',
    ].filter(Boolean).join('\n');

    return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6" ref={listTopRef}>
      {/* Filter Area */}
      <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-50 via-sky-50/70 to-transparent" />

        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-100 bg-white/78 p-4 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
                <Filter className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-black tracking-tight text-slate-800 sm:text-xl">最新分享</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.16)]" />
                    {!isLoading ? `找到 ${filteredEntries.length} 筆資料` : '載入中...'}
                  </span>
                  {(filterRegion !== 'All' || filterYear !== 'All' || filterStudentIdentity !== 'All' || filterSchool || groupBySchool) && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">已套用篩選</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {(filterRegion !== 'All' || filterYear !== 'All' || filterStudentIdentity !== 'All' || filterSchool || groupBySchool) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95 sm:flex-none"
                >
                  <RotateCcw className="h-4 w-4" />
                  清除
                </button>
              )}

              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || cooldown > 0}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-indigo-100 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  title="重新整理"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : 'transition-transform duration-500 group-hover:rotate-180'}`} />
                  <span>{cooldown > 0 ? `${cooldown}s` : '重新載入'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="group relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
              <input
                type="text"
                placeholder="搜尋學校名稱"
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-bold text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-semibold hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="h-14 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-black text-slate-700 shadow-sm outline-none transition-all hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="All">所有年份</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={() => setIsRegionModalOpen(true)}
                className="flex h-14 w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-black text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-700 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 active:scale-[0.98]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{filterRegion === 'All' ? '所有區域' : filterRegion}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              <div className="relative">
                <UsersRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterStudentIdentity}
                  onChange={(e) => setFilterStudentIdentity(e.target.value)}
                  className="h-14 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-black text-slate-700 shadow-sm outline-none transition-all hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="All">所有身分</option>
                  {STUDENT_IDENTITY_FILTERS.map(identity => (
                    <option key={identity} value={identity}>{identity}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <label className={`flex h-14 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 text-sm font-black shadow-sm transition-all active:scale-[0.98] ${
                groupBySchool
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700'
              }`}>
                <span className="flex min-w-0 items-center gap-2">
                  <School className={`h-4 w-4 shrink-0 ${groupBySchool ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">同校分組</span>
                </span>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${groupBySchool ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <input
                    type="checkbox"
                    checked={groupBySchool}
                    onChange={(e) => setGroupBySchool(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <p role="status" className="sr-only">正在載入錄取資料，請稍候。</p>}
      {/* Card Grid */}
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-6 md:grid-cols-[repeat(auto-fit,minmax(360px,1fr))] lg:gap-8">
        {isLoading ? (
          <>
            <ScoreSkeleton />
            <ScoreSkeleton />
            <ScoreSkeleton />
          </>
        ) : filteredEntries.length === 0 ? (
          <div className="relative col-span-full mx-1 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)] sm:mx-0 sm:px-10">
            <div className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full bg-indigo-100/70 blur-[70px]"></div>
            <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-fuchsia-100/70 blur-[70px]"></div>
            <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(79,70,229,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,.8)_1px,transparent_1px)] [background-size:32px_32px]"></div>

            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
              <div className="relative mb-7">
                <div className="absolute inset-0 scale-150 rounded-full bg-indigo-200/50 blur-2xl"></div>

                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 text-indigo-500 shadow-xl shadow-indigo-100/70">
                  <Search className="h-9 w-9" />
                </div>

                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>

              <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">No results found</span>
              <h3 className="text-2xl font-black tracking-tight text-slate-800">找不到符合的資料</h3>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                目前的搜尋條件沒有相符結果，試著更換年份、區域，<br className="hidden sm:block" />
                或使用其他學校關鍵字搜尋。
              </p>

              {(filterRegion !== 'All' || filterYear !== 'All' || filterStudentIdentity !== 'All' || filterSchool || groupBySchool) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="group mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
                  清除所有篩選
                </button>
              )}
            </div>
          </div>
        ) : (
          paginatedEntries.map((entry) => (
            <AdmissionCard key={entry.id} entry={entry}
              isFavorite={favoriteIds.includes(entry.id)}
              isMinimum={(() => {
                const minimumEntry = minimumAdmissionEntryMap.get(`${entry.year}-${entry.school}`);
                return !!minimumEntry && isMinimumAdmissionTie(entry, minimumEntry);
              })()}
              copied={copiedId === entry.id}
              onFavorite={toggleFavorite ? () => toggleFavorite(entry.id) : undefined}
              onCopy={() => handleShare(entry)}
              reportHref={buildReportMailto(entry)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredEntries.length > 0 && !isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-8 mx-auto w-full max-w-lg sm:max-w-none">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">每頁顯示</span>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl py-1.5 px-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm cursor-pointer"
            >
              <option value={24}>24 筆</option>
              <option value={60}>60 筆</option>
              <option value={100}>100 筆</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-sm font-bold text-slate-600 px-3 flex items-center gap-2 min-w-[5rem] justify-center bg-white border border-slate-200 rounded-xl py-2 shadow-sm">
              <span>{currentPage}</span>
              <span className="text-slate-300">/</span>
              <span>{totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Region Selection Modal */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsRegionModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={regionSearchTerm}
                  onChange={(e) => setRegionSearchTerm(e.target.value)}
                  placeholder="搜尋區域..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 font-medium"
              >
                取消
              </button>
            </div>

            <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200 flex-1">
              <button
                type="button"
                onClick={() => {
                  setFilterRegion('All');
                  setIsRegionModalOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="group-hover:text-indigo-700">所有區域</span>
                </div>
              </button>

              {REGIONS.filter(r => r.includes(regionSearchTerm)).length > 0 ? (
                REGIONS.filter(r => r.includes(regionSearchTerm)).map(region => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      setFilterRegion(region);
                      setIsRegionModalOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="group-hover:text-indigo-700">{region}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-12 text-slate-400 text-sm flex flex-col items-center gap-3 text-center">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p>找不到符合「{regionSearchTerm}」的區域</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreList;
