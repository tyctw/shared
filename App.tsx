import React, { useState, useEffect, useCallback } from 'react';
import ScoreForm from './components/ScoreForm';
import ScoreList from './components/ScoreList';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import { ScoreEntry } from './types';
import { fetchEntries, submitEntry, logUserAction } from './services/apiService';
import { GraduationCap, BarChart3, PlusCircle, BookOpen, CloudOff, Info, Menu, X, ExternalLink, Calculator, Compass, Sparkles, RefreshCw, Home, ShieldAlert, Check } from 'lucide-react';

// New Custom Loader Component
const AppLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in duration-500">
    <div className="relative">
      <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
      <div className="absolute inset-0 m-auto w-16 h-16 rounded-full border-4 border-purple-50 border-b-purple-500 animate-spin-slow-reverse"></div>
      <div className="absolute inset-0 m-auto flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-indigo-600">
        <GraduationCap className="w-5 h-5 animate-pulse" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-bold text-slate-700">正在同步全台數據</h3>
      <p className="text-sm text-slate-400 font-medium animate-pulse">Connecting to CAP Database...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'stats' | 'guide'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Extract data fetching logic to a reusable function
  const loadData = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    if (isManualRefresh) {
        logUserAction('refresh_data', 'User Triggered');
    }
    
    const data = await fetchEntries();
    
    if (data.length > 0) {
       data.sort((a, b) => b.timestamp - a.timestamp);
       setEntries(data);
    }
    // Add a small artificial delay for better UX (skeleton visibility)
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Initial load
  useEffect(() => {
    // Check disclaimer status
    const hasAccepted = localStorage.getItem('cap_disclaimer_accepted');
    if (!hasAccepted) {
      setShowDisclaimer(true);
    }

    logUserAction('app_open', `Initial Load`);
    loadData();
  }, [loadData]);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('cap_disclaimer_accepted', 'true');
    setShowDisclaimer(false);
    logUserAction('accept_disclaimer', 'agreed');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    logUserAction('tab_change', tab);
  };

  const handleAddEntry = async (newEntry: Omit<ScoreEntry, 'id' | 'timestamp'>) => {
    const entry: ScoreEntry = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setEntries(prev => [entry, ...prev]);
    setActiveTab('list');
    const success = await submitEntry(entry);
    if (!success) {
      alert("資料已顯示在本地，但同步到雲端失敗。請檢查網路或 API 設定。");
    }
  };

  // Desktop Nav Button
  const NavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 group ${
        activeTab === id 
          ? 'bg-slate-800 text-white shadow-lg shadow-slate-500/30 scale-100 ring-2 ring-white ring-offset-2 ring-offset-slate-100' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm'
      }`}
    >
        <Icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className={id === 'form' ? '' : 'hidden xl:inline'}>{label}</span>
        {activeTab === id && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full mb-1.5 opacity-0 md:opacity-100"></span>
        )}
    </button>
  );

  // Mobile Bottom Nav Button
  const MobileNavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-all duration-300 ${
        activeTab === id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === id ? 'bg-indigo-50 translate-y-[-2px]' : ''}`}>
           <Icon className={`w-6 h-6 ${activeTab === id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        </div>
        <span className={`text-[10px] font-bold transition-all duration-300 ${activeTab === id ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'}`}>
            {label}
        </span>
        {activeTab === id && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
        )}
    </button>
  );

  return (
    <div className={`font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden min-h-screen ${showDisclaimer ? 'h-screen overflow-hidden' : ''}`}>
      
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
           
           {/* Modal Card */}
           <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
              <div className="bg-amber-50 p-6 sm:p-8 text-center border-b border-amber-100">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-amber-500 ring-4 ring-amber-100">
                    <ShieldAlert className="w-7 h-7" />
                 </div>
                 <h3 className="text-slate-800 text-2xl font-black mb-1">
                    使用前請詳閱
                 </h3>
                 <p className="text-amber-700/80 font-bold text-sm">Disclaimer & Terms of Use</p>
              </div>

              <div className="p-6 sm:p-8 space-y-6 bg-white">
                 <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">1</div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">非官方數據</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">本平台資料皆由考生自由回報，<span className="text-rose-500 font-bold">非官方公佈之錄取標準</span>。資料僅供參考，請勿作為選填志願的唯一依據。</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">2</div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">準確性風險</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">雖然我們有過濾機制，但無法保證每一筆數據的真實性。建議多方比對（參考不同年份、不同來源）。</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">3</div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">匿名與隱私</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">平台採匿名制，不會蒐集您的個人識別資料。也請勿在備註欄填寫他人個資。</p>
                        </div>
                    </div>
                 </div>

                 <div className="pt-2">
                    <button
                        onClick={handleAcceptDisclaimer}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        <span>我已閱讀並同意</span>
                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[85vw] sm:w-80 bg-white/90 backdrop-blur-2xl shadow-2xl z-[70] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-l border-white/50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">功能選單</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100/80 transition-colors text-slate-500 hover:text-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-4 relative z-10">
            <a 
              href="https://tyctw.github.io/spare/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'spare_analysis')}
              className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300"
            >
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                 <span className="block font-bold text-slate-800 text-lg">落點分析</span>
                 <span className="text-xs text-slate-400 font-medium">精準預測 • 歷年比對</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 absolute top-4 right-4" />
            </a>

            <a 
              href="https://tyctw.github.io/Navigation/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'navigation_info')}
              className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-100 transition-all duration-300"
            >
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                 <span className="block font-bold text-slate-800 text-lg">更多資訊</span>
                 <span className="text-xs text-slate-400 font-medium">升學導航 • 校系介紹</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 absolute top-4 right-4" />
            </a>
          </nav>
          
          <div className="mt-auto pt-8 border-t border-slate-200/60">
            <div className="flex items-center justify-center gap-2 text-slate-400 opacity-60">
                 <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                 <p className="text-xs font-mono">CAP SCORE SHARING</p>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-2">v2.0.1 • 2025</p>
          </div>
        </div>
      </aside>

      {/* Floating Header (Top) */}
      <header className="fixed top-0 w-full z-40 transition-all duration-300 pt-3 px-3 sm:pt-4 sm:px-6">
        <div className="max-w-4xl mx-auto h-14 sm:h-20 flex items-center justify-between px-3 sm:px-6 rounded-full glass-header shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-white/60">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0" onClick={() => handleTabChange('list')}>
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="bg-white p-1.5 sm:p-2 rounded-full shadow-sm border border-indigo-50 relative">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                </div>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight">
              會考落點<span className="text-indigo-600 hidden sm:inline">分享</span>
            </h1>
          </div>

          {/* Right: Actions & Desktop Nav */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end min-w-0">
            
            {/* PROMINENT SHARE CTA - Visible everywhere */}
            <button
                onClick={() => handleTabChange('form')}
                className={`
                    flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full 
                    font-bold text-xs sm:text-sm transition-all duration-300 transform active:scale-95
                    shadow-md hover:shadow-lg
                    ${activeTab === 'form' 
                        ? 'bg-slate-800 text-white ring-2 ring-slate-200 ring-offset-2' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                    }
                `}
            >
                <PlusCircle className="w-4 h-4" />
                <span>分享<span className="hidden sm:inline">分數</span></span>
            </button>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
                <NavButton id="list" label="瀏覽分數" icon={BookOpen} />
                <NavButton id="stats" label="統計數據" icon={BarChart3} />
                {/* 'Share' is handled by the prominent button above */}
                <NavButton id="guide" label="使用說明" icon={Info} />
            </nav>

            <div className="h-6 sm:h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

            {/* Refresh Button */}
            <button
                onClick={() => loadData(true)}
                disabled={isLoading}
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors flex-shrink-0 relative group disabled:opacity-50"
                title="重新讀取資料"
            >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            {/* Menu Button */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
                title="更多功能"
            >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-5 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-6 duration-500">
         <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] p-2 flex justify-between items-center max-w-sm mx-auto ring-1 ring-white/60">
            <MobileNavButton id="list" label="瀏覽" icon={BookOpen} />
            <MobileNavButton id="stats" label="統計" icon={BarChart3} />
            <div className="w-px h-8 bg-slate-200/60 mx-1"></div>
            <MobileNavButton id="form" label="分享" icon={PlusCircle} />
            <MobileNavButton id="guide" label="說明" icon={Info} />
         </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-24 sm:pb-16">
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
            
            {!isLoading && entries.length === 0 && activeTab !== 'guide' && (
                 <div className="mb-8 bg-white/50 backdrop-blur-md border border-amber-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                        <CloudOff className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">尚未載入資料</h4>
                        <p className="text-slate-500 text-sm mt-1">
                            可能是 Google Sheet 為空，或是尚未設定 API URL。<br className="hidden sm:block"/>
                            請檢查您的 App Script 部署狀態。
                        </p>
                    </div>
                 </div>
            )}

            {activeTab === 'guide' && (
                <Guide onNavigate={(tab) => handleTabChange(tab)} />
            )}

            {activeTab === 'list' && (
            <div className="space-y-12">
                 {/* Modern Hero Section */}
                 <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 isolate">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 opacity-90"></div>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fuchsia-500/30 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse duration-[5s]"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                    </div>
                    
                    <div className="relative z-10 p-8 sm:p-16 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-bold mb-8 backdrop-blur-md shadow-lg animate-fade-in-up">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>114會考 數據即時更新</span>
                        </div>
                        
                        <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight leading-[1.1] animate-fade-in-up" style={{animationDelay: '100ms'}}>
                            精準落點，<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200">
                                預見你的未來
                            </span>
                        </h2>
                        
                        <p className="text-indigo-100/80 text-lg sm:text-xl leading-relaxed max-w-2xl font-medium mb-10 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                            彙整全台各區真實錄取分數，透明公開。<br className="hidden sm:block"/>
                            拒絕資訊焦慮，用數據規劃最適合的升學藍圖。
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                             <button 
                                onClick={() => handleTabChange('form')}
                                className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                             >
                                <PlusCircle className="w-5 h-5" /> 我要分享分數
                             </button>
                             <button 
                                onClick={() => handleTabChange('guide')}
                                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold transition-all backdrop-blur-md flex items-center justify-center gap-2"
                             >
                                <Info className="w-5 h-5" /> 新手指南
                             </button>
                        </div>
                    </div>
                 </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                       <ScoreList entries={[]} isLoading={true} />
                    </div>
                ) : (
                    <ScoreList 
                        entries={entries} 
                        isLoading={false}
                    />
                )}
            </div>
            )}
            
            {activeTab === 'stats' && (
                <div className="space-y-8 max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">數據統計中心</h2>
                    </div>
                    {isLoading ? (
                         <AppLoader />
                    ) : (
                        <Dashboard entries={entries} />
                    )}
                </div>
            )}

            {activeTab === 'form' && (
            <div className="max-w-3xl mx-auto">
                <ScoreForm onSubmit={handleAddEntry} />
            </div>
            )}
        </div>
      </main>
      
      <footer className="py-12 mt-12 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default group">
                <div className="bg-indigo-100 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
                    <GraduationCap className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-slate-700 tracking-wide text-lg">會考落點分享平台</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
                Made for Students, by Students. <br/>
                © {new Date().getFullYear()} TYCTW會考落點. Powered by Google Sheets & Gemini.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;