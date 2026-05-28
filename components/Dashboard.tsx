import React, { useMemo } from 'react';
import { ScoreEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { GRADES } from '../constants';
import { BarChart3, Users, TrendingUp, MapPin, Award, School } from 'lucide-react';

interface DashboardProps {
  entries: ScoreEntry[];
}

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60">
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

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/60">
        <p className="text-sm font-bold text-slate-600 mb-1">{payload[0].name}</p>
        <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-slate-800 tracking-tight">
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
  
  const stats = useMemo(() => {
      const totalEntries = entries.length;
      
      const avgPoints = totalEntries > 0 
        ? (entries.reduce((acc, curr) => acc + curr.totalPoints, 0) / totalEntries).toFixed(1)
        : '0';

      const regionCounts: Record<string, number> = {};
      const schoolCounts: Record<string, number> = {};
      
      entries.forEach(e => {
          regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
          schoolCounts[e.school] = (schoolCounts[e.school] || 0) + 1;
      });

      const topRegion = Object.keys(regionCounts).length > 0 
          ? Object.keys(regionCounts).reduce((a, b) => regionCounts[a] > regionCounts[b] ? a : b) 
          : '無';

      const topSchool = Object.keys(schoolCounts).length > 0 
          ? Object.keys(schoolCounts).reduce((a, b) => schoolCounts[a] > schoolCounts[b] ? a : b) 
          : '無';

      const regionData = Object.entries(regionCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
      
      const topSchoolsList = Object.entries(schoolCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

      const gradeDistribution: Record<string, number> = {};
      GRADES.forEach(g => gradeDistribution[g] = 0);
      entries.forEach(entry => {
          const subjects = [entry.scores.chinese, entry.scores.english, entry.scores.math, entry.scores.nature, entry.scores.social];
          subjects.forEach(grade => {
              if (gradeDistribution[grade] !== undefined) {
                  gradeDistribution[grade]++;
              }
          });
      });
      const barData = GRADES.map(grade => ({
          name: grade,
          count: gradeDistribution[grade]
      }));

      return { totalEntries, avgPoints, topRegion, topSchool, regionData, topSchoolsList, barData };
  }, [entries]);

  const COLORS_BAR = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f472b6', '#fb7185'];
  const COLORS_PIE = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">數據統計中心</h3>
                <p className="text-slate-500 text-sm mt-0.5">即時掌握全國落點分析與成績分佈</p>
            </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">總回報筆數</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.totalEntries}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">平均總積分</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.avgPoints}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">最熱門考區</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{stats.topRegion}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">最多回報學校</p>
                    <p className="text-[15px] sm:text-[17px] font-bold text-slate-800 leading-tight truncate w-full sm:w-auto" title={stats.topSchool}>{stats.topSchool}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grade Distribution Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    五科成績等級分佈
                </h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            content={<CustomBarTooltip />}
                            cursor={{fill: '#f1f5f9', radius: 8}}
                        />
                        <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                            {stats.barData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS_BAR[index % COLORS_BAR.length]} 
                                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Region Distribution Pie Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-fuchsia-500 rounded-full"></span>
                    各地區回報比例
                </h4>
                <div className="flex-1 min-h-[220px]">
                    {stats.regionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.regionData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.regionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            尚無資料
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Top 5 Schools List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                熱門回報學校 Top 5
            </h4>
            {stats.topSchoolsList.length > 0 ? (
                <div className="space-y-4">
                    {stats.topSchoolsList.map((school, index) => (
                        <div key={school.name} className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="font-bold text-slate-700 flex items-center gap-2">
                                        <School className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                        {school.name}
                                    </span>
                                    <span className="text-sm font-bold text-slate-500">{school.count} 筆</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${(school.count / stats.topSchoolsList[0].count) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                    尚無足夠的資料來顯示排名
                </div>
            )}
        </div>
    </div>
  );
};

export default Dashboard;