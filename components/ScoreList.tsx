import React, { useState } from 'react';
import { ScoreEntry } from '../types';
import { MapPin, Search, Sparkles, Share2, Check, Calendar } from 'lucide-react';

interface ScoreListProps {
  entries: ScoreEntry[];
  isLoading?: boolean;
}

const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  nature: '自然',
  social: '社會',
};

// Enhanced Grade Styling (Background Badges)
const getGradeStyle = (grade: string) => {
  if (grade === 'A++') return 'bg-amber-100/80 border-amber-200 text-amber-700 shadow-sm shadow-amber-100 ring-1 ring-amber-200/50';
  if (grade === 'A+') return 'bg-indigo-100/80 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100 ring-1 ring-indigo-200/50';
  if (grade === 'A') return 'bg-emerald-100/80 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100 ring-1 ring-emerald-200/50';
  if (grade.startsWith('B')) return 'bg-slate-100/80 border-slate-200 text-slate-700 ring-1 ring-slate-200/50';
  return 'bg-gray-50 border-gray-100 text-gray-400';
};

const getWritingStyle = (grade: number) => {
  if (grade === 6) return 'bg-rose-100/80 border-rose-200 text-rose-700 shadow-sm shadow-rose-100 ring-1 ring-rose-200/50';
  if (grade === 5) return 'bg-pink-100/80 border-pink-200 text-pink-700 shadow-sm shadow-pink-100 ring-1 ring-pink-200/50';
  return 'bg-slate-100/80 border-slate-200 text-slate-600';
};

const ScoreSkeleton = () => (
  <div className="relative bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60 p-6 sm:p-8 shadow-sm overflow-hidden h-[280px]">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    
    <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
            <div className="w-16 h-6 bg-slate-200/60 rounded-lg animate-pulse"></div>
            <div className="w-48 h-8 bg-slate-200/80 rounded-xl animate-pulse"></div>
            <div className="w-32 h-5 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-20 h-20 bg-indigo-50/50 rounded-2xl animate-pulse"></div>
    </div>

    <div className="grid grid-cols-6 gap-2 sm:gap-3 mt-auto pt-6 border-t border-slate-100/50">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-100/50 animate-pulse"></div>
        ))}
    </div>
  </div>
);

const ScoreList: React.FC<ScoreListProps> = ({ entries, isLoading }) => {
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEntries = entries.filter(entry => {
    const matchRegion = filterRegion === 'All' || entry.region === filterRegion;
    const matchSchool = entry.school.includes(filterSchool);
    return matchRegion && matchSchool;
  });

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
       {/* Search Bar / Filter Area can be added here if needed */}
       <div className="flex items-center justify-between px-2">
         <h3 className="font-bold text-slate-700 flex items-center gap-2">
             最新回報
             {!isLoading && (
               <span className="bg-white border border-indigo-100 text-indigo-600 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm">
                   {filteredEntries.length} 筆
               </span>
             )}
         </h3>
       </div>

      <div className="grid grid-cols-1 gap-6">
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
          filteredEntries.map((entry) => (
            <div 
                key={entry.id} 
                className="group relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 p-6 sm:p-8 
                           shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] 
                           hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.2)] 
                           hover:-translate-y-1.5 transition-all duration-500 ease-out overflow-hidden"
            >
              
              {/* Subtle Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/10 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              {/* Floating Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>

              {/* Share Button */}
              <button 
                onClick={() => handleShare(entry)}
                className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/80 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 shadow-sm backdrop-blur-sm transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                title="複製內容"
              >
                {copiedId === entry.id ? (
                    <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in" />
                ) : (
                    <Share2 className="w-4 h-4" />
                )}
              </button>

              <div className="relative z-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div className="flex-1 space-y-3">
                         {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-[11px] font-bold text-slate-600 transition-colors group-hover:bg-white group-hover:shadow-sm">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {entry.year} 年
                             </div>
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-[11px] font-bold text-slate-600 transition-colors group-hover:bg-white group-hover:shadow-sm">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {entry.region}
                             </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                                {entry.school}
                            </h3>
                            <div className="text-sm font-bold text-slate-500 mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ring-2 ring-indigo-100"></span>
                                {entry.department}
                            </div>
                        </div>
                    </div>

                    {/* Total Points Display */}
                    <div className="flex items-center sm:flex-col sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                        <div className="sm:hidden text-xs font-bold text-indigo-400 uppercase mr-auto">總積分</div>
                        <div className="text-left sm:text-right">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5 hidden sm:block">總積分</div>
                            <div className="text-4xl sm:text-5xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tighter drop-shadow-sm flex items-baseline gap-1">
                                {entry.totalPoints}
                                <span className="text-lg text-slate-300 font-bold hidden sm:inline-block">分</span>
                            </div>
                        </div>
                        {entry.totalCredits && (
                             <div className="ml-auto sm:ml-0 flex items-center gap-1 mt-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                <Sparkles className="w-3 h-3" />
                                積點 {entry.totalCredits}
                             </div>
                        )}
                    </div>
                </div>

                {/* Note Section */}
                {entry.notes && (
                    <div className="mb-8 relative pl-5 pr-2">
                        <div className="absolute top-1 left-0 w-1 h-full bg-indigo-100 rounded-full group-hover:bg-indigo-300 transition-colors duration-300"></div>
                        <p className="text-sm text-slate-600 leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                            "{entry.notes}"
                        </p>
                    </div>
                )}

                {/* Scores Grid */}
                <div className="grid grid-cols-6 gap-2 sm:gap-4">
                    {(['chinese', 'english', 'math', 'nature', 'social'] as const).map(sub => (
                        <div 
                            key={sub} 
                            className={`flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 transition-all duration-300 hover:scale-105 ${getGradeStyle(entry.scores[sub])}`}
                        >
                            <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">
                                {SUBJECT_LABELS[sub]}
                            </span>
                            <span className="text-lg sm:text-xl font-black font-mono">
                                {entry.scores[sub]}
                            </span>
                        </div>
                    ))}
                    <div 
                        className={`flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 transition-all duration-300 hover:scale-105 ${getWritingStyle(entry.scores.writing)}`}
                    >
                        <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">
                            作文
                        </span>
                        <span className="text-lg sm:text-xl font-black font-mono">
                            {entry.scores.writing}<span className="text-xs ml-0.5 opacity-60">級</span>
                        </span>
                    </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoreList;