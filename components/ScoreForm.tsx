import React, { useState, useEffect, useRef } from 'react';
import { ScoreEntry, Region, Grade, WritingGrade, StudentIdentity } from '../types';
import { YEARS, GRADES, WRITING_GRADES, REGIONS, DEPARTMENT_GROUPS, SCHOOLS_BY_REGION } from '../constants';
import { calculateRegionalScore } from '../utils/scoreCalculator';
import { ENTRY_OPEN_AT_LABEL, isEntryYearLocked } from '../utils/entryOpenLock';
import { Send, Loader2, ChevronDown, User, PenTool, Search, ShieldCheck, MapPin, School, GraduationCap, Trophy, FileText, Sparkles, Lock } from 'lucide-react';

interface ScoreFormProps {
  onSubmit: (entry: Omit<ScoreEntry, 'id' | 'timestamp'>) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const STUDENT_IDENTITIES: StudentIdentity[] = [
  '一般生',
  '低收入戶生',
  '中低收入戶生',
  '直系血親尊親屬支領失業給付者',
  '身心障礙生',
  '原住民生',
  '僑生',
  '蒙藏生',
  '政府派赴國外工作人員子女',
  '境外優秀科學技術人才子女',
  '退伍軍人',
];

const ScoreForm: React.FC<ScoreFormProps> = ({ onSubmit, onDirtyChange }) => {
  const [formData, setFormData] = useState({
    year: YEARS[0],
    school: '',
    department: '',
    studentIdentity: '一般生' as StudentIdentity,
    region: REGIONS[0],
    scores: {
      chinese: '' as Grade,
      english: '' as Grade,
      math: '' as Grade,
      nature: '' as Grade,
      social: '' as Grade,
      writing: '' as unknown as WritingGrade,
    },
    totalPoints: '',
    totalCredits: '',
    notes: '',
  });

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isManualDept, setIsManualDept] = useState(false);
  const [isManualSchool, setIsManualSchool] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStudentIdentityConfirmOpen, setIsStudentIdentityConfirmOpen] = useState(false);
  const [pendingStudentIdentity, setPendingStudentIdentity] = useState<StudentIdentity | null>(null);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  const [activeDeptGroup, setActiveDeptGroup] = useState('');
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');

  const showLockState = isEntryYearLocked(formData.year);

  // Auto-calculate total points & credits based on region
  useEffect(() => {
    const { chinese, english, math, nature, social, writing } = formData.scores;
    const hasCompleteScores =
      [chinese, english, math, nature, social].every(Boolean) &&
      writing !== ('' as unknown as WritingGrade);

    if (!hasCompleteScores) {
      setFormData(prev => ({
        ...prev,
        totalPoints: '',
        totalCredits: ''
      }));
      return;
    }

    const { points, credits } = calculateRegionalScore(formData.region, formData.scores);
    setFormData(prev => ({
      ...prev,
      totalPoints: points,
      totalCredits: credits
    }));
  }, [formData.region, formData.scores]);

  // Reset school when region changes
  useEffect(() => {
    if (!isManualSchool) {
      setFormData(prev => ({ ...prev, school: '' }));
    }
  }, [formData.region, isManualSchool]);

  const hasUnsavedInput = React.useMemo(() => {
    return (
      formData.year !== YEARS[0] ||
      formData.region !== REGIONS[0] ||
      formData.school.trim() !== '' ||
      formData.department.trim() !== '' ||
      formData.studentIdentity !== '一般生' ||
      formData.totalPoints !== '' ||
      formData.totalCredits !== '' ||
      formData.notes.trim() !== '' ||
      Object.values(formData.scores).some(score => String(score) !== '')
    );
  }, [formData]);

  useEffect(() => {
    onDirtyChange?.(hasUnsavedInput && !isSubmitting);
  }, [hasUnsavedInput, isSubmitting, onDirtyChange]);

  // Dirty Check
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedInput && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedInput, isSubmitting]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStudentIdentityChange = (identity: StudentIdentity) => {
    if (identity === '一般生') {
      setPendingStudentIdentity(null);
      setIsStudentIdentityConfirmOpen(false);
      handleChange('studentIdentity', identity);
      return;
    }

    setPendingStudentIdentity(identity);
    setIsStudentIdentityConfirmOpen(true);
  };

  const confirmStudentIdentityChange = () => {
    if (pendingStudentIdentity) {
      handleChange('studentIdentity', pendingStudentIdentity);
    }
    setPendingStudentIdentity(null);
    setIsStudentIdentityConfirmOpen(false);
  };

  const cancelStudentIdentityChange = () => {
    setPendingStudentIdentity(null);
    setIsStudentIdentityConfirmOpen(false);
  };

  const allDepartments = React.useMemo(() => {
    return Array.from(new Set(Object.values(DEPARTMENT_GROUPS).flat()));
  }, []);

  const departmentToGroup = React.useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(DEPARTMENT_GROUPS).forEach(([group, departments]) => {
      departments.forEach(department => {
        if (!map.has(department)) {
          map.set(department, group);
        }
      });
    });
    return map;
  }, []);

  const getGroupByDepartment = (department: string) => {
    const normalizedDepartment = department.trim();
    if (!normalizedDepartment) return '';

    const exactGroup = departmentToGroup.get(normalizedDepartment);
    if (exactGroup) return exactGroup;

    const fuzzyMatch = allDepartments.find(item =>
      item.includes(normalizedDepartment) || normalizedDepartment.includes(item)
    );
    return fuzzyMatch ? departmentToGroup.get(fuzzyMatch) || 'custom' : 'custom';
  };

  const handleDepartmentChange = (department: string, manual = false) => {
    const nextGroup = getGroupByDepartment(department);
    setFormData(prev => ({ ...prev, department }));
    setSelectedGroup(nextGroup);
    setIsManualDept(manual || nextGroup === 'custom');
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
      if (Object.values(formData.scores).some(score => String(score) === '')) errors.push("完整會考成績");
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
      setFormData(prev => ({
        ...prev,
        school: '',
        department: '',
        studentIdentity: '一般生',
        notes: '',
        totalPoints: '',
        totalCredits: '',
      }));
      setSelectedGroup('');
      setIsManualDept(false);
      setIsManualSchool(false);
    }, 600);
  };

  const availableSchools = SCHOOLS_BY_REGION[formData.region] || [];
  const filteredSchools = availableSchools.filter(s => s.includes(searchSchoolTerm));
  const availableGroups = Object.keys(DEPARTMENT_GROUPS);
  const filteredGroups = availableGroups.filter(g => g.includes(groupSearchTerm));
  const availableDepts = allDepartments;
  const filteredDepts = availableDepts.filter(d => d.includes(deptSearchTerm));
  const currentDeptGroup = activeDeptGroup || (selectedGroup && selectedGroup !== 'custom' ? selectedGroup : availableGroups[0]);
  const groupedDeptResults = availableGroups
    .map(group => {
      const departments = DEPARTMENT_GROUPS[group] || [];
      const isGroupMatched = group.includes(deptSearchTerm);
      const matchedDepartments = deptSearchTerm
        ? departments.filter(dept => isGroupMatched || dept.includes(deptSearchTerm))
        : departments;

      return { group, departments: matchedDepartments };
    })
    .filter(item => item.departments.length > 0);
  const activeGroupDepartments = DEPARTMENT_GROUPS[currentDeptGroup] || [];
  const filteredRegions = REGIONS.filter(r => r.includes(regionSearchTerm));

  // Style Constants
  const sectionClass = "bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-100 shadow-[0_16px_50px_-28px_rgba(15,23,42,0.3)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_24px_60px_-30px_rgba(79,70,229,0.28)]";

  const getGradeSelectStyle = (grade: string) => {
    if (grade === 'A++') return 'border-amber-200 text-amber-600 bg-gradient-to-b from-amber-50 to-orange-50';
    if (grade === 'A+') return 'border-emerald-200 text-emerald-600 bg-gradient-to-b from-emerald-50 to-teal-50';
    if (grade === 'A') return 'border-indigo-200 text-indigo-600 bg-gradient-to-b from-indigo-50 to-blue-50';
    if (grade.startsWith('B')) return 'border-slate-200 text-slate-700 bg-slate-50';
    return 'border-gray-100 text-gray-500 bg-gray-50';
  };

  const getWritingSelectStyle = (grade: number) => {
    if (grade === 6) return 'border-rose-200 text-rose-600 bg-gradient-to-b from-rose-50 to-pink-50';
    if (grade === 5) return 'border-fuchsia-200 text-fuchsia-600 bg-gradient-to-b from-fuchsia-50 to-purple-50';
    return 'border-slate-200 text-slate-700 bg-slate-50';
  };

  const labelClass = "block text-[13px] font-black text-slate-600 mb-2 flex items-center gap-1.5";
  const inputClass = "w-full bg-slate-50/80 hover:bg-white focus:bg-white border-2 border-slate-100 focus:border-indigo-400 rounded-2xl py-3.5 px-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100/70 transition-all duration-300 placeholder:text-slate-400 font-semibold appearance-none";
  const selectWrapperClass = "relative";
  const selectArrowClass = "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4";

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-sky-50 px-6 py-8 text-slate-900 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.35)] sm:rounded-[2.5rem] sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-indigo-100/80 blur-[70px]"></div>
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-emerald-100/70 blur-[80px]"></div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(99,102,241,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.12)_1px,transparent_1px)] [background-size:36px_36px]"></div>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-xs font-black text-indigo-600 shadow-sm backdrop-blur-md">
                 <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                 <span>你的經驗，會成為別人的方向</span>
              </div>
              <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                 分享你的
                 <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">錄取數據</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm font-bold leading-7 text-slate-600 sm:text-base">
                 匿名分享會考成績與錄取結果，讓學弟妹少一點資訊焦慮，多一份選擇的底氣。
              </p>
              <div className="mt-4 flex max-w-2xl items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs font-bold leading-6 text-amber-700 shadow-sm backdrop-blur-md sm:text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p>
                  請協助回報正確資料：請依照成績單與錄取結果如實填寫，避免測試、亂填或誇大資料；也請勿留下姓名、准考證號、電話等個人資訊。
                </p>
              </div>
            </div>

          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Background Info */}
        <section className={sectionClass}>
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-indigo-50"></div>
            <div className="absolute top-5 right-6 opacity-[0.08]">
                <User className="w-20 h-20 text-indigo-900" />
            </div>
            
            <div className="relative z-10 mb-7 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><MapPin className="h-5 w-5"/></span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Step 01</span>
                  <h3 className="text-xl font-black text-slate-800">考生背景</h3>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                {/* Year */}
                <div className="md:col-span-3 space-y-1">
                    <label htmlFor="entry-year" className={labelClass}>會考年份</label>
                    <div className={selectWrapperClass}>
                        <select id="entry-year" value={formData.year} onChange={(e) => handleChange('year', Number(e.target.value))} className={`${inputClass} cursor-pointer`}>
                            {YEARS.map(y => <option key={y} value={y}>{y} 年</option>)}
                        </select>
                        <ChevronDown className={selectArrowClass} />
                    </div>
                </div>

                {showLockState ? (
                    <div className="md:col-span-9 relative overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 animate-in fade-in duration-500">
                        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border-[22px] border-indigo-100/60"></div>
                        <div className="relative z-10 flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <Lock className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">
                                    Coming soon
                                </div>
                                <h4 className="text-xl font-black tracking-tight text-slate-900">115 年分享尚未開放</h4>
                                <p className="mt-1 text-sm font-medium text-slate-500">會考放榜後即可回來分享你的錄取結果。</p>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-indigo-100 bg-white/90 px-5 py-3 shadow-sm">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-400">開放時間</span>
                                <strong className="mt-1 block whitespace-nowrap text-base font-black text-indigo-700">{ENTRY_OPEN_AT_LABEL}</strong>
                            </div>
                        </div>
                    </div>
                ) : (
                <>
                {/* Region */}
                <div className="md:col-span-4 space-y-1">
                    <label id="entry-region-label" className={labelClass}>所屬區域</label>
                    <button
                        type="button"
                        onClick={() => {
                            setRegionSearchTerm('');
                            setIsRegionModalOpen(true);
                        }}
                        aria-labelledby="entry-region-label"
                        aria-haspopup="dialog"
                        aria-expanded={isRegionModalOpen}
                        className={`${inputClass} text-left flex items-center justify-between group/btn`}
                    >
                        <span className={formData.region ? 'text-slate-700' : 'text-slate-400'}>
                            {formData.region || '點擊選擇區域...'}
                        </span>
                        <Search className="w-4 h-4 text-slate-400 group-hover/btn:text-indigo-400 transition-colors" />
                    </button>
                </div>

                {/* School */}
                <div className="md:col-span-5 space-y-1">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="entry-school" id="entry-school-label" className="text-sm font-bold text-slate-600 flex items-center gap-1.5">錄取學校 <span className="text-rose-500">*</span></label>
                        <button type="button" onClick={() => { setIsManualSchool(!isManualSchool); if(!isManualSchool) setFormData(prev => ({...prev, school: ''})); }} className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold underline transition-colors">
                            {isManualSchool ? '返回選單' : '找不到學校？'}
                        </button>
                    </div>

                    {isManualSchool ? (
                         <input id="entry-school" type="text" value={formData.school} onChange={(e) => handleChange('school', e.target.value)} placeholder="例：建國中學" className={inputClass} autoFocus aria-required="true" />
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchSchoolTerm('');
                                setIsSchoolModalOpen(true);
                            }}
                            aria-labelledby="entry-school-label"
                            aria-haspopup="dialog"
                            aria-expanded={isSchoolModalOpen}
                            className={`${inputClass} text-left flex items-center justify-between group/btn`}
                        >
                            <span className={formData.school ? 'text-slate-700' : 'text-slate-400'}>
                                {formData.school || '點擊選擇學校...'}
                            </span>
                            <Search className="w-4 h-4 text-slate-400 group-hover/btn:text-indigo-400 transition-colors" />
                        </button>
                    )}
                </div>

                {/* Student Identity */}
                <div className="md:col-span-12 space-y-1">
                    <label htmlFor="entry-student-identity" className={labelClass}>考生身分</label>
                    <div className={selectWrapperClass}>
                        <select
                            id="entry-student-identity"
                            value={formData.studentIdentity}
                            onChange={(e) => handleStudentIdentityChange(e.target.value as StudentIdentity)}
                            className={`${inputClass} cursor-pointer`}
                        >
                            {STUDENT_IDENTITIES.map(identity => (
                                <option key={identity} value={identity}>{identity}</option>
                            ))}
                        </select>
                        <ChevronDown className={selectArrowClass} />
                    </div>
                </div>
                
                {/* Department Row */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100/50 mt-2">
                     {/* Department */}
                     <div className="space-y-1">
                        <div className="mb-2 flex min-h-[20px] items-center justify-between">
                             <label htmlFor="entry-department" id="entry-department-label" className="flex items-center gap-1.5 text-[13px] font-black text-slate-600">科系/班別 <span className="text-rose-500">*</span></label>
                             {!isManualDept && (
                                <button type="button" onClick={() => { setIsManualDept(true); handleDepartmentChange('', true); }} className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold underline">自行輸入</button>
                            )}
                            {isManualDept && (
                                    <button type="button" onClick={() => setIsManualDept(false)} className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold underline">選單選擇</button>
                            )}
                        </div>
                        
                        {isManualDept ? (
                            <input id="entry-department" type="text" value={formData.department} onChange={(e) => handleDepartmentChange(e.target.value, true)} placeholder="輸入科系名稱" className={inputClass} aria-required="true" />
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setDeptSearchTerm('');
                                    setIsDeptModalOpen(true);
                                }}
                                aria-labelledby="entry-department-label"
                                aria-haspopup="dialog"
                                aria-expanded={isDeptModalOpen}
                                className={`${inputClass} text-left flex items-center justify-between group/btn`}
                            >
                                <span className={formData.department ? 'text-slate-700' : 'text-slate-400'}>
                                    {formData.department || '點擊選擇科系...'}
                                </span>
                                <Search className="w-4 h-4 text-slate-400 group-hover/btn:text-indigo-400 transition-colors" />
                            </button>
                        )}
                     </div>

                     {/* Group */}
                     <div className="space-y-1">
                        <div className="mb-2 flex min-h-[20px] items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-600">群別分類</span>
                            <span className="text-[11px] font-semibold text-slate-400">自動判斷</span>
                        </div>
                        <div className={`${inputClass} flex items-center justify-between bg-slate-50 text-left`} role="status" aria-live="polite">
                            <span className={selectedGroup ? 'text-slate-700' : 'text-slate-400'}>
                                {selectedGroup === 'custom' ? '其他 / 自行輸入' : selectedGroup || '選擇科系後自動帶入'}
                            </span>
                            <ShieldCheck className={`h-4 w-4 ${selectedGroup ? 'text-emerald-500' : 'text-slate-300'}`} />
                        </div>
                     </div>
                </div>
                </>
                )}
            </div>
        </section>

        {!showLockState && (
        <>
        {/* Section 2: Scores */}
        <section className={sectionClass}>
             <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-50"></div>
             <div className="absolute top-5 right-6 opacity-[0.1]">
                <Trophy className="w-20 h-20 text-amber-600" />
             </div>

            <div className="relative z-10 mb-7 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200"><GraduationCap className="h-5 w-5"/></span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">Step 02</span>
                  <h3 className="text-xl font-black text-slate-800">會考成績</h3>
                </div>
            </div>

            <div className="relative z-10 mb-6 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-3 sm:p-5">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
                    {(['chinese', 'english', 'math', 'nature', 'social'] as const).map(subject => (
                    <div key={subject} className="flex flex-col gap-1.5">
                        <label htmlFor={`score-${subject}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            {subject === 'chinese' ? '國文' : subject === 'english' ? '英文' : subject === 'math' ? '數學' : subject === 'nature' ? '自然' : '社會'}
                        </label>
                        <div className="relative group">
                            <select 
                                id={`score-${subject}`}
                                value={formData.scores[subject]} 
                                onChange={(e) => handleScoreChange(subject, e.target.value)} 
                                className={`w-full h-14 rounded-xl border-2 text-center font-mono font-black text-xl shadow-sm appearance-none cursor-pointer transition-all outline-none focus:ring-4 focus:ring-indigo-100 ${getGradeSelectStyle(formData.scores[subject])}`}
                            >
                                <option value="" disabled>請選擇</option>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-500 rounded-xl"></div>
                        </div>
                    </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                         <label htmlFor="score-writing" className="text-[10px] font-bold text-rose-400 uppercase tracking-widest text-center">
                            作文
                        </label>
                        <div className="relative group">
                            <select 
                                id="score-writing"
                                value={formData.scores.writing} 
                                onChange={(e) => handleScoreChange('writing', Number(e.target.value))} 
                                className={`w-full h-14 rounded-xl border-2 text-center font-mono font-black text-xl shadow-sm appearance-none cursor-pointer transition-all outline-none focus:ring-4 focus:ring-rose-100 ${getWritingSelectStyle(formData.scores.writing)}`}
                            >
                                <option value="" disabled>請選擇</option>
                                {WRITING_GRADES.map(g => <option key={g} value={g}>{g} 級</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                系統會依各區計分方式自動帶入，亦可依成績單自行修改
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="rounded-[1.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
                    <label htmlFor="total-points" className={labelClass}>
                        總積分
                    </label>
                    <input
                        id="total-points"
                        type="number"
                        step="0.1"
                        value={formData.totalPoints}
                        onChange={(e) => handleChange('totalPoints', e.target.value)}
                        aria-label="總積分"
                        className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-500 rounded-xl py-3 px-4 text-2xl font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-center"
                    />
                </div>
                
                <div className="rounded-[1.5rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
                     <label htmlFor="total-credits" className={labelClass}>
                        總積點
                     </label>
                    <input
                        id="total-credits"
                        type="number"
                        step="0.1"
                        value={formData.totalCredits}
                        onChange={(e) => handleChange('totalCredits', e.target.value)}
                        aria-label="總積點"
                        placeholder="此區不使用積點"
                        className="w-full bg-white border-2 border-amber-200 focus:border-amber-500 rounded-xl py-3 px-4 text-2xl font-black text-amber-600 outline-none focus:ring-4 focus:ring-amber-100 transition-all placeholder:text-sm placeholder:font-medium placeholder:text-amber-300 text-center"
                    />
                </div>
            </div>
        </section>

        {/* Section 3: Notes & Verify */}
        <section className={sectionClass}>
             <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-50"></div>
             <div className="absolute top-5 right-6 opacity-[0.08]">
                <FileText className="w-20 h-20 text-emerald-700" />
             </div>

            <div className="relative z-10 mb-7 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200"><PenTool className="h-5 w-5"/></span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500">Step 03</span>
                  <h3 className="text-xl font-black text-slate-800">經驗傳承</h3>
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                <div>
                    <label htmlFor="entry-notes" className={labelClass}>附加說明 (選填)</label>
                    <textarea 
                        id="entry-notes"
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
                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#11132b] px-6 py-4 font-black text-white shadow-xl shadow-indigo-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-300/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-20"></div>
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> 正在上傳數據...</>
                        ) : (
                            <><Send className="w-5 h-5" /> 確認提交分享</>
                        )}
                    </button>
                </div>
            </div>
        </section>
        </>
        )}

      </form>

      {/* Student Identity Confirmation Modal */}
      {isStudentIdentityConfirmOpen && pendingStudentIdentity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
           <div
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={cancelStudentIdentityChange}
           />

           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="student-identity-confirm-title"
             className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
           >
              <div className="relative overflow-hidden bg-[#11132b] px-6 py-6 text-white">
                 <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-400/25 blur-3xl"></div>
                 <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"></div>

                 <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-amber-200 ring-1 ring-white/15">
                       <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Identity check</p>
                       <h3 id="student-identity-confirm-title" className="mt-1 text-2xl font-black tracking-tight">確認考生身分</h3>
                       <p className="mt-1 text-xs font-medium text-slate-300">特殊身分送出前需要再次確認。</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 p-5 text-center sm:p-6">
                 <span className="inline-flex max-w-full items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-3 text-base font-black text-amber-700 shadow-sm shadow-amber-100">
                    {pendingStudentIdentity}
                 </span>

                 <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
                    <p className="text-sm font-bold leading-6 text-slate-700">
                       請確認這是你的實際考生身分。
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                       特殊身分可能影響錄取結果判讀，若選錯會讓後續考生參考時產生誤差。
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-white/95 p-4 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.45)]">
                 <button
                    type="button"
                    onClick={cancelStudentIdentityChange}
                    className="rounded-2xl border border-slate-200 bg-white py-3 font-black text-slate-600 transition-colors hover:bg-slate-50"
                 >
                    返回
                 </button>
                 <button
                    type="button"
                    onClick={confirmStudentIdentityChange}
                    className="rounded-2xl bg-amber-500 py-3 font-black text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 active:scale-95"
                 >
                    確認選擇
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => !isSubmitting && setIsConfirmModalOpen(false)}
           />
           
           {/* Modal Card */}
           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="confirm-entry-title"
             className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200 sm:rounded-[2rem]"
           >
              <div className="relative shrink-0 overflow-hidden bg-[#11132b] px-4 py-3 text-white sm:px-6 sm:py-4">
                 <div className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl"></div>
                 <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"></div>

                 <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/15">
                       <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200">Final check</p>
                       <h3 id="confirm-entry-title" className="text-xl font-black tracking-tight sm:text-2xl">確認資料正確</h3>
                       <p className="text-xs font-medium text-slate-300">請再次核對，送出後無法修改。</p>
                    </div>
                 </div>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3 sm:space-y-3 sm:p-4">
                 <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-3 sm:p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                       <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-black text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                          <MapPin className="h-3.5 w-3.5" />
                          {formData.region}
                       </span>
                       <span className="inline-flex rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                          {formData.year} 年
                       </span>
                       <span className="inline-flex rounded-lg bg-white px-2 py-1 text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-slate-200">
                          {formData.studentIdentity}
                       </span>
                    </div>

                    <h4 className="truncate text-lg font-black leading-tight tracking-tight text-slate-900 sm:text-xl">{formData.school}</h4>
                    <div className="mt-2 flex max-w-full items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 sm:text-sm">
                       <School className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                       <span className="min-w-0 truncate">{formData.department}</span>
                    </div>
                 </section>

                 <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                       <h5 className="text-xs font-black text-slate-700 sm:text-sm">會考成績</h5>
                       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Scores</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                       {(['chinese', 'english', 'math', 'nature', 'social', 'writing'] as const).map((key) => {
                           const isWriting = key === 'writing';
                           const val = formData.scores[key] as any;
                           let boxClass = 'border-slate-200 bg-slate-50 text-slate-700';
                           if (isWriting) {
                               if (val === 6) boxClass = 'border-rose-200 bg-rose-50 text-rose-600';
                               else if (val === 5) boxClass = 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600';
                           } else {
                               if (val === 'A++') boxClass = 'border-amber-200 bg-amber-50 text-amber-600';
                               else if (val === 'A+') boxClass = 'border-emerald-200 bg-emerald-50 text-emerald-600';
                               else if (val === 'A') boxClass = 'border-indigo-200 bg-indigo-50 text-indigo-600';
                           }

                           return (
                               <div key={key} className={`rounded-xl border px-1 py-2 text-center ${boxClass}`}>
                                  <div className="mb-1 text-[9px] font-black leading-none opacity-60">
                                      {key === 'chinese' ? '國' : key === 'english' ? '英' : key === 'math' ? '數' : key === 'nature' ? '自' : key === 'social' ? '社' : '作'}
                                  </div>
                                  <div className="whitespace-nowrap font-mono text-sm font-black leading-none sm:text-base">
                                      {val}{isWriting ? '級' : ''}
                                  </div>
                               </div>
                           );
                       })}
                    </div>
                 </section>

                 <section className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">總積分</span>
                       <strong className="block text-2xl font-black tracking-tight text-indigo-700 sm:text-3xl">{formData.totalPoints}</strong>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">總積點</span>
                       <strong className="block text-2xl font-black tracking-tight text-amber-600 sm:text-3xl">{formData.totalCredits || '—'}</strong>
                    </div>
                 </section>

                 {formData.notes && (
                    <section className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                       <h5 className="mb-1 text-xs font-black text-slate-700">附加說明</h5>
                       <p className="whitespace-pre-wrap break-words text-xs font-medium leading-5 text-slate-600">{formData.notes}</p>
                    </section>
                 )}
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 bg-white/95 p-3 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.45)]">
                 <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 sm:py-3"
                 >
                    返回修改
                 </button>
                 <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 sm:py-3"
                 >
                    確認送出 <Send className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* School Selection Modal */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => setIsSchoolModalOpen(false)}
           />
           
           {/* Modal Card */}
           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="school-modal-title"
             className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
           >
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                 <h3 id="school-modal-title" className="sr-only">選擇錄取學校</h3>
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchSchoolTerm}
                        onChange={(e) => setSearchSchoolTerm(e.target.value)}
                        placeholder={`搜尋 ${formData.region} 的學校...`}
                        aria-label="搜尋學校"
                        className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-slate-400"
                    />
                 </div>
                 <button 
                    type="button"
                    onClick={() => setIsSchoolModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 font-medium"
                 >
                    取消
                 </button>
              </div>

              <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200 flex-1">
                 {filteredSchools.length > 0 ? (
                     filteredSchools.map(school => (
                         <button
                             key={school}
                             type="button"
                             onClick={() => {
                                 handleChange('school', school);
                                 setIsSchoolModalOpen(false);
                             }}
                             className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                         >
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <School className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                                 </div>
                                 <span className="group-hover:text-indigo-700">{school}</span>
                             </div>
                         </button>
                     ))
                 ) : (
                     <div className="px-4 py-12 text-slate-400 text-sm flex flex-col items-center gap-3 text-center">
                         <div className="p-4 bg-slate-50 rounded-full">
                            <Search className="w-6 h-6 text-slate-300" />
                         </div>
                         <p>找不到符合「{searchSchoolTerm}」的學校</p>
                         <button 
                             type="button" 
                             onClick={() => { 
                                 setIsManualSchool(true);
                                 handleChange('school', searchSchoolTerm);
                                 setIsSchoolModalOpen(false); 
                             }}
                             className="mt-2 text-white font-bold text-sm bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                         >
                             手動輸入「{searchSchoolTerm}」
                         </button>
                     </div>
                 )}
              </div>
           </div>
        </div>
      )}
      
      {/* Group Selection Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => setIsGroupModalOpen(false)}
           />
           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="group-modal-title"
             className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
           >
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                 <h3 id="group-modal-title" className="sr-only">選擇群別分類</h3>
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={groupSearchTerm}
                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                        placeholder="搜尋群別..."
                        aria-label="搜尋群別"
                        className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-slate-400"
                    />
                 </div>
                 <button 
                    type="button"
                    onClick={() => setIsGroupModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 font-medium"
                 >
                    取消
                 </button>
              </div>

              <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200 flex-1">
                 {filteredGroups.length > 0 ? (
                     <>
                     {filteredGroups.map(group => (
                         <button
                             key={group}
                             type="button"
                             onClick={() => {
                                 setSelectedGroup(group);
                                 if (group !== 'custom') setIsManualDept(false);
                                 setIsGroupModalOpen(false);
                             }}
                             className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                         >
                             <div className="flex items-center gap-3">
                                 <span className="group-hover:text-indigo-700">{group}</span>
                             </div>
                         </button>
                     ))}
                     <button
                         type="button"
                         onClick={() => {
                             setSelectedGroup('custom');
                             setIsGroupModalOpen(false);
                         }}
                         className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                     >
                         <div className="flex items-center gap-3">
                             <span className="group-hover:text-indigo-700 text-slate-500">其他 / 自行輸入</span>
                         </div>
                     </button>
                     </>
                 ) : (
                     <div className="px-4 py-12 text-slate-400 text-sm flex flex-col items-center gap-3 text-center">
                         <div className="p-4 bg-slate-50 rounded-full">
                            <Search className="w-6 h-6 text-slate-300" />
                         </div>
                         <p>找不到符合「{groupSearchTerm}」的群別</p>
                         <button 
                             type="button" 
                             onClick={() => { 
                                 setSelectedGroup('custom');
                                 setIsManualDept(true);
                                 setIsGroupModalOpen(false); 
                             }}
                             className="mt-2 text-white font-bold text-sm bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                         >
                             手動輸入
                         </button>
                     </div>
                 )}
              </div>
           </div>
        </div>
      )}
      {/* Dept Selection Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => setIsDeptModalOpen(false)}
           />
           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="department-modal-title"
             className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[84vh]"
           >
              <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-3">
                 <h3 id="department-modal-title" className="sr-only">選擇科系或班別</h3>
                 <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={deptSearchTerm}
                        onChange={(e) => setDeptSearchTerm(e.target.value)}
                        placeholder="搜尋科系或群別..."
                        aria-label="搜尋科系或群別"
                        className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                      type="button"
                      onClick={() => setIsDeptModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 font-medium"
                  >
                      取消
                  </button>
                 </div>
                 <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
                    {availableGroups.map(group => (
                      <button
                        key={group}
                        type="button"
                        aria-pressed={currentDeptGroup === group && !deptSearchTerm}
                        onClick={() => {
                          setActiveDeptGroup(group);
                          setDeptSearchTerm('');
                        }}
                        className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                          currentDeptGroup === group && !deptSearchTerm
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_1fr]">
                 <div className="hidden overflow-y-auto border-r border-slate-100 bg-slate-50/70 p-2 md:block">
                    {availableGroups.map(group => (
                      <button
                        key={group}
                        type="button"
                        aria-pressed={currentDeptGroup === group && !deptSearchTerm}
                        onClick={() => {
                          setActiveDeptGroup(group);
                          setDeptSearchTerm('');
                        }}
                        className={`mb-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition-colors ${
                          currentDeptGroup === group && !deptSearchTerm
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-white hover:text-indigo-700'
                        }`}
                      >
                        <span>{group}</span>
                        <span className={`text-xs ${currentDeptGroup === group && !deptSearchTerm ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {DEPARTMENT_GROUPS[group]?.length || 0}
                        </span>
                      </button>
                    ))}
                 </div>

                 <div className="overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-indigo-200">
                 {deptSearchTerm ? (
                   groupedDeptResults.length > 0 ? (
                    <div className="space-y-4">
                      {groupedDeptResults.map(({ group, departments }) => (
                        <div key={group}>
                          <div className="mb-2 flex items-center justify-between px-1">
                            <h4 className="text-xs font-black tracking-widest text-indigo-500">{group}</h4>
                            <span className="text-[11px] font-bold text-slate-400">{departments.length} 項</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {departments.map(dept => (
                              <button
                                key={`${group}-${dept}`}
                                type="button"
                                onClick={() => {
                                  handleDepartmentChange(dept);
                                  setActiveDeptGroup(group);
                                  setIsDeptModalOpen(false);
                                }}
                                className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left font-bold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                {dept}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                   ) : (
                     <div className="px-4 py-12 text-slate-400 text-sm flex flex-col items-center gap-3 text-center">
                         <div className="p-4 bg-slate-50 rounded-full">
                            <Search className="w-6 h-6 text-slate-300" />
                         </div>
                         <p>找不到符合「{deptSearchTerm}」的科系</p>
                         <button 
                             type="button" 
                             onClick={() => { 
                                 setIsManualDept(true);
                                 handleDepartmentChange(deptSearchTerm, true);
                                 setIsDeptModalOpen(false); 
                             }}
                             className="mt-2 text-white font-bold text-sm bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                         >
                             手動輸入「{deptSearchTerm}」
                         </button>
                     </div>
                   )
                 ) : (
                   <div>
                     <div className="mb-3 flex items-center justify-between px-1">
                       <div>
                         <h4 className="text-base font-black text-slate-800">{currentDeptGroup}</h4>
                         <p className="mt-0.5 text-xs font-medium text-slate-400">先選群別，再點選科系/班別即可帶入表單</p>
                       </div>
                       <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">
                         {activeGroupDepartments.length} 項
                       </span>
                     </div>
                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                       {activeGroupDepartments.map(dept => (
                         <button
                           key={dept}
                           type="button"
                           onClick={() => {
                             handleDepartmentChange(dept);
                             setActiveDeptGroup(currentDeptGroup);
                             setIsDeptModalOpen(false);
                           }}
                           className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left font-bold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                         >
                           {dept}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Region Selection Modal */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => setIsRegionModalOpen(false)}
           />
           <div
             role="dialog"
             aria-modal="true"
             aria-labelledby="region-modal-title"
             className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
           >
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                 <h3 id="region-modal-title" className="sr-only">選擇所屬區域</h3>
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={regionSearchTerm}
                        onChange={(e) => setRegionSearchTerm(e.target.value)}
                        placeholder="搜尋區域..."
                        aria-label="搜尋區域"
                        className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-slate-400"
                    />
                 </div>
                 <button 
                    type="button"
                    onClick={() => setIsRegionModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 font-medium"
                 >
                    取消
                 </button>
              </div>

              <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200 flex-1">
                 {filteredRegions.length > 0 ? (
                     <>
                     {filteredRegions.map(region => (
                         <button
                             key={region}
                             type="button"
                             onClick={() => {
                                 handleChange('region', region);
                                 setIsRegionModalOpen(false);
                             }}
                             className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                         >
                             <div className="flex items-center gap-3">
                                 <span className="group-hover:text-indigo-700">{region}</span>
                             </div>
                         </button>
                     ))}
                     </>
                 ) : (
                     <div className="px-4 py-12 text-slate-400 text-sm flex flex-col items-center gap-3 text-center">
                         <div className="p-4 bg-slate-50 rounded-full">
                            <Search className="w-6 h-6 text-slate-300" />
                         </div>
                         <p>找不到符合「{regionSearchTerm}」的區域</p>
                     </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScoreForm;
