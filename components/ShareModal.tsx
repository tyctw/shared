import React, { useState } from 'react';
import { Check, Copy, Facebook, Link, MessageCircle, Share2, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shareUrl = 'https://tyctw.github.io/volunteer/';
const shareTitle = '教育會考志願選填資訊｜升學資源與選填指南';
const shareText = '整合志願選填資源、落點分析與選填文章，協助掌握下一步。';

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(shareUrl);

  if (!isOpen) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('textarea');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
      }
    }
    await copyLink();
  };

  const lineShare = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <button className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-md" onClick={onClose} aria-label="關閉分享視窗" />
      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_90px_-26px_rgba(15,23,42,.55)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div className="flex items-center gap-3"><span className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><Share2 className="h-5 w-5" /></span><div><h2 id="share-title" className="font-black text-slate-900">分享網站</h2><p className="text-xs font-medium text-slate-400">讓更多人找到升學資源</p></div></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="關閉"><X className="h-5 w-5" /></button></div>
        <div className="p-6">
          <p className="mb-5 text-sm leading-6 text-slate-500">分享網站連結給需要志願選填資源的同學與家長。</p>
          <div className="mb-5 flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedUrl}&margin=0`} alt="掃描 QR Code 前往教育會考志願選填資訊網站" className="h-40 w-40 rounded-lg bg-white p-2" />
            <p className="mt-3 text-xs font-bold text-slate-500">掃描 QR Code 開啟網站</p>
          </div>
          <button onClick={nativeShare} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:bg-indigo-600"><Share2 className="h-5 w-5" />立即分享</button>
          <div className="mt-5 grid grid-cols-3 gap-3"><a href={lineShare} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-3 text-xs font-bold text-slate-600 transition hover:border-[#06C755]/30 hover:bg-[#06C755]/10 hover:text-[#06C755]"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06C755] text-white shadow-sm transition group-hover:scale-110"><MessageCircle className="h-5 w-5" /></span>LINE</a><a href={facebookShare} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-3 text-xs font-bold text-slate-600 transition hover:border-[#1877F2]/30 hover:bg-[#1877F2]/10 hover:text-[#1877F2]"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition group-hover:scale-110"><Facebook className="h-5 w-5" /></span>Facebook</a><button onClick={copyLink} className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-3 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm transition group-hover:scale-110">{copied ? <Check className="h-5 w-5 text-emerald-300" /> : <Link className="h-5 w-5" />}</span>{copied ? '已複製' : '複製連結'}</button></div>
        </div>
      </section>
    </div>
  );
};
