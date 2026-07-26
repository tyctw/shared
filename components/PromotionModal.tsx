import React from 'react';
import { ArrowRight, BarChart3, Check, ExternalLink, Share2, Sparkles, X } from 'lucide-react';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="score-share-title">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/65 backdrop-blur-md" onClick={onClose} aria-label="關閉會考序位分享視窗" />

      <section className="relative w-full max-w-[28rem] overflow-hidden rounded-[2rem] border border-white/20 bg-[#f8f8ff] shadow-[0_32px_90px_-28px_rgba(15,23,42,.8)] sm:max-w-[30rem]">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-700 to-fuchsia-600 px-6 pb-16 pt-6 text-white sm:px-8 sm:pb-20">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute -right-12 top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute right-16 top-28 h-24 w-24 rounded-full bg-pink-300/25 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-[0.15em] text-violet-100 backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" /> 資料共創</span>
            <button type="button" onClick={onClose} className="rounded-full border border-white/20 bg-white/10 p-2 text-white/90 backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30" aria-label="關閉"><X className="h-5 w-5" /></button>
          </div>

          <div className="relative mt-7 flex items-end justify-between gap-4 sm:mt-9">
            <div><p className="text-sm font-bold text-violet-100">分享一筆資料，點亮更多選擇</p><h2 id="score-share-title" className="mt-1.5 text-[2rem] font-black tracking-tight sm:text-4xl">會考序位分享</h2></div>
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/25 bg-white/15 shadow-xl backdrop-blur-md sm:h-16 sm:w-16"><span className="absolute inset-2 rounded-xl border border-white/20" /><Share2 className="relative h-7 w-7 sm:h-8 sm:w-8" /></span>
          </div>
        </div>

        <div className="relative -mt-10 px-4 pb-4 sm:-mt-12 sm:px-6 sm:pb-5">
          <div className="rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_18px_44px_-24px_rgba(49,46,129,.42)] sm:p-6">
            <div className="flex items-start gap-3.5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700"><BarChart3 className="h-5 w-5" /></span><div><p className="text-[10px] font-black tracking-[0.16em] text-violet-600">讓資料更有意義</p><p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">匿名分享會考成績與序位，讓真實資料成為每個人規劃升學時的可靠參考。</p></div></div>

            <div className="mt-5 grid grid-cols-2 gap-2.5"><div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-3"><p className="text-[10px] font-black tracking-[0.12em] text-violet-400">分享資料</p><p className="mt-1 text-sm font-black text-slate-700">成績與序位</p></div><div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/60 px-3 py-3"><p className="text-[10px] font-black tracking-[0.12em] text-fuchsia-400">一起建立</p><p className="mt-1 text-sm font-black text-slate-700">選填參考</p></div></div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 px-3 py-2.5 text-xs font-bold leading-5 text-violet-800"><Check className="h-4 w-4 shrink-0 stroke-[3] text-violet-600" />讓下一位考生，少一點不確定。</div>

            <a href="https://tyctw.github.io/score/" target="_blank" rel="noopener noreferrer" onClick={onClose} className="group mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"><span className="flex items-center gap-2"><ExternalLink className="h-4 w-4" />前往分享序位</span><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></a>
          </div>
        </div>
      </section>
    </div>
  );
};
