import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, GraduationCap, Sparkles, Star, X } from 'lucide-react';

export default function GreetingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenGreeting = localStorage.getItem('hasSeenGreeting_115');
    if (!hasSeenGreeting) {
      const timer = window.setTimeout(() => setIsOpen(true), 650);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenGreeting_115', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5 animate-in fade-in duration-300">
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-200/65 backdrop-blur-md"
        aria-label="關閉祝福彈窗"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="greeting-title"
        className="relative w-full max-w-xl overflow-hidden rounded-t-[2.25rem] border border-white/80 bg-white text-slate-900 shadow-[0_35px_90px_-35px_rgba(15,23,42,0.32)] ring-1 ring-slate-200/70 animate-in slide-in-from-bottom-8 duration-500 sm:rounded-[2.5rem] sm:zoom-in-95"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-indigo-50 via-sky-50 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.45] [background-image:linear-gradient(rgba(99,102,241,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.12)_1px,transparent_1px)] [background-size:36px_36px]" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:rotate-90 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          aria-label="關閉"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 px-6 pb-7 pt-9 text-center sm:px-10 sm:pb-10 sm:pt-11">
          <div className="relative mx-auto mb-7 w-fit">
            <div className="absolute inset-0 scale-150 rounded-full bg-indigo-200/55 blur-2xl" />
            <div className="relative flex h-24 w-24 rotate-3 items-center justify-center rounded-[2rem] border border-white bg-gradient-to-br from-indigo-400 to-sky-400 shadow-xl shadow-indigo-200/70">
              <GraduationCap className="h-12 w-12 -rotate-3 text-white" />
            </div>
            <span className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-amber-700 shadow-lg shadow-amber-100">
              <Star className="h-4 w-4 fill-current" />
            </span>
            <span className="absolute -bottom-2 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg shadow-slate-200 ring-1 ring-slate-100">
              <Award className="h-5 w-5" />
            </span>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 text-xs font-bold text-indigo-700 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            115 會考祝福
          </div>

          <h2 id="greeting-title" className="text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
            祝各位考生
            <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-sky-500 to-amber-500 bg-clip-text text-transparent">
              金榜題名
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-7 text-slate-600 sm:text-base">
            願每一份努力都有漂亮的回音。放榜前後都記得穩住節奏，帶著準備好的自己，走向最適合的下一站。
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            {['穩定發揮', '順利錄取', '前程似錦'].map(item => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/75 px-2 py-3 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-md">
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-300 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 active:scale-[0.98]"
          >
            開始查詢落點
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
