import React from 'react';
import { BookOpen, Share2, BarChart3, Search, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Sparkles, Map, HeartHandshake } from 'lucide-react';

interface GuideProps {
  onNavigate: (tab: 'list' | 'form' | 'stats') => void;
}

const Guide: React.FC<GuideProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-sm font-bold shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>新手指南</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-6 leading-tight">
            讓數據成為<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">你的優勢</span>
        </h2>
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
            這是一個由全台考生互助建立的開放資料庫。透過匯集客觀、真實的錄取數據，幫助你在升學路上精準定位，不再迷惘。
        </p>
      </div>

      {/* Main Features BENTO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1 - Search */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 group hover:-translate-y-1">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Search className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">1. 探索歷屆落點</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
                使用智慧篩選器，快速查找各校系的真實錄取成績。不再盲目猜測，讓歷史數據為你指路。
            </p>
            <button onClick={() => onNavigate('list')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl font-bold text-sm transition-all group-hover:bg-indigo-50">
                開始探索 <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        {/* Card 2 - Share */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(236,72,153,0.1)] transition-all duration-300 group hover:-translate-y-1 lg:col-span-1 md:col-span-1">
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <HeartHandshake className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">2. 傳承你的經驗</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
                放榜後，匿名分享你的奮鬥成果吧！你的每一筆數據，都將成為下一屆學弟妹的重要基石。
            </p>
            <button onClick={() => onNavigate('form')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-600 rounded-xl font-bold text-sm transition-all group-hover:bg-pink-50">
                立即分享 <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        {/* Card 3 - Stats */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(168,85,247,0.1)] transition-all duration-300 group hover:-translate-y-1 md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">3. 掌握整體趨勢</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
                透過視覺化的統計圖表，你可以宏觀地觀察各科等級分佈，洞察每一年的競爭變化態勢。
            </p>
            <button onClick={() => onNavigate('stats')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-600 rounded-xl font-bold text-sm transition-all group-hover:bg-purple-50">
                查看圖表 <ArrowRight className="w-4 h-4" />
            </button>
        </div>

      </div>

      {/* Trust & Rules Section */}
      <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-200/60 mt-12">
        <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">使用規則與聲明</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">資料準確性</h3>
                </div>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            平台數據為<span className="font-bold text-slate-800">社群群眾外包</span>填寫，未經官方驗證。請將其作為參考基準，而非絕對標準。
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            建議同時參考多筆同校系的回報分數，並閱讀備註欄位以獲取更詳細的背景資訊。
                        </p>
                    </li>
                </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <Map className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">各區積分差異</h3>
                </div>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            全台各就學區的<span className="font-bold text-slate-800">總積分算法皆不相同</span>（例如：基北區滿分 36，中投區滿分 111 等）。
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            系統目前不會進行跨區自動換算。填寫時請嚴格依照您所在學區的簡章標準輸入最終點數。
                        </p>
                    </li>
                </ul>
            </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="relative rounded-[2.5rem] bg-indigo-900 border border-indigo-800 overflow-hidden isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-slate-900 opacity-90 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="relative z-10 px-8 py-16 md:py-20 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                準備好幫助學弟妹了嗎？
            </h3>
            <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-10 font-medium">
                你的一筆數據，可能是別人選填志願時的一盞微光。<br className="hidden md:block" />現在就分享你的錄取經歷吧。
            </p>
            <button 
                onClick={() => onNavigate('form')}
                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 mx-auto"
            >
                <HeartHandshake className="w-5 h-5" /> 立即貢獻分數
            </button>
        </div>
      </div>

    </div>
  );
};

export default Guide;
