import React, { useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { RegionCategory, RegionLink } from '../types';
import { RedirectWarningModal } from './RedirectWarningModal';

interface LinkCardProps {
  link: RegionLink;
}

const TARGET_DATE = new Date('2027-06-17T18:27:00');

const categoryThemes = [
  { accent: 'from-blue-500 to-cyan-400', soft: 'bg-blue-50', ink: 'text-blue-600', ring: 'ring-blue-100', button: 'hover:bg-blue-600', glow: 'group-hover:shadow-blue-500/20' },
  { accent: 'from-emerald-500 to-teal-400', soft: 'bg-emerald-50', ink: 'text-emerald-600', ring: 'ring-emerald-100', button: 'hover:bg-emerald-600', glow: 'group-hover:shadow-emerald-500/20' },
  { accent: 'from-orange-500 to-amber-400', soft: 'bg-orange-50', ink: 'text-orange-600', ring: 'ring-orange-100', button: 'hover:bg-orange-600', glow: 'group-hover:shadow-orange-500/20' },
  { accent: 'from-violet-500 to-fuchsia-400', soft: 'bg-violet-50', ink: 'text-violet-600', ring: 'ring-violet-100', button: 'hover:bg-violet-600', glow: 'group-hover:shadow-violet-500/20' },
  { accent: 'from-slate-600 to-slate-400', soft: 'bg-slate-100', ink: 'text-slate-600', ring: 'ring-slate-200', button: 'hover:bg-slate-700', glow: 'group-hover:shadow-slate-500/20' },
];

export const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categoryIndex = Math.max(0, Object.values(RegionCategory).indexOf(link.category));
  const theme = categoryThemes[categoryIndex] ?? categoryThemes[4];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (new Date() < TARGET_DATE) {
      event.preventDefault();
      setIsModalOpen(true);
      return;
    }
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmRedirect = () => {
    setIsModalOpen(false);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return <>
    <article role="link" tabIndex={0} aria-label={`前往${link.name}官方免試入學系統`} onClick={handleClick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleClick(event as unknown as React.MouseEvent<HTMLElement>); } }} className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white p-1 shadow-[0_10px_30px_-20px_rgba(15,23,42,.3)] transition duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${theme.glow}`}>
      <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${theme.accent}`} />
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[1.35rem] px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${theme.soft} opacity-80 blur-2xl transition duration-500 group-hover:scale-125`} />
        <div className={`relative rounded-2xl ${theme.soft} p-4 ring-1 ${theme.ring}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.14em] ${theme.ink}`}><MapPin className="h-4 w-4" />就學區入口</span>
            <span className={`rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black ${theme.ink}`}>官方系統</span>
          </div>
          <h3 className="mt-3 font-['Noto_Sans_TC'] text-3xl font-black leading-none tracking-tight text-slate-900 sm:text-[2rem]">{link.name}</h3>
        </div>

        <div className="relative mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className={`text-[10px] font-black tracking-[0.16em] ${theme.ink}`}>官方免試入學系統</p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{link.description}</p>
          <div className="mt-3 h-px bg-slate-200/70" />
          <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] font-black tracking-[0.12em] text-slate-400">服務項目</span>{link.tags.map(tag => <span key={tag} className={`rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-black ${theme.ink} ring-1 ${theme.ring}`}>#{tag}</span>)}</div>
        </div>

        <div className={`relative mt-6 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition duration-300 ${theme.button}`}>
          <span>前往網站</span><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5"><ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </div>
    </article>

    <RedirectWarningModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmRedirect} siteName={link.name} />
  </>;
};
