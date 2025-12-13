import React, { useState, useEffect, useRef } from 'react';
import { ScoreEntry, Region, Grade, WritingGrade } from '../types';
import { YEARS, GRADES, WRITING_GRADES, REGIONS, DEPARTMENT_GROUPS, SCHOOLS_BY_REGION } from '../constants';
import { Send, Loader2, Info, ChevronDown, User, PenTool, Search, ShieldCheck, MapPin, School, GraduationCap, Trophy, FileText, Sparkles } from 'lucide-react';

interface ScoreFormProps {
  onSubmit: (entry: Omit<ScoreEntry, 'id' | 'timestamp'>) => void;
}

const ScoreForm: React.FC<ScoreFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    year: YEARS[1],
    school: '',
    department: '',
    region: REGIONS[0],
    scores: {
      chinese: 'A' as Grade,
      english: 'A' as Grade,
      math: 'A' as Grade,
      nature: 'A' as Grade,
      social: 'A' as Grade,
      writing: 4 as WritingGrade,
    },
    totalPoints: '',
    totalCredits: '',
    notes: '',
  });

  const [selectedGroup, setSelectedGroup] = useState<string>('普通高中/綜合高中');
  const [isManualDept, setIsManualDept] = useState(false);
  const [isManualSchool, setIsManualSchool] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedGroup && !isManualDept) {
      const depts = DEPARTMENT_GROUPS[selectedGroup];
      if (depts && depts.length > 0) {
        setFormData(prev => ({ ...prev, department: depts[0] }));
      }
    }
  }, [selectedGroup, isManualDept]);

  // Reset school when region changes
  useEffect(() => {
    if (!isManualSchool) {
      setFormData(prev => ({ ...prev, school: '' }));
    }
  }, [formData.region, isManualSchool]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dirty Check
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = formData.school !== '' || formData.totalPoints !== '' || formData.notes !== '';
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, isSubmitting]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (subject: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [subject]: value },
    }));
  };

  const validateForm = () => {
      const errors: string[] = [];
      if (!formData.school.trim()) errors.push("錄取學校");
      if (!formData.department.trim()) errors.push("科系/班別");
      if (!formData.totalPoints) errors.push("總積分");
      return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = validateForm();
    if (missingFields.length > 0) {
        alert(`⚠️ 資料未填寫完整！\n請補充以下欄位：\n\n${missingFields.join('、')}`);
        return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit({
        ...formData,
        totalPoints: Number(formData.totalPoints),
        totalCredits: formData.totalCredits ? Number(formData.totalCredits) : undefined,
      });
      
      setIsSubmitting(false);
      setFormData(prev => ({...prev, school: '', notes: '', totalPoints: '', totalCredits: ''}));
      setIsManualSchool(false);
    }, 600);
  };

  const availableSchools = SCHOOLS_BY_REGION[formData.region] || [];
  const filteredSchools = availableSchools.filter(s => s.includes(formData.school));

  // Style Constants
  const sectionClass = "bg-white/40 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 border border-white/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-500";
  const labelClass = "block text-sm font-bold text-slate-600 mb-2 flex items-center gap-1.5";
  const inputClass = "w-full bg-white/70 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-indigo-400 rounded-xl py-3 px-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder:text-slate-400 font-medium appearance-none shadow-sm";
  const selectWrapperClass = "relative";
  const selectArrowClass = "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/60 text-indigo-600 text-sm font-bold shadow-sm mb-4 backdrop-blur-sm">
             <Sparkles className="w-4 h-4" />
             <span>Help Others Succeed</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
             分享你的錄取數據
          </h2>
          <p className="text-slate-500 text-lg">
             你的每一個數據，都是學弟妹升學路上的重要指引。
          </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Background Info */}
        <section className={sectionClass}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <User className="w-24 h-24 text-slate-900" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><MapPin className="w-5 h-5"/></span>
                考生背景
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                {/* Year */}
                <div className="md:col-span-3 space-y-1">
                    <label className={labelClass}>會考年份</label>
                    <div className={selectWrapperClass}>
                        <select value={formData.year} onChange={(e) => handleChange('year', Number(e.target.value))} className={`${inputClass} cursor-pointer`}>
                            {YEARS.map(y => <option key={y} value={y}>{y} 年</option>)}
                        </select>
                        <ChevronDown className={selectArrowClass} />
                    </div>
                </div>

                {/* Region */}
                <div className="md:col-span-4 space-y-1">
                    <label className={labelClass}>所屬區域</label>
                    <div className={selectWrapperClass}>
                        <select value={formData.region} onChange={(e) => handleChange('region', e.target.value)} className={`${inputClass} cursor-pointer`}>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className={selectArrowClass} />
                    </div>
                </div>

                {/* School */}
                <div className="md:col-span-5 space-y-1">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-600 flex items-center gap-1.5">錄取學校 <span className="text-rose-500">*</span></label>
                        <button type="button" onClick={() => { setIsManualSchool(!isManualSchool); if(!isManualSchool) setFormData(prev => ({...prev, school: ''})); }} className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold underline transition-colors">
                            {isManualSchool ? '返回選單' : '找不到學校？'}
                        </button>
                    </div>

                    {isManualSchool ? (
                         <input type="text" value={formData.school} onChange={(e) => handleChange('school', e.target.value)} placeholder="例：建國中學" className={inputClass} autoFocus />
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <input
                                type="text"
                                value={formData.school}
                                onChange={(e) => {
                                    handleChange('school', e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="搜尋學校..."
                                className={`${inputClass} pl-10`}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            
                            {isDropdownOpen && (
                                <div className="absolute z-30 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200">
                                    {filteredSchools.length > 0 ? (
                                        filteredSchools.map(school => (
                                            <button
                                                key={school}
                                                type="button"
                                                onClick={() => {
                                                    handleChange('school', school);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-slate-700 text-sm font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2"
                                            >
                                                <School className="w-3.5 h-3.5 text-indigo-400" />
                                                {school}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-slate-400 text-sm flex flex-col items-center gap-2 text-center">
                                            <span>找不到符合的學校</span>
                                            <button 
                                                type="button" 
                                                onClick={() => { setIsManualSchool(true); setIsDropdownOpen(false); }}
                                                className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-full"
                                            >
                                                切換為手動輸入
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Department Row */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100/50 mt-2">
                     {/* Group */}
                     <div className="space-y-1">
                        <label className={labelClass}>群別分類</label>
                        <div className={selectWrapperClass}>
                            <select value={selectedGroup} onChange={(e) => { setSelectedGroup(e.target.value); if (e.target.value !== 'custom') setIsManualDept(false); }} className={`${inputClass} cursor-pointer`}>
                                {Object.keys(DEPARTMENT_GROUPS).map(group => <option key={group} value={group}>{group}</option>)}
                                <option value="custom">其他 / 自行輸入</option>
                            </select>
                            <ChevronDown className={selectArrowClass} />
                        </div>
                     </div>

                     {/* Department */}
                     <div className="space-y-1">
                        <div className="flex justify-between items-center mb-2">
                             <label className={labelClass}>科系/班別 <span className="text-rose-500">*</span></label>
                             {selectedGroup !== 'custom' && !isManualDept && (
                                <button type="button" onClick={() => { setIsManualDept(true); setFormData(prev => ({...prev, department: ''})) }} className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold underline">自行輸入</button>
                            )}
                            {isManualDept && selectedGroup !== 'custom' && (
                                    <button type="button" onClick={() => setIsManualDept(false)} className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold underline">選單選擇</button>
                            )}
                        </div>
                        
                        {selectedGroup === 'custom' || isManualDept ? (
                            <input type="text" value={formData.department} onChange={(e) => handleChange('department', e.target.value)} placeholder="輸入科系名稱" className={inputClass} />
                        ) : (
                            <div className={selectWrapperClass}>
                                <select value={formData.department} onChange={(e) => handleChange('department', e.target.value)} className={`${inputClass} cursor-pointer`}>
                                    {DEPARTMENT_GROUPS[selectedGroup]?.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                                <ChevronDown className={selectArrowClass} />
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </section>

        {/* Section 2: Scores */}
        <section className={sectionClass}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-24 h-24 text-amber-500" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                <span className="bg-amber-100 p-2 rounded-lg text-amber-600"><GraduationCap className="w-5 h-5"/></span>
                會考成績
            </h3>

            <div className="bg-white/50 rounded-2xl p-4 border border-slate-100 mb-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {(['chinese', 'english', 'math', 'nature', 'social'] as const).map(subject => (
                    <div key={subject} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            {subject === 'chinese' ? '國文' : subject === 'english' ? '英文' : subject === 'math' ? '數學' : subject === 'nature' ? '自然' : '社會'}
                        </label>
                        <div className="relative group">
                            <select 
                                value={formData.scores[subject]} 
                                onChange={(e) => handleScoreChange(subject, e.target.value)} 
                                className="w-full h-14 rounded-xl border-2 border-slate-100 hover:border-indigo-300 focus:border-indigo-500 text-center font-mono font-black text-xl text-slate-700 bg-white shadow-sm appearance-none cursor-pointer transition-all outline-none"
                            >
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-500 rounded-xl"></div>
                        </div>
                    </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest text-center">
                            作文
                        </label>
                        <div className="relative group">
                            <select 
                                value={formData.scores.writing} 
                                onChange={(e) => handleScoreChange('writing', Number(e.target.value))} 
                                className="w-full h-14 rounded-xl border-2 border-rose-100 hover:border-rose-300 focus:border-rose-500 text-center font-mono font-black text-xl text-rose-500 bg-white shadow-sm appearance-none cursor-pointer transition-all outline-none"
                            >
                                {WRITING_GRADES.map(g => <option key={g} value={g}>{g} 級</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <label className={labelClass}>
                        總積分 <span className="text-rose-500">*</span>
                        <div className="group relative ml-auto">
                            <Info className="w-3.5 h-3.5 text-indigo-400 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                請依照各就學區的積分計算方式填寫 (例如基北區滿分36)
                            </div>
                        </div>
                    </label>
                    <input type="number" step="0.1" value={formData.totalPoints} onChange={(e) => handleChange('totalPoints', e.target.value)} placeholder="例：97.5" className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-500 rounded-xl py-3 px-4 text-2xl font-black text-indigo-600 outline-none placeholder:text-indigo-200 transition-all text-center" />
                </div>
                
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                     <label className={labelClass}>
                        總積點 <span className="text-slate-400 font-normal text-xs ml-auto">(選填)</span>
                    </label>
                    <input type="number" step="0.1" value={formData.totalCredits} onChange={(e) => handleChange('totalCredits', e.target.value)} placeholder="例：28" className="w-full bg-white border-2 border-amber-200 focus:border-amber-500 rounded-xl py-3 px-4 text-2xl font-black text-amber-600 outline-none placeholder:text-amber-200 transition-all text-center" />
                </div>
            </div>
        </section>

        {/* Section 3: Notes & Verify */}
        <section className={sectionClass}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText className="w-24 h-24 text-slate-900" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><PenTool className="w-5 h-5"/></span>
                經驗傳承
            </h3>

            <div className="relative z-10 space-y-6">
                <div>
                    <label className={labelClass}>附加說明 (選填)</label>
                    <textarea 
                        rows={4} 
                        value={formData.notes} 
                        onChange={(e) => handleChange('notes', e.target.value)} 
                        placeholder="多虧了... / 運氣不錯... / 建議學弟妹..." 
                        className={`${inputClass} resize-none leading-relaxed h-32`} 
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform active:scale-[0.99] flex justify-center items-center gap-3 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> 正在上傳數據...</>
                        ) : (
                            <><Send className="w-5 h-5" /> 確認提交分享</>
                        )}
                    </button>
                </div>
            </div>
        </section>

      </form>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => !isSubmitting && setIsConfirmModalOpen(false)}
           />
           
           {/* Modal Card */}
           <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-slate-800 p-6 text-center">
                 <h3 className="text-white text-xl font-bold flex justify-center items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    確認資料正確
                 </h3>
                 <p className="text-slate-400 text-sm mt-1">請再次核對，送出後無法修改</p>
              </div>

              <div className="p-6 space-y-5">
                 <div className="text-center space-y-1">
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-1">
                        {formData.year} 年 • {formData.region}
                    </div>
                    <h4 className="text-2xl font-black text-slate-800 leading-tight">{formData.school}</h4>
                    <p className="text-slate-500 font-medium">{formData.department}</p>
                 </div>

                 {/* Mini Score Grid */}
                 <div className="grid grid-cols-6 gap-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {Object.entries(formData.scores).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">
                                {key === 'chinese' ? '國' : key === 'english' ? '英' : key === 'math' ? '數' : key === 'nature' ? '自' : key === 'social' ? '社' : '作'}
                            </div>
                            <div className={`font-mono font-black text-lg ${key === 'writing' ? 'text-rose-500' : 'text-slate-700'}`}>
                                {value}{key === 'writing' ? '級' : ''}
                            </div>
                        </div>
                    ))}
                 </div>

                 <div className="flex gap-4">
                     <div className="flex-1 bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col items-center">
                        <span className="text-xs font-bold text-indigo-400 uppercase">總積分</span>
                        <span className="text-2xl font-black text-indigo-600">{formData.totalPoints}</span>
                     </div>
                     {formData.totalCredits && (
                        <div className="flex-1 bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col items-center">
                            <span className="text-xs font-bold text-amber-400 uppercase">總積點</span>
                            <span className="text-2xl font-black text-amber-600">{formData.totalCredits}</span>
                        </div>
                     )}
                 </div>
                 
                 {formData.notes && (
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                        "{formData.notes}"
                    </div>
                 )}
              </div>

              <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50/50">
                 <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                 >
                    返回修改
                 </button>
                 <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                    確認送出 <Send className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScoreForm;