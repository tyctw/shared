import React, { useState, useEffect } from 'react';
import { ScoreEntry } from '../types';
import { REGIONS, YEARS } from '../constants';
import { MapPin, Search, Sparkles, Share2, Check, Calendar, Quote, School, ChevronLeft, ChevronRight, Heart, Filter, ChevronDown, RefreshCw } from 'lucide-react';

interface ScoreListProps {
  entries: ScoreEntry[];
  isLoading?: boolean;
  favoriteIds?: string[];
  toggleFavorite?: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  nature: '自然',
  social: '社會',
};

const getGradeStyle = (grade: string) => {
  if (grade === 'A++') return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-100';
  if (grade === 'A+') return 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600 shadow-sm shadow-emerald-100';
  if (grade === 'A') return 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 text-indigo-600 shadow-sm shadow-indigo-100';
  if (grade.startsWith('B')) return 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm';
  return 'bg-gray-50 border-gray-100 text-gray-400';
};

const getWritingStyle = (grade: number) => {
  if (grade === 6) return 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-100';
  if (grade === 5) return 'bg-gradient-to-br from-fuchsia-50 to-purple-50 border-fuchsia-200 text-fuchsia-600 shadow-sm shadow-fuchsia-100';
  return 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm';
};

const ScoreSkeleton = () => (
  <div className="bg-white rounded-[2rem] border border-slate-100 p-1 shadow-sm">
    <div className="bg-slate-50/50 rounded-[1.75rem] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10"></div>
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
                    <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
                </div>
                <div className="w-48 h-8 bg-slate-200/80 rounded-xl"></div>
                <div className="w-24 h-6 bg-slate-200/60 rounded-lg"></div>
            </div>
            <div className="w-20 h-16 bg-slate-200/60 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-8 sm:mt-12 border-t border-slate-200/50 pt-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-200/50"></div>
            ))}
        </div>
    </div>
  </div>
);

const ScoreList: React.FC<ScoreListProps> = ({ entries, isLoading, favoriteIds = [], toggleFavorite, onRefresh, isRefreshing }) => {
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  
  const listTopRef = React.useRef<HTMLDivElement>(null);

  const minPointsMap = React.useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(entry => {
      const key = `${entry.year}-${entry.school}-${entry.department}`;
      if (!map.has(key) || entry.totalPoints < map.get(key)!) {
        map.set(key, entry.totalPoints);
      }
    });
    return map;
  }, [entries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRegion, filterYear, filterSchool, itemsPerPage, groupBySchool]);

  const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
      if (listTopRef.current) {
          // Adjust offset to not hide behind fixed header if there's any, minus some padding
          const yOffset = -20; 
          const y = listTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
      }
  };

  const filteredEntries = entries.filter(entry => {
    const matchRegion = filterRegion === 'All' || entry.region === filterRegion;
    const matchYear = filterYear === 'All' || entry.year === Number(filterYear);
    const matchSchool = entry.school.includes(filterSchool);
    return matchRegion && matchYear && matchSchool;
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
    const shareText = `【會考落點分享】\n🏫 ${entry.school} (${entry.department})\n📅 ${entry.year}年 | 📍 ${entry.region}\n🏆 總積分：${entry.totalPoints}\n\n📝 科目成績：\n國${entry.scores.chinese} 英${entry.scores.english} 數${entry.scores.math} 自${entry.scores.nature} 社${entry.scores.social} 作${entry.scores.writing}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-6" ref={listTopRef}>
       {/* Filter Area Container */}
       <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-2xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
         
         {/* Title & Count */}
         <div className="flex items-center gap-3 shrink-0">
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-2.5 rounded-xl border border-indigo-100/50 shadow-sm">
                 <Filter className="w-5 h-5 text-indigo-600" />
             </div>
             <div className="flex items-center gap-4">
                 <div>
                     <h3 className="font-black text-slate-800 text-lg leading-none tracking-tight mb-1">
                         最新分享
                     </h3>
                     <p className="text-xs text-slate-500 font-bold tracking-wide">
                         {!isLoading ? `找到 ${filteredEntries.length} 筆資料` : '載入中...'}
                     </p>
                 </div>
                 {onRefresh && (
                     <button
                         onClick={handleRefresh}
                         disabled={isRefreshing || cooldown > 0}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 hover:bg-slate-100 border border-indigo-100/50 text-indigo-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 group hover:shadow-sm"
                         title="重新整理"
                     >
                         <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                         <span className="hidden sm:inline">
                             {cooldown > 0 ? `冷卻中 ${cooldown}s` : '重整'}
                         </span>
                     </button>
                 )}
             </div>
         </div>
         
         {/* Controls */}
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
             
             {/* Group by School Toggle */}
             <label className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-700 font-bold cursor-pointer hover:text-indigo-600 transition-colors bg-slate-50 sm:bg-transparent px-4 py-2.5 sm:p-0 rounded-xl sm:rounded-none border border-slate-200 sm:border-none group">
                 <div className="relative flex items-center justify-center">
                     <input 
                         type="checkbox"
                         checked={groupBySchool}
                         onChange={(e) => setGroupBySchool(e.target.checked)}
                         className="peer sr-only"
                     />
                     <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                         <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" strokeWidth={3} />
                     </div>
                 </div>
                 <span>同校排在一起</span>
             </label>

             <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
             
             {/* Search Input */}
             <div className="relative flex-1 sm:w-56 group">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 <input 
                     type="text" 
                     placeholder="搜尋學校..." 
                     value={filterSchool}
                     onChange={(e) => setFilterSchool(e.target.value)}
                     className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-400"
                 />
             </div>

             {/* Selectors */}
             <div className="flex gap-2 w-full sm:w-auto">
                 <div className="relative flex-1 sm:flex-none">
                     <select
                         value={filterYear}
                         onChange={(e) => setFilterYear(e.target.value)}
                         className="w-full sm:w-auto appearance-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer min-w-[7rem]"
                     >
                         <option value="All">所有年份</option>
                         {YEARS.map(year => (
                             <option key={year} value={year}>{year}年</option>
                         ))}
                     </select>
                     <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                 </div>

                 <button 
                     onClick={() => setIsRegionModalOpen(true)}
                     className="flex-1 sm:flex-none flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer min-w-[8rem] text-slate-700 active:scale-95"
                 >
                     <span className="truncate">{filterRegion === 'All' ? '所有區域' : filterRegion}</span>
                     <Search className="w-4 h-4 text-slate-400 shrink-0" />
                 </button>
             </div>
         </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
            <>
                <ScoreSkeleton />
                <ScoreSkeleton />
                <ScoreSkeleton />
            </>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300 mx-4 sm:mx-0">
             <div className="bg-white p-5 rounded-full mb-4 shadow-sm ring-8 ring-slate-50">
                <Search className="w-10 h-10 text-slate-300" />
             </div>
             <p className="font-bold text-slate-600 text-lg">找不到符合的資料</p>
             <p className="text-sm text-slate-400 mt-1">試試看切換區域或使用關鍵字搜尋</p>
          </div>
        ) : (
          paginatedEntries.map((entry) => (
            <div 
                key={entry.id} 
                className="group relative bg-white rounded-[2rem] p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.2)] transition-all duration-500 ease-out border border-slate-100"
            >
              <div className="bg-slate-50/40 rounded-[1.6rem] p-6 sm:p-7 relative overflow-hidden h-full flex flex-col">
                  {/* Glowing Ambient Corners */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[4rem] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[4rem] -ml-20 -mb-20 group-hover:bg-fuchsia-500/20 transition-all duration-700 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col h-full">
                      {/* Top Meta Row */}
                      <div className="flex justify-between items-center mb-5">
                          <div className="flex gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[11px] font-bold text-slate-500 shadow-sm border border-slate-200/60">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {entry.year} 年
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[11px] font-bold text-slate-500 shadow-sm border border-slate-200/60">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {entry.region}
                              </span>
                          </div>
                          <div className="flex items-center gap-2">
                              {toggleFavorite && (
                                  <button
                                      onClick={() => toggleFavorite(entry.id)}
                                      className={`p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-sm transition-all sm:opacity-0 group-hover:opacity-100 focus:opacity-100 ${favoriteIds?.includes(entry.id) ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                                      title={favoriteIds?.includes(entry.id) ? "取消收藏" : "加入收藏"}
                                  >
                                      <Heart className={`w-4 h-4 ${favoriteIds?.includes(entry.id) ? 'fill-current' : ''}`} />
                                  </button>
                              )}
                              <button 
                                  onClick={() => handleShare(entry)}
                                  className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/60 shadow-sm transition-all sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  title="複製分享內容"
                              >
                                  {copiedId === entry.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                              </button>
                          </div>
                      </div>

                      {/* Title & Points Row */}
                      <div className="flex flex-col justify-between items-start gap-4 mb-6">
                          <div className="flex-1 w-full relative">
                              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                                  {entry.school}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 text-indigo-700 text-sm font-bold rounded-lg border border-indigo-100">
                                      <School className="w-4 h-4 text-indigo-400" />
                                      {entry.department}
                                  </div>
                                  {minPointsMap.get(`${entry.year}-${entry.school}-${entry.department}`) === entry.totalPoints && (
                                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 text-rose-600 text-sm font-bold rounded-lg border border-rose-100">
                                          <Sparkles className="w-4 h-4 text-rose-400" />
                                          同校科最低分
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="flex gap-2 shrink-0 w-full">
                              <div className="flex-1 flex flex-col justify-center items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm min-w-[5rem] group-hover:border-indigo-200 group-hover:shadow-md transition-all duration-300">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">總積分</span>
                                  <span className="text-2xl font-black text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all leading-none tracking-tighter">
                                      {entry.totalPoints}
                                  </span>
                              </div>
                              {entry.totalCredits && (
                                  <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-2 shadow-sm min-w-[5rem] group-hover:border-amber-300 group-hover:shadow-md transition-all duration-300">
                                      <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mb-1 flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />總積點</span>
                                      <span className="text-2xl font-black text-amber-600 leading-none tracking-tighter">
                                          {entry.totalCredits}
                                      </span>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Notes Bubble */}
                      {entry.notes && (
                          <div className="mb-6">
                              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm relative">
                                  <Quote className="absolute top-4 left-4 w-5 h-5 text-indigo-100 rotate-180" />
                                  <p className="text-sm text-slate-600 leading-relaxed font-medium pl-8 pr-2">
                                      {entry.notes}
                                  </p>
                              </div>
                          </div>
                      )}

                      {/* Subject Scores Grid */}
                      <div className="mt-auto">
                          <div className="grid grid-cols-3 gap-2">
                              {(['chinese', 'english', 'math', 'nature', 'social'] as const).map(sub => (
                                  <div 
                                      key={sub} 
                                      className={`flex flex-col items-center justify-center rounded-2xl p-2.5 border transition-transform hover:-translate-y-1 ${getGradeStyle(entry.scores[sub])}`}
                                  >
                                      <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">
                                          {SUBJECT_LABELS[sub]}
                                      </span>
                                      <span className="text-lg font-black font-mono leading-none">
                                          {entry.scores[sub]}
                                      </span>
                                  </div>
                              ))}
                              <div 
                                  className={`flex flex-col items-center justify-center rounded-2xl p-2.5 border transition-transform hover:-translate-y-1 ${getWritingStyle(entry.scores.writing)}`}
                              >
                                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">
                                      作文
                                  </span>
                                  <span className="text-lg font-black font-mono leading-none">
                                      {entry.scores.writing}<span className="text-xs ml-0.5 opacity-60">級</span>
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
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
                      <option value={5}>5 筆</option>
                      <option value={10}>10 筆</option>
                      <option value={20}>20 筆</option>
                      <option value={50}>50 筆</option>
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
