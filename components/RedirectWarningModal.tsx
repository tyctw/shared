import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowRight, Clock3, X } from 'lucide-react';

interface RedirectWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
}

export const RedirectWarningModal: React.FC<RedirectWarningModalProps> = ({ isOpen, onClose, onConfirm, siteName }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] isolate flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="redirect-warning-title">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-md" onClick={onClose} aria-label="關閉系統狀態提示" />

      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/30 bg-white shadow-[0_32px_90px_-28px_rgba(15,23,42,.8)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 px-7 pb-16 pt-7 text-white sm:px-8">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute -bottom-14 -right-10 h-40 w-40 rounded-full border-[18px] border-white/15" />
          <div className="relative flex items-start justify-between"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-black tracking-[0.16em] backdrop-blur">系統狀態</span><button type="button" onClick={onClose} className="rounded-full border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30" aria-label="關閉"><X className="h-5 w-5" /></button></div>
          <div className="relative mt-7 flex items-end gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/25 bg-white/15 shadow-lg backdrop-blur"><AlertTriangle className="h-7 w-7" /></span><div><p className="text-sm font-bold text-orange-100">升學系統提醒</p><h2 id="redirect-warning-title" className="mt-1 text-3xl font-black tracking-tight">系統尚未開放</h2></div></div>
        </div>

        <div className="relative -mt-8 px-5 pb-5 sm:px-6 sm:pb-6"><div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_18px_44px_-26px_rgba(15,23,42,.32)] sm:p-6"><p className="text-sm font-medium leading-7 text-slate-600"><span className="font-black text-slate-900">{siteName}</span> 的志願選填與序位查詢功能尚未開放。開放時間請以官方最新公告為準。</p><div className="mt-5 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-amber-900"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm"><Clock3 className="h-4 w-4" /></span><div><p className="text-[10px] font-black tracking-[0.12em] text-amber-600">預計開放</p><p className="mt-0.5 text-sm font-black">116／06／18 起</p></div></div><div className="mt-5 grid gap-3"><button type="button" onClick={onClose} className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:bg-indigo-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200">留在目前頁面</button><button type="button" onClick={onConfirm} className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3.5 text-sm font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100">仍要前往網站 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button></div></div></div>
      </section>
    </div>,
    document.body,
  );
};
