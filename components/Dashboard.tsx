import React from 'react';
import { ScoreEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GRADES } from '../constants';
import { BarChart3 } from 'lucide-react';

interface DashboardProps {
  entries: ScoreEntry[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60">
        <p className="text-sm font-bold text-slate-500 mb-1">等級：{label}</p>
        <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-indigo-600 tracking-tight">
                {payload[0].value}
            </p>
            <span className="text-xs font-bold text-slate-400">筆資料</span>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  
  const calculateGradeDistribution = () => {
    const distribution: Record<string, number> = {};
    GRADES.forEach(g => distribution[g] = 0);

    entries.forEach(entry => {
        const subjects = [entry.scores.chinese, entry.scores.english, entry.scores.math, entry.scores.nature, entry.scores.social];
        subjects.forEach(grade => {
            if (distribution[grade] !== undefined) {
                distribution[grade]++;
            }
        });
    });

    return GRADES.map(grade => ({
        name: grade,
        count: distribution[grade]
    }));
  };

  const data = calculateGradeDistribution();
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f472b6', '#fb7185'];

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/60">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-800">平台成績分佈概況</h3>
            <p className="text-slate-500 text-sm mt-0.5">統計五科成績等級分佈</p>
        </div>
      </div>
      
      <div className="h-96 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
            />
            <Tooltip 
                content={<CustomTooltip />}
                cursor={{fill: '#f1f5f9', radius: 8}}
            />
            <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={48}>
                {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-indigo-50/50 rounded-2xl p-4 text-center border border-indigo-100/50">
        <p className="text-sm text-slate-600">
            <span className="font-semibold text-indigo-600">統計範圍：</span> 
            目前平台上的 {entries.length} 筆分享資料
        </p>
      </div>
    </div>
  );
};

export default Dashboard;