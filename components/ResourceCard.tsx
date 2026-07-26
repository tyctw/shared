import React from 'react';
import { ArrowRight } from 'lucide-react';

type ResourceCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  fromColor: string;
  toColor: string;
  shadowColor?: string;
};

const badges: Record<string, string> = {
  '會考序位分享': '共同建立資料庫',
  '會考落點分析': '用數據輔助決策',
  '會考錄取分享': '查看真實錄取資料',
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ href, icon, title, desc, fromColor, toColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-2 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.38)] transition-all duration-300 hover:-translate-y-2 hover:border-white hover:shadow-[0_24px_52px_-22px_rgba(79,70,229,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
    aria-label={`開啟${title}`}
  >
    <div className={`absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gradient-to-br ${fromColor} ${toColor} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25`} />
    <div className="relative flex h-full flex-col rounded-[1.6rem] bg-gradient-to-b from-white to-slate-50/70 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${fromColor} ${toColor} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
          {icon}
        </div>
        <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-black tracking-wide text-slate-500 shadow-sm">升學工具</span>
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm font-medium leading-6 text-slate-500">{desc}</p>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition-colors duration-300 group-hover:bg-indigo-600">
        <span>開始探索</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" /></span>
      </div>
    </div>
  </a>
);
