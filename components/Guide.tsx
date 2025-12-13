import React from 'react';
import { BookOpen, Share2, BarChart3, Search, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface GuideProps {
  onNavigate: (tab: 'list' | 'form' | 'stats') => void;
}

const Guide: React.FC<GuideProps> = ({ onNavigate }) => {
  const sectionClass = "bg-white/60 backdrop-blur-md rounded-[2rem] p-6 sm:p-10 border border-white/60 shadow-sm relative overflow-hidden";
  const titleClass = "text-xl font-bold text-slate-800 mb-4 flex items-center gap-2";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold shadow-sm mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Platform Guide</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-4">
            如何使用會考落點分享平台
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            這是一個由考生互助建立的開放資料庫。透過匯集真實的錄取數據，幫助你與學弟妹們在升學路上減少迷惘，精準定位目標學校。
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white/80 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">1. 查詢錄取標準</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                在「瀏覽分數」頁面，你可以依照區域與學校名稱進行篩選，查看歷屆學長姐的回報分數。
            </p>
            <button onClick={() => onNavigate('list')} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                前往瀏覽 <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        {/* Feature 2 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white/80 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Share2 className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">2. 分享你的戰績</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                考完試後，別忘了回來「分享成績」。你的數據將成為下一屆考生的重要參考。我們採用匿名制。
            </p>
            <button onClick={() => onNavigate('form')} className="text-sm font-bold text-amber-600 flex items-center gap-1 hover:gap-2 transition-all">
                前往分享 <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        {/* Feature 3 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white/80 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">3. 觀察數據分佈</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                透過「統計數據」儀表板，宏觀了解各科等級分佈情形，掌握整體競爭態勢。
            </p>
            <button onClick={() => onNavigate('stats')} className="text-sm font-bold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all">
                查看統計 <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* FAQ & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className={sectionClass}>
            <h3 className={titleClass}>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                關於資料準確性
            </h3>
            <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p>本平台資料皆由考生<span className="font-bold text-slate-800">自由回報</span>。雖然我們會透過驗證機制過濾惡意程式，但無法 100% 保證每一筆分數的真實性。</p>
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p>建議參考多筆資料取平均值，或是查看該筆資料的「備註」欄位，通常包含考生的真實心得會較具參考價值。</p>
                </li>
            </ul>
        </section>

        <section className={sectionClass}>
            <h3 className={titleClass}>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                積分計算說明
            </h3>
            <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p>各就學區（基北、桃連、中投...）的<span className="font-bold text-slate-800">總積分算法不同</span>。填寫時請依照您所在區域的簡章標準計算。</p>
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p>例如：基北區滿分 36 分，中投區滿分 111 點等。系統不會自動換算，請直接填寫您成績單上的最終數字。</p>
                </li>
            </ul>
        </section>
      </div>

      {/* Footer Note */}
      <div className="bg-indigo-900 rounded-[2rem] p-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">準備好幫助別人了嗎？</h3>
            <p className="text-indigo-200 mb-6 max-w-lg mx-auto">
                你的一筆小小回報，可能是學弟妹選填志願時的關鍵明燈。現在就分享你的錄取資訊！
            </p>
            <button 
                onClick={() => onNavigate('form')}
                className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg"
            >
                立即分享成績
            </button>
        </div>
      </div>

    </div>
  );
};

export default Guide;