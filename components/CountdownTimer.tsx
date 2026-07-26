import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const EVENTS = [
  { name: '國中教育會考報名', date: '2027-03-05T08:00:00' },
  { name: '寄發准考證', date: '2027-04-10T08:00:00' },
  { name: '國中教育會考', date: '2027-05-16T08:00:00' },
  { name: '會考成績公布', date: '2027-06-05T08:00:00' },
  { name: '序位區間公告/志願選填', date: '2027-06-18T08:00:00' },
  { name: '志願選填截止', date: '2027-06-25T17:00:00' },
  { name: '免試入學放榜', date: '2027-07-07T11:00:00' },
];

export const CountdownTimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [targetEvent, setTargetEvent] = useState<{name: string, date: string} | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const nextEvent = EVENTS.find(event => new Date(event.date).getTime() > now.getTime());

      if (!nextEvent) {
        setTargetEvent(null);
        return;
      }

      setTargetEvent(nextEvent);
      const difference = new Date(nextEvent.date).getTime() - now.getTime();

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!targetEvent || !timeLeft) return null;

  return (
    <div className={`w-full animate-in fade-in slide-in-from-bottom-6 duration-700 ${compact ? '' : 'mx-auto mt-12 max-w-4xl'}`}>
        <div className={`relative border shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] backdrop-blur-xl ${compact ? 'rounded-[2rem] border-violet-100 bg-violet-50/85 p-5 shadow-[0_18px_42px_-28px_rgba(79,70,229,.25)]' : 'flex flex-col items-center justify-between gap-10 rounded-[32px] border-white/60 bg-white/55 p-8 md:flex-row'}`}>
            <div className={`flex items-center ${compact ? 'gap-3 border-b border-violet-100 pb-4' : 'w-full gap-6 border-b border-slate-200/50 pb-8 md:w-auto md:border-b-0 md:pb-0'}`}>
                <div className={`shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 ${compact ? 'rounded-2xl p-3 ring-1 ring-white' : 'rounded-3xl p-4'}`}>
                    <Timer className={compact ? 'h-5 w-5' : 'w-8 h-8'} />
                </div>
                <div className="text-left">
                    <p className={`mb-1 text-[10px] font-black tracking-widest ${compact ? 'text-indigo-600' : 'text-indigo-600'}`}>下一個重要日程</p>
                    <h3 className={`font-black tracking-tight leading-tight ${compact ? 'text-base text-slate-800' : 'text-2xl text-slate-800'}`}>
                        {targetEvent.name}
                    </h3>
                </div>
            </div>

            <div className={`flex items-center ${compact ? 'mt-4 grid grid-cols-4 gap-2' : 'gap-3 md:gap-4'}`}>
                <TimeUnit value={timeLeft.days} label="天" compact={compact} />
                {!compact && <span className="mb-6 text-3xl font-light text-slate-300">:</span>}
                <TimeUnit value={timeLeft.hours} label="時" compact={compact} />
                {!compact && <span className="mb-6 text-3xl font-light text-slate-300">:</span>}
                <TimeUnit value={timeLeft.minutes} label="分" compact={compact} />
                {!compact && <span className="mb-6 text-3xl font-light text-slate-300">:</span>}
                <TimeUnit value={timeLeft.seconds} label="秒" compact={compact} />
            </div>
        </div>
    </div>
  );
};

const TimeUnit = ({ value, label, compact = false }: { value: number, label: string, compact?: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`flex items-center justify-center border shadow-lg shadow-indigo-500/5 backdrop-blur-sm ${compact ? 'h-12 w-full rounded-xl border-violet-100 bg-white/90' : 'h-20 w-16 rounded-3xl border-white bg-white/80 md:h-24 md:w-20'}`}>
            <span className={`font-mono font-black leading-none tracking-tighter ${compact ? 'text-xl text-indigo-700' : 'text-3xl text-slate-800 md:text-4xl'}`}>
                {value.toString().padStart(2, '0')}
            </span>
        </div>
        <span className={`text-[10px] font-bold tracking-wider ${compact ? 'text-indigo-500' : 'text-slate-400'}`}>{label}</span>
    </div>
);
