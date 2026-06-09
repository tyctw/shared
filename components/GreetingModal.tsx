import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, X } from 'lucide-react';

export default function GreetingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenGreeting = localStorage.getItem('hasSeenGreeting_115');
    if (!hasSeenGreeting) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenGreeting_115', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-[28rem] bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-50"></div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-gradient-to-tr from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Close Button */}
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8 sm:p-10 text-center flex flex-col items-center">
            
            <div className="relative mb-8 mt-2">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-100 to-pink-100 rounded-[2rem] rotate-3 flex items-center justify-center border-4 border-white shadow-xl">
                    <GraduationCap className="w-12 h-12 text-indigo-600 -rotate-3" />
                </div>
                {/* Confetti dots */}
                <div className="absolute -top-4 -left-4 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -right-6 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse"></div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-bold rounded-full mb-5 border border-indigo-200/50 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>114 國中教育會考</span>
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-4">
                祝各位考生 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">金榜題名</span>
            </h2>
            
            <p className="text-slate-500 font-medium text-[15px] leading-relaxed mb-8 px-2 max-w-[260px]">
                邁向高中的全新旅程！願你順利錄取心目中的理想校系，在未來閃耀自己的光芒。
            </p>

            <button
                onClick={handleClose}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
            >
                開始探索
            </button>
        </div>
      </div>
    </div>
  );
}
