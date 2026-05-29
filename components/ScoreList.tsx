import React, { useState, useEffect } from 'react';
import { ScoreEntry } from '../types';
import { REGIONS, YEARS } from '../constants';
import { MapPin, Search, Sparkles, Share2, Check, Calendar, Quote, School, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface ScoreListProps {
  entries: ScoreEntry[];
  isLoading?: boolean;
  favoriteIds?: string[];
  toggleFavorite?: (id: string) => void;
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

const ScoreList: React.FC<ScoreListProps> = ({ entries, isLoading, favoriteIds = [], toggleFavorite }) => {
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRegion, filterYear, filterSchool, itemsPerPage]);

  const filteredEntries = entries.filter(entry => {
    const matchRegion = filterRegion === 'All' || entry.region === filterRegion;
    const matchYear = filterYear === 'All' || entry.year === Number(filterYear);
    const matchSchool = entry.school.includes(filterSchool);
    return matchRegion && matchYear && matchSchool;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="space-y-8">
       {/* Search Bar / Filter Area */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
         <h3 className="font-bold text-slate-700 flex items-center gap-2 shrink-0">
             最新回報
             {!isLoading && (
               <span className="bg-white border border-indigo-100 text-indigo-600 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm">
                   {filteredEntries.length} 筆
               </span>
             )}
         </h3>
         
         {/* Filter Area */}
         <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none sm:w-48">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                     type="text" 
                     placeholder="搜尋學校..." 
                     value={filterSchool}
                     onChange={(e) => setFilterSchool(e.target.value)}
                     className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
                 />
             </div>
             <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                 <select
                     value={filterYear}
                     onChange={(e) => setFilterYear(e.target.value)}
                     className="flex-1 sm:flex-none bg-white/70 backdrop-blur-sm border border-slate-200 rounded-full py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm cursor-pointer min-w-[5rem]"
                 >
                     <option value="All">所有年份</option>
                     {YEARS.map(year => (
                         <option key={year} value={year}>{year}年</option>
                     ))}
                 </select>
                 <button 
                     onClick={() => setIsRegionModalOpen(true)}
                     className="flex-1 sm:flex-none flex items-center justify-between gap-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-full py-1.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm cursor-pointer min-w-[6.5rem] whitespace-nowrap text-slate-700 hover:bg-white"
                 >
                     <span className="truncate">{filterRegion === 'All' ? '所有區域' : filterRegion}</span>
                     <Search className="w-3.5 h-3.5 text-slate-400" />
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
                          <div className="flex-1">
                              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                                  {entry.school}
                              </h3>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 text-indigo-700 text-sm font-bold rounded-lg border border-indigo-100">
                                  <School className="w-4 h-4 text-indigo-400" />
                                  {entry.department}
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
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
