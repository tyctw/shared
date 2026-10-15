import StrategyArticlePage from './components/StrategyArticlePage';
import LegalContentPage from './components/LegalContentPage';
import { LEGAL_CONTACT_EMAIL } from './data/legalContent';
import { useEntryYears } from './hooks/useEntryYears';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ScoreForm from './components/ScoreForm';
import ScoreList from './components/ScoreList';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import AdmissionsInsights from './components/AdmissionsInsights';
import ScoreCompare from './components/ScoreCompare';
import ShareModal from './components/ShareModal';
import GreetingModal from './components/GreetingModal';
import MobileMenu from './components/MobileMenu';
import { ScoreEntry } from './types';
import { REGIONS } from './constants';
import { fetchEntries, submitEntry, logUserAction } from './services/apiService';
import { getEntryLockMessage, isEntryYearLocked } from './utils/entryOpenLock';
import { GraduationCap, BarChart3, PlusCircle, BookOpen, CloudOff, Info, Menu, X, ExternalLink, Calculator, Compass, Sparkles, RefreshCw, Home, ShieldAlert, Check, Heart, Shield, Share2, ArrowRight, MapPin, Search, Table2, ChevronLeft, ChevronDown, Instagram, AtSign, MailWarning } from 'lucide-react';

// New Custom Loader Component
const AppLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
     <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute inset-4 rounded-[2rem] border-2 border-indigo-100 rotate-12 animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-4 rounded-[2rem] border-2 border-purple-100 -rotate-12 animate-[spin_4s_linear_infinite_reverse]"></div>
        
        <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200/50 flex items-center justify-center z-10 hover:scale-105 transition-transform">
            <GraduationCap className="w-8 h-8 text-white animate-[bounce_2s_infinite]" />
        </div>
     </div>
     <div className="flex flex-col items-center gap-4">
        <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            正在載入落點數據
        </h3>
        <div className="flex gap-2.5">
           <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
           <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
           <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
     </div>
  </div>
);

import { PAGE_ROUTES, resolvePageRoute, resolveInitialPageRoute, pageHref, getPageMetadata, type ActiveTab } from './utils/pageRoutes';
const CONTACT_EMAIL = LEGAL_CONTACT_EMAIL;
type MinimumSortOption = 'region' | 'pointsAsc' | 'pointsDesc' | 'creditsAsc' | 'creditsDesc' | 'yearDesc' | 'yearAsc' | 'countDesc' | 'schoolAsc';

const hasTotalCredits = (entry: Pick<ScoreEntry, 'totalCredits'>) => typeof entry.totalCredits === 'number';

const compareMinimumAdmissionEntry = (a: ScoreEntry, b: ScoreEntry) => {
  if (a.totalPoints !== b.totalPoints) {
    return a.totalPoints - b.totalPoints;
  }

  if (hasTotalCredits(a) && hasTotalCredits(b) && a.totalCredits !== b.totalCredits) {
    return a.totalCredits - b.totalCredits;
  }

  return 0;
};

const DataStreamLoader = () => (
  <div className="flex min-h-[54vh] flex-col items-center justify-center px-4 py-14 animate-in fade-in duration-700">
    <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 px-6 py-8 text-center shadow-[0_28px_90px_-46px_rgba(79,70,229,0.65)] ring-1 ring-indigo-100/70 backdrop-blur-xl sm:px-10">
      <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-indigo-200/60 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-rose-200/55 blur-3xl"></div>
      <div className="data-loader-grid pointer-events-none absolute inset-0 opacity-70"></div>

      <div className="relative mx-auto mb-8 h-44 w-52">
        <div className="data-card-loader absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/80 bg-white p-4 text-left shadow-2xl shadow-indigo-200/50">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="h-2 w-14 rounded-full bg-indigo-200"></div>
              <div className="mt-2 h-3 w-24 rounded-full bg-slate-200"></div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['國', '英', '數', '自', '社', '寫'].map((label, index) => (
              <div
                key={label}
                className="data-score-cell flex aspect-square flex-col items-center justify-center rounded-xl border border-indigo-50 bg-indigo-50/70"
                style={{ animationDelay: `${index * 0.14}s` }}
              >
                <span className="text-[10px] font-black text-indigo-400">{label}</span>
                <span className="mt-1 h-2 w-5 rounded-full bg-indigo-200"></span>
              </div>
            ))}
          </div>
        </div>

        <div className="data-mini-card data-mini-card-a absolute left-0 top-4 rounded-2xl border border-emerald-100 bg-white/90 px-3 py-2 shadow-lg shadow-emerald-100/70">
          <div className="h-2 w-10 rounded-full bg-emerald-300"></div>
          <div className="mt-2 h-2 w-16 rounded-full bg-slate-200"></div>
        </div>

        <div className="data-mini-card data-mini-card-b absolute bottom-2 right-0 rounded-2xl border border-rose-100 bg-white/90 px-3 py-2 shadow-lg shadow-rose-100/70">
          <div className="h-2 w-12 rounded-full bg-rose-300"></div>
          <div className="mt-2 h-2 w-14 rounded-full bg-slate-200"></div>
        </div>

        <div className="data-mini-card data-mini-card-c absolute right-6 top-0 rounded-2xl border border-violet-100 bg-white/90 px-3 py-2 shadow-lg shadow-violet-100/70">
          <div className="h-2 w-8 rounded-full bg-violet-300"></div>
          <div className="mt-2 h-2 w-12 rounded-full bg-slate-200"></div>
        </div>

        <Sparkles className="data-loader-spark absolute right-10 top-16 h-5 w-5 text-amber-400" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-3 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">
          Syncing data
        </span>
        <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          正在讀取落點資料
        </h3>
        <p className="mt-3 max-w-xs text-sm font-bold leading-6 text-slate-500">
          整理最新分享紀錄與統計資訊，馬上就好。
        </p>

        <div className="mt-7 w-full max-w-xs">
          <div className="data-loader-track h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="data-loader-bar h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500"></div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="data-loader-pulse"></span>
            <span className="data-loader-pulse" style={{ animationDelay: '0.18s' }}></span>
            <span className="data-loader-pulse" style={{ animationDelay: '0.36s' }}></span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SystemInitializingScreen = () => (
  <div className="system-boot relative isolate flex min-h-[58vh] items-center justify-center overflow-hidden rounded-[2rem] bg-[#07111f] px-5 py-10 text-slate-100 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.9)] sm:px-10">
    <div className="system-boot-grid absolute inset-0 opacity-70" />
    <div className="system-boot-orb system-boot-orb-one" />
    <div className="system-boot-orb system-boot-orb-two" />
    <div className="system-boot-scan absolute inset-x-0 h-px" />

    <div className="relative z-10 w-full max-w-xl">
      <div className="mb-7 flex items-center justify-between text-[10px] font-black tracking-[0.22em] text-cyan-200/70">
        <span>CAP / DATA TERMINAL</span>
        <span className="system-boot-online inline-flex items-center gap-2"><i />ONLINE</span>
      </div>

      <div className="rounded-[1.75rem] border border-cyan-200/15 bg-slate-950/45 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-5">
          <div className="system-boot-core relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-cyan-200/40 bg-cyan-300/10">
            <div className="absolute inset-2 rounded-xl border border-cyan-100/25" />
            <GraduationCap className="relative h-7 w-7 text-cyan-100" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.28em] text-cyan-300">SYSTEM INITIALIZING</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">正在建立資料連線</h2>
            <p className="mt-2 text-sm font-medium text-slate-400">正在同步匿名錄取資料與平台設定。</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {[
            ['驗證安全連線', 'SECURE CHANNEL', 'done'],
            ['載入資料索引', 'INDEXING RECORDS', 'active'],
            ['準備分析介面', 'RENDER QUEUED', 'wait'],
          ].map(([label, state, status]) => (
            <div key={state} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] px-3 py-3">
              <span className={`system-boot-status system-boot-status-${status}`} />
              <span className="flex-1 text-sm font-bold text-slate-200">{label}</span>
              <span className="text-[9px] font-black tracking-[0.18em] text-slate-500">{state}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-2 flex justify-between text-[10px] font-black tracking-[0.18em] text-cyan-200/80">
            <span>LOADING MODULES</span><span>SYNCING</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="system-boot-progress h-full rounded-full" /></div>
        </div>
      </div>
      <p className="mt-5 text-center text-[10px] font-bold tracking-[0.16em] text-slate-500">PLEASE WAIT — DO NOT REFRESH</p>
    </div>
  </div>
);

const SystemBootOverlay = ({ ready, onComplete }: { ready: boolean; onComplete: () => void }) => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (ready) {
      setProgress(100);
      const completionTimer = window.setTimeout(onComplete, 180);
      return () => window.clearTimeout(completionTimer);
    }

    const timer = window.setInterval(() => {
      setProgress(currentProgress => Math.min(86, currentProgress + Math.max(1, Math.round((86 - currentProgress) / 7))));
    }, 110);
    return () => window.clearInterval(timer);
  }, [ready, onComplete]);

  const stage = progress < 32 ? 'CONNECTING' : progress < 72 ? 'SYNCHRONIZING' : 'READYING INTERFACE';
  const completeSteps = [progress >= 18, progress >= 52, progress >= 84];

  return (
    <div className="system-boot-overlay fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-[#050b16] p-5 text-white">
      <div className="system-boot-stars absolute inset-0" />
      <div className="system-boot-radar absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="system-boot-beam absolute left-1/2 top-0 h-full w-px -translate-x-1/2" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center justify-between text-[10px] font-black tracking-[0.24em] text-cyan-100/65">
          <span>CAP SCORE / v1.0</span>
          <span className="system-boot-online inline-flex items-center gap-2"><i />LIVE</span>
        </div>

        <div className="relative mx-auto grid h-52 w-52 place-items-center">
          <div className="system-boot-ring system-boot-ring-outer absolute inset-0 rounded-full" />
          <div className="system-boot-ring system-boot-ring-inner absolute inset-5 rounded-full" />
          <div className="system-boot-ring-dash absolute inset-2 rounded-full" />
          <div className="system-boot-emblem relative grid h-28 w-28 place-items-center rounded-[2rem] border border-cyan-100/30 bg-cyan-300/[0.08] shadow-[0_0_55px_rgba(34,211,238,0.24)] backdrop-blur-sm">
            <GraduationCap className="h-11 w-11 text-cyan-50" strokeWidth={1.4} />
          </div>
        </div>

        <div className="mt-7 text-center">
          <p className="text-[11px] font-black tracking-[0.34em] text-cyan-300">SYSTEM INITIALIZING</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white">資料平台啟動中</h1>
          <p className="mt-3 text-xs font-bold tracking-[0.16em] text-slate-400">{stage}</p>
        </div>

        <div className="mt-9 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-end justify-between">
            <span className="text-[10px] font-black tracking-[0.18em] text-slate-400">SYSTEM LOAD</span>
            <span className="text-3xl font-black tabular-nums text-cyan-100">{String(progress).padStart(2, '0')}<small className="ml-0.5 text-sm text-cyan-400">%</small></span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10 p-[2px]">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 shadow-[0_0_16px_rgba(34,211,238,.8)] transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {['CONNECT', 'VERIFY', 'LAUNCH'].map((label, index) => (
              <div key={label} className={`rounded-xl border px-2 py-2 text-center text-[9px] font-black tracking-[0.12em] ${completeSteps[index] ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : 'border-white/5 bg-white/[0.025] text-slate-600'}`}>
                <span className="mr-1">{completeSteps[index] ? '✓' : '○'}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsInsightLoader = () => (
  <div className="flex min-h-[46vh] flex-col items-center justify-center px-4 py-10 animate-in fade-in duration-700">
    <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-[0_28px_90px_-48px_rgba(79,70,229,0.68)] ring-1 ring-indigo-100/70 backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-sky-200/55 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-violet-200/55 blur-3xl"></div>
      <div className="stats-loader-grid pointer-events-none absolute inset-0"></div>

      <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-center">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-3 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">
            Building charts
          </span>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            正在生成統計圖表
          </h3>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
            分析各區分享資料、分數分布與趨勢摘要。
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="stats-loader-badge flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-xl shadow-indigo-200">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="h-2 w-24 rounded-full bg-slate-200"></div>
              <div className="mt-2 h-2 w-16 rounded-full bg-indigo-200"></div>
            </div>
          </div>
        </div>

        <div className="stats-chart-panel relative min-h-48 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="h-2 w-20 rounded-full bg-slate-200"></div>
              <div className="mt-2 h-2 w-12 rounded-full bg-indigo-200"></div>
            </div>
            <div className="stats-loader-ring flex h-14 w-14 items-center justify-center rounded-full">
              <span className="h-8 w-8 rounded-full bg-white shadow-inner"></span>
            </div>
          </div>

          <div className="stats-bar-wrap flex h-28 items-end gap-2">
            {[62, 38, 76, 52, 88, 45, 70].map((height, index) => (
              <span
                key={height + index}
                className="stats-loader-bar flex-1 rounded-t-xl bg-gradient-to-t from-indigo-500 to-sky-300"
                style={{ height: `${height}%`, animationDelay: `${index * 0.12}s` }}
              ></span>
            ))}
          </div>

          <div className="stats-scan-line pointer-events-none absolute left-5 right-5"></div>
        </div>
      </div>
    </div>
  </div>
);

const MinimumScoresPage = ({ entries }: { entries: ScoreEntry[] }) => {
  const availableYears = useEntryYears();
  const [selectedYear, setSelectedYear] = React.useState(String(availableYears[0]));
  const [selectedRegion, setSelectedRegion] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOption, setSortOption] = React.useState<MinimumSortOption>('region');
  const [isRegionModalOpen, setIsRegionModalOpen] = React.useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = React.useState('');
  const [selectedMinimumEntry, setSelectedMinimumEntry] = React.useState<(ScoreEntry & { count: number }) | null>(null);
  const [isMinimumNoticeOpen, setIsMinimumNoticeOpen] = React.useState(true);

  const generalEntries = React.useMemo(
    () => entries.filter(entry => (entry.studentIdentity ?? '一般生') === '一般生'),
    [entries]
  );

  const years = React.useMemo(
    () => Array.from(new Set([...availableYears.map(String), ...generalEntries.map(entry => String(entry.year))]))
      .sort((a, b) => Number(b) - Number(a)),
    [generalEntries, availableYears]
  );

  const regions = React.useMemo(
    () => Array.from(new Set(generalEntries
      .filter(entry => selectedYear === 'all' || String(entry.year) === selectedYear)
      .map(entry => entry.region)))
      .sort((a, b) => String(a).localeCompare(String(b), 'zh-TW')),
    [generalEntries, selectedYear]
  );

  const regionModalOptions = React.useMemo(
    () => REGIONS.filter(region => region.includes(regionSearchTerm)),
    [regionSearchTerm]
  );

  const filteredEntries = React.useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return generalEntries.filter(entry => {
      const matchesYear = selectedYear === 'all' || String(entry.year) === selectedYear;
      const matchesRegion = selectedRegion === 'all' || entry.region === selectedRegion;
      const matchesSearch = !keyword || [
        entry.region,
        entry.school,
        entry.department,
        String(entry.year),
      ].some(value => String(value ?? '').toLowerCase().includes(keyword));

      return matchesYear && matchesRegion && matchesSearch;
    });
  }, [generalEntries, searchTerm, selectedRegion, selectedYear]);

  const rows = React.useMemo(() => {
    const map = new Map<string, { entry: ScoreEntry; count: number }>();

    filteredEntries.forEach(entry => {
      const key = `${entry.year}__${entry.region}__${entry.school}__${entry.department}`;
      const current = map.get(key);

      if (!current) {
        map.set(key, { entry, count: 1 });
        return;
      }

      current.count += 1;

      if (compareMinimumAdmissionEntry(entry, current.entry) < 0) {
        current.entry = entry;
        return;
      }
    });

    const compareByDefault = (a: ScoreEntry & { count: number }, b: ScoreEntry & { count: number }) => {
      const regionCompare = String(a.region).localeCompare(String(b.region), 'zh-TW');
      if (regionCompare !== 0) return regionCompare;
      return (
        compareMinimumAdmissionEntry(a, b) ||
        a.school.localeCompare(b.school, 'zh-TW') ||
        a.department.localeCompare(b.department, 'zh-TW') ||
        Number(b.year) - Number(a.year)
      );
    };

    const compareCredits = (a: ScoreEntry & { count: number }, b: ScoreEntry & { count: number }) => {
      const aCredits = a.totalCredits ?? Number.POSITIVE_INFINITY;
      const bCredits = b.totalCredits ?? Number.POSITIVE_INFINITY;
      return aCredits - bCredits;
    };

    return Array.from(map.values())
      .map(({ entry, count }) => ({ ...entry, count }))
      .sort((a, b) => {
        const fallback = compareByDefault(a, b);

        switch (sortOption) {
          case 'pointsAsc':
            return a.totalPoints - b.totalPoints || fallback;
          case 'pointsDesc':
            return b.totalPoints - a.totalPoints || fallback;
          case 'creditsAsc':
            return compareCredits(a, b) || fallback;
          case 'creditsDesc':
            return compareCredits(b, a) || fallback;
          case 'yearDesc':
            return Number(b.year) - Number(a.year) || fallback;
          case 'yearAsc':
            return Number(a.year) - Number(b.year) || fallback;
          case 'countDesc':
            return b.count - a.count || fallback;
          case 'schoolAsc':
            return a.school.localeCompare(b.school, 'zh-TW') || fallback;
          case 'region':
          default:
            return fallback;
        }
      });
  }, [filteredEntries, sortOption]);

  const regionCount = new Set(rows.map(row => row.region)).size;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#11132b] p-6 text-white shadow-[0_28px_80px_-45px_rgba(15,23,42,0.6)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-[70px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-[80px]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-bold text-indigo-100">
              <Table2 className="h-4 w-4 text-emerald-300" />
              各區學校最低錄取資料
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">最低錄取分數總表</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-300">
              僅統整一般生匿名分享資料，列出同一區域、同一學校中目前蒐集到的最低總積分紀錄。此表並不保證為該校真正最低錄取分數，請以官方簡章與正式公告為準。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-300">區域</span>
              <strong className="mt-1 block text-2xl font-black">{regionCount}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-300">學校</span>
              <strong className="mt-1 block text-2xl font-black">{rows.length}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-300">資料</span>
              <strong className="mt-1 block text-2xl font-black">{filteredEntries.length}</strong>
            </div>
          </div>
        </div>
      </section>

      {isMinimumNoticeOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
            onClick={() => setIsMinimumNoticeOpen(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-amber-50 p-5 ring-1 ring-amber-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Important notice</p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">請先了解資料限制</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm font-bold leading-7 text-slate-600">
                「最低錄取分數總表」只統整目前平台蒐集到的匿名一般生分享資料，顯示的是目前資料中的最低紀錄。
              </p>
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-black leading-6 text-rose-600 ring-1 ring-rose-100">
                這不代表該校實際或官方最低錄取分數，也不保證所有錄取資料都已被收錄。
              </div>
              <p className="text-xs font-bold leading-6 text-slate-500">
                志願選填仍請以當年度官方簡章、招生名額、超額比序規則與學校正式公告為準。
              </p>

              <button
                type="button"
                onClick={() => setIsMinimumNoticeOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:bg-indigo-600 active:scale-[0.98]"
              >
                我了解，繼續查看
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[150px_190px_190px_1fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">年份</span>
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setSelectedRegion('all');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              {years.map(year => (
                <option key={year} value={year}>{year} 年</option>
              ))}
              <option value="all">所有年份</option>
            </select>
          </label>

          <div className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">區域</span>
            <button
              type="button"
              onClick={() => {
                setRegionSearchTerm('');
                setIsRegionModalOpen(true);
              }}
              className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-bold text-slate-700 outline-none transition-all hover:border-indigo-200 hover:bg-white focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                <span className="truncate">{selectedRegion === 'all' ? '所有區域' : selectedRegion}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">排序</span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as MinimumSortOption)}
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                <option value="region">區域排序</option>
                <option value="pointsAsc">總積分低到高</option>
                <option value="pointsDesc">總積分高到低</option>
                <option value="creditsAsc">總積點低到高</option>
                <option value="creditsDesc">總積點高到低</option>
                <option value="yearDesc">年份新到舊</option>
                <option value="yearAsc">年份舊到新</option>
                <option value="countDesc">資料筆數多到少</option>
                <option value="schoolAsc">學校名稱排序</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">搜尋</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="搜尋學校、科系或區域"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_60px_-38px_rgba(15,23,42,0.35)]">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CloudOff className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-black text-slate-800">尚無可統整資料</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">目前篩選條件下沒有一般生錄取分享資料可計算最低分數。</p>
          </div>
        ) : (
          <>
          <div className="grid gap-3 p-3 md:hidden">
            {rows.map(row => (
              <article
                key={`${row.year}-${row.region}-${row.school}-${row.department}-mobile`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMinimumEntry(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedMinimumEntry(row);
                  }
                }}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 p-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600">
                        {row.region}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                        {row.year} 年
                      </span>
                    </div>
                    <h3 className="break-words text-base font-black leading-6 text-slate-900">{row.school}</h3>
                    <p className="mt-1 break-words text-sm font-bold text-slate-500">{row.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4">
                  <div className="rounded-2xl bg-indigo-50 p-3 ring-1 ring-indigo-100">
                    <span className="block text-[10px] font-black text-indigo-500">總積分</span>
                    <strong className="mt-1 block font-mono text-2xl font-black leading-none text-indigo-700">{row.totalPoints}</strong>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                    <span className="block text-[10px] font-black text-amber-500">總積點</span>
                    <strong className="mt-1 block font-mono text-2xl font-black leading-none text-amber-600">{row.totalCredits ?? '-'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-black text-slate-500">
                  <span>同校同科一般生資料</span>
                  <span>{row.count} 筆・點擊查看</span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[820px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <th className="px-5 py-4">區域</th>
                  <th className="px-5 py-4">學校</th>
                  <th className="px-5 py-4">最低總積分</th>
                  <th className="px-5 py-4">總積點</th>
                  <th className="px-5 py-4">年度</th>
                  <th className="px-5 py-4">科系/班別</th>
                  <th className="px-5 py-4">筆數</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(row => (
                  <tr
                    key={`${row.year}-${row.region}-${row.school}-${row.department}`}
                    tabIndex={0}
                    onClick={() => setSelectedMinimumEntry(row)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedMinimumEntry(row);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-indigo-50/40 focus:bg-indigo-50/60 focus:outline-none"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-indigo-600">{row.region}</td>
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-900">{row.school}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex min-w-16 justify-center rounded-2xl bg-indigo-50 px-3 py-2 font-mono text-lg font-black text-indigo-700 ring-1 ring-indigo-100">
                        {row.totalPoints}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-mono font-black text-amber-600">{row.totalCredits ?? '-'}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-600">{row.year} 年</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.department}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-slate-500">{row.count} 筆</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {selectedMinimumEntry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
            onClick={() => setSelectedMinimumEntry(null)}
          />

          <div className="relative max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600">
                    {selectedMinimumEntry.region}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                    {selectedMinimumEntry.year} 年
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                    一般生
                  </span>
                </div>
                <h3 className="break-words text-xl font-black leading-7 text-slate-900">
                  {selectedMinimumEntry.school}
                </h3>
                <p className="mt-1 break-words text-sm font-bold text-slate-500">
                  {selectedMinimumEntry.department}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMinimumEntry(null)}
                className="shrink-0 rounded-2xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-100 transition-colors hover:text-slate-700"
                aria-label="關閉詳細資料"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(86vh-120px)] overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                  <span className="block text-xs font-black text-indigo-500">總積分</span>
                  <strong className="mt-1 block font-mono text-3xl font-black leading-none text-indigo-700">
                    {selectedMinimumEntry.totalPoints}
                  </strong>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                  <span className="block text-xs font-black text-amber-500">總積點</span>
                  <strong className="mt-1 block font-mono text-3xl font-black leading-none text-amber-600">
                    {selectedMinimumEntry.totalCredits ?? '-'}
                  </strong>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[
                  ['國文', selectedMinimumEntry.scores.chinese],
                  ['英文', selectedMinimumEntry.scores.english],
                  ['數學', selectedMinimumEntry.scores.math],
                  ['自然', selectedMinimumEntry.scores.nature],
                  ['社會', selectedMinimumEntry.scores.social],
                  ['作文', `${selectedMinimumEntry.scores.writing}級`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                    <span className="block text-[10px] font-black text-slate-400">{label}</span>
                    <strong className="mt-1 block font-mono text-lg font-black text-slate-800">{value}</strong>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <span className="block text-xs font-black text-slate-400">同校同科一般生資料筆數</span>
                  <strong className="mt-1 block text-lg font-black text-slate-700">
                    {selectedMinimumEntry.count} 筆
                  </strong>
                </div>
              </div>

              {selectedMinimumEntry.notes && (
                <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <span className="block text-xs font-black text-slate-400">補充說明</span>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-600">
                    {selectedMinimumEntry.notes}
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs font-bold leading-5 text-slate-400">
                此彈窗顯示的是目前篩選條件下，該校同科一般生資料中總積分最低的來源紀錄。
              </p>
            </div>
          </div>
        </div>
      )}

      {isRegionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsRegionModalOpen(false)}
          />

          <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={regionSearchTerm}
                  onChange={(event) => setRegionSearchTerm(event.target.value)}
                  placeholder="搜尋區域..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="shrink-0 rounded-xl p-2 font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                取消
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion('all');
                  setIsRegionModalOpen(false);
                }}
                className="group flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left font-medium text-slate-700 transition-colors last:border-0 hover:bg-indigo-50"
              >
                <span className="group-hover:text-indigo-700">所有區域</span>
                {selectedRegion === 'all' && <Check className="h-4 w-4 text-indigo-500" />}
              </button>

              {regionModalOptions.length > 0 ? (
                regionModalOptions.map(region => {
                  const hasData = regions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(region);
                        setIsRegionModalOpen(false);
                      }}
                      className="group flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left font-medium text-slate-700 transition-colors last:border-0 hover:bg-indigo-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="group-hover:text-indigo-700">{region}</span>
                        {!hasData && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">
                            無資料
                          </span>
                        )}
                      </span>
                      {selectedRegion === region && <Check className="h-4 w-4 text-indigo-500" />}
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-3 px-4 py-12 text-center text-sm text-slate-400">
                  <div className="rounded-full bg-slate-50 p-4">
                    <Search className="h-6 w-6 text-slate-300" />
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

const App: React.FC = () => {
  const initialRoute = useRef(resolveInitialPageRoute(window.location.pathname, window.location.hash));
  const [articleSlug, setArticleSlug] = useState(initialRoute.current.articleSlug);
  const availableYears = useEntryYears();
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialRoute.current.tab);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
      const saved = localStorage.getItem('cap_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [pendingNavigationTab, setPendingNavigationTab] = useState<ActiveTab | null>(null);
  const routeBase = useRef(initialRoute.current.base);
  const historyIndex = useRef(window.history.state?.pageIndex ?? 0);
  const navigationState = useRef({ activeTab, isFormDirty });
  navigationState.current = { activeTab, isFormDirty };
  const restoringHistory = useRef(false);
  const pendingHistory = useRef<{ delta: number; tab: ActiveTab } | null>(null);

  const cancelPendingNavigation = () => {
    pendingHistory.current = null;
    setPendingNavigationTab(null);
  };

  useEffect(() => {
    // Freeze the asset base before changing the URL, including subdirectory deployments.
    let baseElement = document.querySelector('base');
    if (!baseElement) {
      baseElement = document.createElement('base');
      document.head.prepend(baseElement);
    }
    baseElement.href = new URL(routeBase.current, window.location.origin).href;
    window.history.replaceState(
      { ...window.history.state, pageIndex: historyIndex.current }, '',
      pageHref(initialRoute.current.tab, routeBase.current, initialRoute.current.articleSlug) + window.location.search + (initialRoute.current.articleSlug && !resolvePageRoute(window.location.pathname).articleSlug ? '' : window.location.hash),
    );
    const onPopState = () => {
      if (restoringHistory.current) {
        restoringHistory.current = false;
        if (pendingHistory.current) setPendingNavigationTab(pendingHistory.current.tab);
        return;
      }
      const route = resolveInitialPageRoute(window.location.pathname, window.location.hash);
      const tab = route.tab;
      const nextIndex = window.history.state?.pageIndex ?? 0;
      const delta = nextIndex - historyIndex.current;
      const current = navigationState.current;
      if (current.activeTab === 'form' && tab !== 'form' && current.isFormDirty && delta !== 0) {
        pendingHistory.current = { delta, tab };
        restoringHistory.current = true;
        window.history.go(-delta);
        return;
      }
      historyIndex.current = nextIndex;
      setActiveTab(tab);
      setArticleSlug(route.articleSlug);
      setIsSidebarOpen(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const metadata = getPageMetadata(activeTab, articleSlug);
    document.title = `${metadata.title}｜會考錄取分享平台`;
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector)?.setAttribute('content', document.title);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector(selector)?.setAttribute('content', metadata.description);
    const url = new URL(pageHref(activeTab, routeBase.current, articleSlug), window.location.origin).href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', url);
  }, [activeTab, articleSlug]);


  useEffect(() => {
      localStorage.setItem('cap_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    let frame: number | null = null;
    const updateHeader = () => {
      const scrollY = window.scrollY;
      // Separate thresholds keep small scroll movements from repeatedly toggling the header.
      setIsHeaderCompact(current => current ? scrollY > 16 : scrollY > 48);
    };
    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        updateHeader();
      });
    };
    updateHeader();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const toggleFavorite = (id: string) => {
      setFavoriteIds(prev => 
          prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      );
  };

  // Extract data fetching logic to a reusable function
  const loadData = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setLoadError(null);
    if (isManualRefresh) {
        logUserAction('refresh_data', 'User Triggered');
    }

    try {
      const data = await fetchEntries();
      data.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(data);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '資料載入失敗，請稍後再試。';
      setLoadError(message);
      logUserAction('load_data_failed', message);
    }

    setIsLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    logUserAction('app_open', `Initial Load`);
    loadData();
  }, [loadData]);

  const performTabChange = (tab: typeof activeTab, nextArticleSlug?: string) => {
    const href = pageHref(tab, routeBase.current, nextArticleSlug);
    if (window.location.pathname !== href) {
      historyIndex.current += 1;
      window.history.pushState({ pageIndex: historyIndex.current }, '', href);
    }
    setActiveTab(tab);
    setArticleSlug(tab === 'insights' ? nextArticleSlug : undefined);
    setIsSidebarOpen(false);
    logUserAction('tab_change', tab);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleTabChange = (tab: typeof activeTab) => {
    if (activeTab === 'form' && tab !== 'form' && isFormDirty) {
      pendingHistory.current = null;
      setPendingNavigationTab(tab);
      return;
    }

    performTabChange(tab);
  };

  const handlePageLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, tab: ActiveTab) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    handleTabChange(tab);
  };

  const handleConfirmLeaveForm = () => {
    if (!pendingNavigationTab) return;
    setIsFormDirty(false);
    const nextTab = pendingNavigationTab;
    setPendingNavigationTab(null);
    if (pendingHistory.current) {
      const { delta } = pendingHistory.current;
      pendingHistory.current = null;
      navigationState.current.isFormDirty = false;
      window.history.go(delta);
    } else {
      performTabChange(nextTab);
    }
  };

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('cap_disclaimer_accepted', 'true');
    handleTabChange('list');
    logUserAction('accept_disclaimer', 'agreed');
  };

  const handleAddEntry = async (newEntry: Omit<ScoreEntry, 'id' | 'timestamp'>) => {
    if (isEntryYearLocked(newEntry.year)) {
      alert(getEntryLockMessage(newEntry.year));
      return;
    }

    const entry: ScoreEntry = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    const success = await submitEntry(entry);
    if (success) {
      setEntries(prev => [entry, ...prev]);
      setIsFormDirty(false);
      performTabChange('list');
      setShowThankYouModal(true);
      return;
    }

    alert("資料同步到雲端失敗，請檢查網路或 API 設定後再試一次。");
  };

  // Desktop Nav Button
  const NavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <a
      href={pageHref(id, routeBase.current)}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        handleTabChange(id);
      }}
      aria-current={activeTab === id ? 'page' : undefined}
      className={`relative px-4 py-2.5 rounded-full text-sm font-black transition-colors duration-200 flex items-center gap-2 group ${
        activeTab === id 
          ? 'bg-slate-100 text-slate-900 shadow-none border border-transparent'
          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
      }`}
    >
      <Icon className={`hidden w-4 h-4 ${activeTab === id ? 'text-indigo-600' : 'group-hover:text-indigo-500 text-slate-400'}`} />
      <span>{label}</span>
      {activeTab === id && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full md:opacity-100 opacity-0 hidden"></span>
      )}
    </a>
  );

  // Mobile Bottom Nav Button
  const MobileNavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <a
      href={pageHref(id, routeBase.current)}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        handleTabChange(id);
      }}
      aria-current={activeTab === id ? 'page' : undefined}
      className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
        activeTab === id ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
      }`}
    >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === id ? 'bg-indigo-50 translate-y-[-2px]' : ''}`}>
           <Icon className={`w-6 h-6 ${activeTab === id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        </div>
        <span className="text-[11px] font-bold">
            {label}
        </span>
        {activeTab === id && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
        )}
    </a>
  );

  return (
    <div className="font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden min-h-screen">
      <a
        href={`${pageHref(activeTab, routeBase.current, articleSlug)}#main-content`}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:text-white focus:shadow-xl"
      >
        跳到主要內容
      </a>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />

      {showThankYouModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={() => setShowThankYouModal(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="thank-you-title"
            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-300"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-7 text-center sm:p-9">
              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[28px] border-emerald-100/70" />
              <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-indigo-100/70 blur-3xl" />

              <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-200">
                <Check className="h-8 w-8" />
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Submitted</p>
                <h3 id="thank-you-title" className="mt-2 text-3xl font-black tracking-tight text-slate-900">感謝你的分享</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-500">
                  你的錄取資料已成功送出，會成為下一位考生判斷志願時很有用的參考。
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setShowThankYouModal(false);
                  handleTabChange('form');
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
              >
                再分享一筆
              </button>
              <button
                type="button"
                onClick={() => setShowThankYouModal(false)}
                className="rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
              >
                查看分享資料
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting Modal */}
      <GreetingModal />

      {pendingNavigationTab && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={cancelPendingNavigation}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-title"
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-200"
          >
            <div className="bg-amber-50 p-5 ring-1 ring-amber-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Unsaved changes</p>
                  <h3 id="unsaved-title" className="mt-1 text-xl font-black text-slate-900">資料尚未送出</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm font-bold leading-7 text-slate-600">
                你正在填寫「分享你的錄取數據」。如果現在離開，目前尚未送出的內容可能會遺失。
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={cancelPendingNavigation}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                >
                  繼續填寫
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeaveForm}
                  className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-[0.98]"
                >
                  放棄並離開
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFavoritesModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={() => setShowFavoritesModal(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="favorites-title"
            className="relative flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-slate-50 shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Favorites</p>
                  <h3 id="favorites-title" className="text-xl font-black text-slate-900">我的收藏</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFavoritesModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
                aria-label="關閉收藏"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <ScoreCompare
                entries={entries}
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        </div>
      )}

      <MobileMenu
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        favoriteCount={favoriteIds.length}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => {
          setIsSidebarOpen(false);
          handleTabChange(tab);
        }}
        onShare={() => {
          setIsSidebarOpen(false);
          setShowShareModal(true);
        }}
        onExternalLink={(name) => {
          logUserAction('external_link', name);
          setIsSidebarOpen(false);
        }}
      />

      {favoriteIds.length > 0 && activeTab !== 'favorites' && !isSidebarOpen && (
        <a
          href={pageHref('favorites', routeBase.current)}
          onClick={(event) => handlePageLinkClick(event, 'favorites')}
          className="favorites-fab"
          aria-label={`查看收藏，共 ${favoriteIds.length} 筆`}
          title={`查看 ${favoriteIds.length} 筆已收藏資料`}
        >
          <span className="favorites-fab-icon" aria-hidden="true">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <span className="favorites-fab-label">查看收藏</span>
          <span className="favorites-fab-count" aria-hidden="true">
            {favoriteIds.length > 99 ? '99+' : favoriteIds.length}
          </span>
        </a>
      )}

      {/* Floating Header (Top) */}
      <header className={`site-header fixed top-0 z-40 w-full ${isHeaderCompact ? 'site-header--compact' : ''} ${isHeaderCompact ? 'px-0 pt-0' : 'px-3 pt-3 sm:px-6 sm:pt-4'}`}>
        <div className={`site-header-shell mx-auto flex h-16 items-center justify-between border border-white/60 bg-white/80 px-4 backdrop-blur-2xl sm:h-20 sm:px-6 ${isHeaderCompact ? 'rounded-none shadow-[0_8px_30px_-18px_rgba(15,23,42,0.3)] sm:rounded-b-3xl' : 'rounded-3xl shadow-[0_4px_40px_-10px_rgba(0,0,0,0.1)]'}`}>
          
          {/* Left: Logo */}
          <button
            type="button"
            className="flex items-center gap-3 group flex-shrink-0 text-left"
            onClick={() => handleTabChange('list')}
            aria-label="回到瀏覽首頁"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-md group-hover:shadow-indigo-500/30 transition-shadow duration-200">
                <div className="absolute inset-[2px] bg-white rounded-[10px] sm:rounded-[14px] z-0"></div>
                <GraduationCap className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 " />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none mb-0.5">
                  會考錄取<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">分享平台</span>
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase origin-left scale-90">CAP Score Sharing</p>
            </div>
          </button>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          <nav aria-label="主要導覽" className="hidden md:flex items-center gap-1">
             <NavButton id="list" label="瀏覽" icon={BookOpen} />
             <NavButton id="minimums" label="最低" icon={Table2} />
             <NavButton id="stats" label="統計" icon={BarChart3} />
             <NavButton id="insights" label="策略" icon={Compass} />
             <div className="mx-1 h-6 w-px bg-slate-200"></div>
             <button
                 type="button"
                 onClick={() => setShowShareModal(true)}
                 aria-label="分享這個網站"
                 className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900"
             >
                 <Share2 className="hidden w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                 <span>分享</span>
             </button>
          </nav>

          {/* Right: Actions & Desktop Nav */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-none justify-end min-w-0">
            
            {/* PROMINENT SHARE CTA - Visible everywhere */}
            <a
                href={pageHref('form', routeBase.current)}
                onClick={(event) => handlePageLinkClick(event, 'form')}
                aria-current={activeTab === 'form' ? 'page' : undefined}
                className={`
                    relative group hidden items-center justify-center gap-1.5 sm:gap-2 md:flex
                    overflow-hidden rounded-full
                    px-4 py-2 sm:px-6 sm:py-2.5
                    font-black text-xs sm:text-sm tracking-wide transition-[background-color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                    ${activeTab === 'form' 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 border border-white/20'
                    }
                `}
            >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="relative z-10"><span className="hidden sm:inline">新增</span>分享</span>
            </a>

            {/* Menu Button */}
            <button 
                type="button"
                onClick={() => {
                  setIsSidebarOpen(true);
                }}
                aria-label="開啟更多功能"
                aria-expanded={isSidebarOpen}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 md:hidden"
                title="更多功能"
            >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <nav aria-label="手機主要導覽" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 animate-in slide-in-from-bottom-6 duration-500 md:hidden">
         <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] p-2 flex justify-between items-center max-w-sm mx-auto ring-1 ring-white/60">
            <MobileNavButton id="list" label="瀏覽" icon={BookOpen} />
            <MobileNavButton id="minimums" label="最低" icon={Table2} />
            <MobileNavButton id="stats" label="統計" icon={BarChart3} />
            <div className="w-px h-8 bg-slate-200/60 mx-1"></div>
            <MobileNavButton id="form" label="分享" icon={PlusCircle} />
         </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="max-w-5xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-28 sm:pb-16">
        
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
            
            {!isLoading && loadError && !['guide', 'insights', 'disclaimer', 'privacy'].includes(activeTab) && (
                 <div className="mb-8 overflow-hidden rounded-2xl border border-rose-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                      <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                          <CloudOff className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                          <h4 className="font-black text-slate-800 text-lg">資料載入失敗</h4>
                          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                              {loadError}
                          </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadData(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-[0.98]"
                      >
                        <RefreshCw className="h-4 w-4" />
                        重新載入
                      </button>
                    </div>
                 </div>
            )}

            {!isLoading && !loadError && entries.length === 0 && !['guide', 'minimums', 'stats', 'insights', 'disclaimer', 'privacy'].includes(activeTab) && (
                 <div className="mb-8 bg-white/50 backdrop-blur-md border border-amber-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                        <CloudOff className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">目前沒有資料</h4>
                        <p className="text-slate-500 text-sm mt-1">
                            資料庫目前沒有可顯示的錄取分享。<br className="hidden sm:block"/>
                            歡迎成為第一位分享者。
                        </p>
                    </div>
                 </div>
            )}

            {activeTab === 'guide' && (
                <Guide onNavigate={(tab) => handleTabChange(tab)} />
            )}

            {activeTab === 'insights' && (
                articleSlug ? <StrategyArticlePage slug={articleSlug} onBack={() => handleTabChange('insights')} onNavigate={handleTabChange} onOpenArticle={slug => performTabChange('insights', slug)} /> : <AdmissionsInsights onNavigate={handleTabChange} onOpenArticle={slug => performTabChange('insights', slug)} />
            )}

            {activeTab === 'list' && (
            <div className="space-y-12">
                 {/* Editorial data-driven hero */}
                 <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_80px_-45px_rgba(15,23,42,0.38)] ring-1 ring-slate-200/70 sm:rounded-[2.75rem]">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-sky-100/90 blur-[90px]"></div>
                        <div className="absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-indigo-100/80 blur-[100px]"></div>
                        <div className="absolute inset-0 opacity-[0.38] [background-image:linear-gradient(rgba(99,102,241,.11)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.11)_1px,transparent_1px)] [background-size:42px_42px]"></div>
                    </div>

                    <div className="relative grid min-h-[510px] items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.08fr_.92fr] lg:px-14 lg:py-16">
                        <div className="max-w-xl">
                            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-100 bg-indigo-50/85 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-md sm:text-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70"></span>
                                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                                </span>
                                <span>{availableYears[0]}會考</span>
                                <span className="h-3 w-px bg-indigo-200"></span>
                                <span className="text-slate-500">數據即時更新</span>
                            </div>

                            <h2 className="text-[2.65rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-900 sm:text-6xl lg:text-[4.25rem]">
                                精準落點，
                                <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-sky-500 to-amber-500 bg-clip-text text-transparent">
                                    預見你的未來
                                </span>
                            </h2>

                            <p className="mt-6 max-w-lg text-base font-medium leading-8 text-slate-600 sm:text-lg">
                                彙整全台各區真實錄取分數，透明公開。<br className="hidden sm:block" />
                                拒絕資訊焦慮，用數據規劃最適合的升學藍圖。
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => handleTabChange('form')}
                                    className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-6 py-4 text-base font-black text-white shadow-[0_16px_35px_-18px_rgba(15,23,42,0.65)] transition-all hover:-translate-y-1 hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-[0.98] sm:w-auto"
                                >
                                    <PlusCircle className="h-5 w-5 text-indigo-200 transition-transform duration-500 group-hover:rotate-90" />
                                    我要分享分數
                                    <ArrowRight className="h-4 w-4 text-white/55 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                                </button>
                                <button
                                    onClick={() => handleTabChange('guide')}
                                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98] sm:w-auto"
                                >
                                    <BookOpen className="h-5 w-5 text-indigo-500" />
                                    新手指南
                                </button>
                            </div>

                        </div>

                        <div className="relative hidden min-h-[390px] lg:block" aria-hidden="true">
                            <div className="absolute left-3 top-5 w-[88%] rotate-[-3deg] rounded-[2rem] border border-indigo-100 bg-white/60 p-5 opacity-80 shadow-sm backdrop-blur-xl"></div>
                            <div className="absolute right-0 top-0 w-[92%] rotate-2 rounded-[2rem] border border-sky-100 bg-white/70 p-5 opacity-90 shadow-sm backdrop-blur-xl"></div>

                            <div className="absolute inset-x-4 top-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            桃連區・114 年
                                        </div>
                                        <p className="text-lg font-black text-slate-900">理想高中錄取分享</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">匿名考生提供的真實經驗</p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600 ring-1 ring-emerald-100">
                                        已錄取
                                    </div>
                                </div>

                                <div className="mt-7 grid grid-cols-6 gap-2">
                                    {[
                                      ['國', 'A++'], ['英', 'A+'], ['數', 'A++'],
                                      ['自', 'A'], ['社', 'A+'], ['作', '5級']
                                    ].map(([subject, grade]) => (
                                      <div key={subject} className="rounded-xl border border-slate-200 bg-slate-50 px-1 py-3 text-center">
                                        <span className="block text-[9px] font-bold text-slate-400">{subject}</span>
                                        <strong className="mt-1 block text-xs font-black text-slate-800">{grade}</strong>
                                      </div>
                                    ))}
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                                        <span className="text-[10px] font-bold tracking-widest text-indigo-500">總積分</span>
                                        <strong className="mt-1 block text-3xl font-black text-indigo-700">31</strong>
                                    </div>
                                    <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                                        <span className="text-[10px] font-bold tracking-widest text-amber-500">總積點</span>
                                        <strong className="mt-1 block text-3xl font-black text-amber-600">33</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-2 bottom-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/90 p-3 pr-5 shadow-xl backdrop-blur-xl">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Data powered</p>
                                    <p className="text-sm font-black text-slate-800">真實資料，安心參考</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </section>

                <ScoreList
                    entries={entries}
                    isLoading={isLoading}
                    favoriteIds={favoriteIds}
                    toggleFavorite={toggleFavorite}
                    onRefresh={() => loadData(true)}
                    isRefreshing={isLoading}
                />
            </div>
            )}
            
            {activeTab === 'compare' && (
                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <ScoreCompare 
                        entries={entries}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                    />
                </div>
            )}

            {activeTab === 'favorites' && (
                <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-600 via-pink-600 to-violet-700 px-6 py-8 text-white shadow-[0_24px_70px_-35px_rgba(190,24,93,0.7)] sm:px-9 sm:py-10">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[32px] border-white/10" />
                        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                                    <Heart className="h-7 w-7 fill-white text-white" />
                                </div>
                                <p className="text-xs font-black tracking-[0.2em] text-rose-100">MY COLLECTION</p>
                                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">我的收藏</h2>
                                <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-rose-50 sm:text-base">
                                    將想比較的錄取資料留在這裡，回頭整理學校、科系與分數區間時更方便。
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
                                <span className="block text-3xl font-black">{favoriteIds.length}</span>
                                <span className="mt-1 block text-xs font-bold text-rose-100">筆已收藏資料</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-black tracking-[0.18em] text-rose-500">SAVED FOR COMPARISON</p>
                                <h3 className="mt-1 text-xl font-black text-slate-900">保留值得比較的落點</h3>
                            </div>
                            <button type="button" onClick={() => handleTabChange('list')} className="inline-flex items-center gap-2 self-start rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition-colors hover:bg-slate-900 hover:text-white sm:self-auto">
                                繼續瀏覽資料 <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                        <ScoreCompare
                            entries={entries}
                            favoriteIds={favoriteIds}
                            toggleFavorite={toggleFavorite}
                        />
                    </section>
                </div>
            )}
            
            {activeTab === 'minimums' && (
                <div className="space-y-8">
                    {isLoading ? (
                         <SystemInitializingScreen />
                    ) : (
                        <MinimumScoresPage entries={entries} />
                    )}
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-8 max-w-7xl mx-auto">
                    {isLoading ? (
                         <StatsInsightLoader />
                    ) : (
                        <Dashboard entries={entries} />
                    )}
                </div>
            )}

            {activeTab === 'form' && (
            <div className="max-w-4xl mx-auto">
                <ScoreForm onSubmit={handleAddEntry} onDirtyChange={setIsFormDirty} />
            </div>
            )}

            {activeTab === 'disclaimer' && (
              <LegalContentPage kind="disclaimer" onBack={handleAcceptDisclaimer} onNavigate={handleTabChange} />
            )}

            {activeTab === 'privacy' && (
              <LegalContentPage kind="privacy" onBack={() => handleTabChange('list')} onNavigate={handleTabChange} />
            )}
        </div>
      </main>
      
      <footer className="relative mt-12 overflow-hidden bg-slate-950 pb-28 pt-8 text-white md:pb-12 md:pt-12">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr]">
            <div className="col-span-2 lg:col-span-1">
              <button type="button" onClick={() => handleTabChange('list')} className="flex items-center gap-3 text-left">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600"><GraduationCap className="h-6 w-6" /></span>
                <span className="text-xl font-black tracking-tight">TW 會考落點分析</span>
              </button>
              <p className="mt-4 max-w-xs text-sm font-medium leading-7 text-slate-400">整合學生分享資料，協助考生以更有脈絡的方式看懂落點與志願選擇。</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition-colors hover:text-white">
                聯絡我們 <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">快速前往</h3>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm font-medium text-slate-400">
                <a href={pageHref('list', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'list')} className="transition-colors hover:text-cyan-200">瀏覽錄取資料</a>
                <a href={pageHref('minimums', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'minimums')} className="transition-colors hover:text-cyan-200">各校最低分數</a>
                <a href={pageHref('stats', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'stats')} className="transition-colors hover:text-cyan-200">會考統計資料</a>
                <a href={pageHref('insights', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'insights')} className="transition-colors hover:text-cyan-200">會考志願策略</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">平台資訊</h3>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm font-medium text-slate-400">
                <a href={pageHref('guide', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'guide')} className="transition-colors hover:text-cyan-200">使用說明</a>
                <a href={pageHref('disclaimer', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'disclaimer')} className="transition-colors hover:text-cyan-200">免責聲明</a>
                <a href={pageHref('privacy', routeBase.current)} onClick={(event) => handlePageLinkClick(event, 'privacy')} className="transition-colors hover:text-cyan-200">隱私權與版權聲明</a>
                <a href="https://tyctw.github.io/spare/support/" target="_blank" rel="noopener noreferrer" onClick={() => logUserAction('external_link', 'small_support')} className="transition-colors hover:text-rose-200">小額支持</a>
              </div>
            </div>

          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs font-medium text-slate-500 sm:mt-10 sm:pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright © 2024-{new Date().getFullYear()} TW 會考落點分析</p>
            <p>資料僅供參考，實際資訊以當年度官方公告為準。</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
