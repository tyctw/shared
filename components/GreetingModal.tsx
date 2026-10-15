import React, { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

// One calendar month after the 115 admissions result sharing opens (Taiwan time).
const GREETING_EXPIRES_AT = new Date('2026-08-07T10:55:00+08:00').getTime();

export default function GreetingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (Date.now() >= GREETING_EXPIRES_AT) return;

    const hasSeenGreeting = localStorage.getItem('hasSeenGreeting_115');
    if (!hasSeenGreeting) {
      const timer = window.setTimeout(() => {
        if (Date.now() < GREETING_EXPIRES_AT) setIsOpen(true);
      }, 650);
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

  if (!isOpen || Date.now() >= GREETING_EXPIRES_AT) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/45"
        aria-label="關閉祝福彈窗"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="greeting-title"
        aria-describedby="greeting-description"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[28rem] overflow-y-auto rounded-2xl border border-[#e8e1d7] bg-[#fdfbf7] text-[#33302c] shadow-xl"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[#81796f] transition-colors hover:bg-[#eee9e1] hover:text-[#33302c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#92443f]"
          aria-label="關閉"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-7 pt-8 text-center sm:px-10 sm:pb-9 sm:pt-10">
          <p className="text-xs font-medium tracking-[0.18em] text-[#81796f]">
            115 會考祝福
          </p>

          <div className="mx-auto mb-6 mt-6 flex h-14 w-14 items-center justify-center rounded-md border border-[#92443f]/45 text-[#92443f]">
            <span className="font-serif text-lg font-semibold tracking-[0.12em]">捷報</span>
          </div>

          <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#81796f]">115 國中教育會考</p>
          <h2 id="greeting-title" className="font-serif leading-normal">
            <span className="block text-lg font-medium tracking-[0.08em] text-[#514b44]">祝各位考生</span>
            <span className="mt-1 block text-4xl font-bold tracking-[0.12em] text-[#92443f] sm:text-[2.75rem]">金榜題名</span>
          </h2>

          <div className="mx-auto my-6 h-px w-10 bg-[#c8b396]" aria-hidden="true" />

          <p id="greeting-description" className="text-sm leading-7 text-[#746c62]">
            <span className="mb-2 block font-medium text-[#514b44]">願每一份努力都有漂亮的回音。</span>
            放榜前後都記得穩住節奏，帶著準備好的自己，走向最適合的下一站。
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#92443f] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#7c3834] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#92443f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdfbf7]"
          >
            帶著祝福，開始查詢
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-4 text-xs leading-6 text-[#81796f]">
            願你走向屬於自己的燦爛未來
          </p>
        </div>
      </section>
    </div>
  );
}
