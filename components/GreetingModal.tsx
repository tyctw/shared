import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, GraduationCap, Sparkles, X } from 'lucide-react';

export default function GreetingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenGreeting = localStorage.getItem('hasSeenGreeting_115');
    if (!hasSeenGreeting) {
      const timer = window.setTimeout(() => setIsOpen(true), 650);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenGreeting_115', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/60 backdrop-blur-sm"
        aria-label="關閉祝福彈窗"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="greeting-title"
        className="relative w-full max-w-[34rem] overflow-hidden rounded-[2rem] bg-[#fffaf0] text-[#3b1e16] shadow-[0_32px_100px_-26px_rgba(23,10,6,0.72)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 sm:rounded-[2.5rem]"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#8d191b] via-[#d24a2e] to-[#8d191b]" />
        <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#f5ce7a]/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-[#b92520]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:radial-gradient(#8d191b_1px,transparent_1px)] [background-size:15px_15px]" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#7c3024]/10 bg-white/70 text-[#8d191b] shadow-sm backdrop-blur transition hover:rotate-90 hover:bg-[#8d191b] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#d59a36] focus:ring-offset-2"
          aria-label="關閉"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative px-6 pb-6 pt-7 text-center sm:px-10 sm:pb-7 sm:pt-8">
          <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-[#d9ae60]/55 bg-[#fff3d7] px-3.5 py-1.5 text-xs font-black tracking-[0.14em] text-[#8d191b] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#c7891f]" />
            115 會考祝福
            <Sparkles className="h-3.5 w-3.5 text-[#c7891f]" />
          </div>

          <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-[#f9e5ad] bg-[#a7211d] shadow-[0_12px_25px_-10px_rgba(126,25,21,0.6)] sm:h-24 sm:w-24">
            <span className="absolute inset-1 rounded-full border border-[#f4c968]/70" />
            <span className="relative font-serif text-2xl font-black tracking-[0.12em] text-[#ffe7a4] sm:text-3xl">捷報</span>
          </div>

          <p className="mb-1 text-xs font-bold tracking-[0.32em] text-[#a7211d]/75">115 國中教育會考</p>
          <h2 id="greeting-title" className="font-serif text-3xl font-black leading-[1.15] tracking-[0.08em] text-[#7e1915] sm:text-[2.25rem]">
            祝各位考生
            <span className="mt-1 block bg-gradient-to-r from-[#a7211d] via-[#d24a2e] to-[#b7791f] bg-clip-text text-transparent">金榜題名</span>
          </h2>

          <div className="mx-auto mt-3 max-w-md border-y border-[#d9ae60]/45 py-3">
            <p className="text-sm font-medium leading-7 text-[#633c30] sm:text-[0.95rem]">
              願每一份努力都有漂亮的回音。放榜前後都記得穩住節奏，帶著準備好的自己，走向最適合的下一站。
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8d191b] via-[#b52b22] to-[#8d191b] px-6 py-3.5 text-sm font-black tracking-wide text-white shadow-[0_12px_24px_-12px_rgba(126,25,21,0.85)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_28px_-12px_rgba(126,25,21,0.8)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d59a36] focus:ring-offset-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"><Check className="h-3.5 w-3.5" /></span>
            帶著祝福，開始查詢
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium text-[#8d6554]">
            <GraduationCap className="h-3.5 w-3.5 text-[#b7791f]" />
            願你走向屬於自己的燦爛未來
          </div>
        </div>
      </section>
    </div>
  );
}
