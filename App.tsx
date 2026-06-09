import React, { useState, useEffect, useCallback } from 'react';
import ScoreForm from './components/ScoreForm';
import ScoreList from './components/ScoreList';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import ScoreCompare from './components/ScoreCompare';
import ShareModal from './components/ShareModal';
import GreetingModal from './components/GreetingModal';
import { ScoreEntry } from './types';
import { fetchEntries, submitEntry, logUserAction } from './services/apiService';
import { GraduationCap, BarChart3, PlusCircle, BookOpen, CloudOff, Info, Menu, X, ExternalLink, Calculator, Compass, Sparkles, RefreshCw, Home, ShieldAlert, Check, Heart, Shield, Share2 } from 'lucide-react';

// New Custom Loader Component
const AppLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
     <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute inset-4 rounded-[2rem] border-2 border-indigo-100 rotate-12 animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-4 rounded-[2rem] border-2 border-purple-100 -rotate-12 animate-[spin_4s_linear_infinite_reverse]"></div>
        
        <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200/50 flex items-center justify-center z-10 hover:scale-105 transition-transform">
            <GraduationCap className="w-8 h-8 text-white animate-[bounce_2s_infinite]" />
        </div>
     </div>
     <div className="flex flex-col items-center gap-4">
        <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            正在載入落點數據
        </h3>
        <div className="flex gap-2.5">
           <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
           <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
           <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
     </div>
  </div>
);

const App: React.FC = () => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'stats' | 'guide' | 'compare'>('list');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
      const saved = localStorage.getItem('cap_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
      localStorage.setItem('cap_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
      setFavoriteIds(prev => 
          prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      );
  };

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
      className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group ${
        activeTab === id 
          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60 scale-100' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100/50 scale-95 hover:scale-100 border border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-indigo-600' : 'group-hover:text-indigo-500 text-slate-400'}`} />
      <span>{label}</span>
      {activeTab === id && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full md:opacity-100 opacity-0 hidden"></span>
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

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />

      {/* Greeting Modal */}
      <GreetingModal />

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
        <div className="max-w-5xl mx-auto h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_4px_40px_-10px_rgba(0,0,0,0.1)] border border-white/60">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => handleTabChange('list')}>
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-md group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                <div className="absolute inset-[2px] bg-white rounded-[10px] sm:rounded-[14px] z-0"></div>
                <GraduationCap className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none mb-0.5">
                  會考落點<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">導航</span>
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase origin-left scale-90">CAP Score Sharing</p>
            </div>
          </div>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100/50 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] gap-1">
             <NavButton id="list" label="瀏覽" icon={BookOpen} />
             <NavButton id="compare" label="收藏" icon={Heart} />
             <NavButton id="stats" label="統計" icon={BarChart3} />
             <NavButton id="guide" label="說明" icon={Info} />
             <div className="w-px h-6 bg-slate-200 mx-1"></div>
             <button
                 onClick={() => setShowShareModal(true)}
                 className="relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group text-slate-500 hover:text-indigo-600 hover:bg-slate-100/50 scale-95 hover:scale-100 border border-transparent"
             >
                 <Share2 className="w-4 h-4 group-hover:text-indigo-500 text-slate-400" />
                 <span>分享</span>
             </button>
          </nav>

          {/* Right: Actions & Desktop Nav */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-none justify-end min-w-0">
            
            {/* PROMINENT SHARE CTA - Visible everywhere */}
            <button
                onClick={() => handleTabChange('form')}
                className={`
                    relative group flex items-center justify-center gap-1.5 sm:gap-2 
                    overflow-hidden rounded-full
                    px-4 py-2 sm:px-6 sm:py-2.5
                    font-black text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-95
                    ${activeTab === 'form' 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-white/20'
                    }
                `}
            >
                {/* Shiny hover effect */}
                {activeTab !== 'form' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                
                <PlusCircle className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 ${activeTab !== 'form' ? 'group-hover:rotate-180 transition-transform duration-700' : ''}`} />
                <span className="relative z-10"><span className="hidden sm:inline">新增</span>分享</span>
            </button>

            {/* Menu Button */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors md:hidden"
                title="更多功能"
            >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-5 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-6 duration-500">
         <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] p-2 flex justify-between items-center max-w-sm mx-auto ring-1 ring-white/60">
            <MobileNavButton id="list" label="瀏覽" icon={BookOpen} />
            <MobileNavButton id="compare" label="收藏" icon={Heart} />
            <MobileNavButton id="stats" label="統計" icon={BarChart3} />
            <div className="w-px h-8 bg-slate-200/60 mx-1"></div>
            <MobileNavButton id="form" label="分享" icon={PlusCircle} />
         </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-28 sm:pb-16">
        
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
                 {/* Modern Light Hero Section */}
                 <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] isolate px-6 pt-16 pb-20 sm:px-16 sm:pt-24 sm:pb-28">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-100/80 to-purple-100/80 blur-[80px] opacity-70"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-pink-100/80 to-rose-100/80 blur-[80px] opacity-70 animate-pulse duration-[4s]"></div>
                        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-100/80 to-indigo-100/80 blur-[80px] opacity-60"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-multiply"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 shadow-sm text-indigo-700 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                            <span>115會考 數據即時更新</span>
                        </div>
                        
                        {/* Headline */}
                        <h2 className="text-4xl sm:text-6xl md:text-[4.5rem] font-black text-slate-800 mb-6 tracking-[-0.02em] leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700" style={{animationFillMode: 'both', animationDelay: '100ms'}}>
                            精準落點，<br className="hidden sm:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                                預見你的未來
                            </span>
                        </h2>
                        
                        {/* Subtitle */}
                        <p className="text-slate-500 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{animationFillMode: 'both', animationDelay: '200ms'}}>
                            彙整全台各區真實錄取分數，透明公開。<br className="hidden md:block"/>
                            拒絕資訊焦慮，用數據規劃最適合的升學藍圖。
                        </p>
                        
                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-6 duration-700" style={{animationFillMode: 'both', animationDelay: '300ms'}}>
                             <button 
                                onClick={() => handleTabChange('form')}
                                className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 flex items-center justify-center gap-2.5 text-lg active:scale-95"
                             >
                                <PlusCircle className="w-5 h-5" /> 我要分享分數
                             </button>
                             <button 
                                onClick={() => handleTabChange('guide')}
                                className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow hover:border-slate-300 flex items-center justify-center gap-2.5 text-lg active:scale-95"
                             >
                                <Info className="w-5 h-5 text-slate-400" /> 新手指南
                             </button>
                        </div>
                    </div>
                 </div>

                {isLoading ? (
                    <AppLoader />
                ) : (
                    <ScoreList 
                        entries={entries} 
                        isLoading={false}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                        onRefresh={() => loadData(true)}
                        isRefreshing={isLoading}
                    />
                )}
            </div>
            )}
            
            {activeTab === 'compare' && (
                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <ScoreCompare 
                        entries={entries}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                    />
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
      
      <footer className="py-12 pb-36 md:pb-12 mt-12 bg-white/60 border-t border-slate-200/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start gap-3">
                    <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-gradient-to-tr from-indigo-100 to-purple-100 p-2.5 rounded-xl border border-white shadow-sm">
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="font-black text-slate-800 tracking-tight text-xl">CAP Score Sharing</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        台灣國中會考落點分享平台，由學生自發維護。<br className="hidden md:block" />
                        Made for Students, by Students.
                    </p>
                </div>

                <div className="flex gap-4 sm:gap-6">
                    <button 
                         onClick={() => setShowDisclaimer(true)}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>免責聲明</span>
                    </button>
                    <button 
                         onClick={() => setShowPrivacyPolicy(true)}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        <span>隱私權與版權聲明</span>
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col items-center gap-4 text-xs font-semibold text-slate-400">
                <p>
                    Copyright © 2024-{new Date().getFullYear()} TYCTW會考落點. All rights reserved.
                </p>
            </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
             onClick={() => setShowPrivacyPolicy(false)}
           />
           
           {/* Modal Card */}
           <div className="relative bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
              {/* Header */}
              <div className="bg-slate-50 p-6 sm:p-8 flex items-start justify-between border-b border-slate-100 flex-shrink-0">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                          <Shield className="w-6 h-6" />
                       </div>
                       <h3 className="text-slate-800 text-2xl font-black">
                          隱私權與版權聲明
                       </h3>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Privacy Policy & Copyright Declaration</p>
                 </div>
                 <button 
                    onClick={() => setShowPrivacyPolicy(false)}
                    className="p-2.5 bg-white hover:bg-slate-200 text-slate-500 rounded-full transition-colors border border-slate-200"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-8 bg-white overflow-y-auto">
                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-indigo-500 pl-3">1. 資料蒐集與使用</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        本平台（CAP Score Sharing）為匿名性質的資料分享平台。當您填寫並送出分數分享表單時，我們僅蒐集您自願提供的考試成績、錄取學校、就讀區域及經驗分享等資訊。
                        我們<span className="font-bold text-rose-500">不會蒐集</span>您的姓名、身分證字號、聯絡方式或任何可直接識別您身分的個人資料。
                    </p>
                 </section>
                 
                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-indigo-500 pl-3">2. Cookie 及網頁儲存區 (Local Storage)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        為了提供更好的使用者體驗，本網站會使用 Local Storage 來儲存您的「收藏名單」以及「已閱讀免責聲明」之狀態。這些資料僅存放於您的瀏覽器中，本平台伺服器不會主動獲取此資料。
                    </p>
                 </section>

                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-rose-500 pl-3">3. 數據準確性與風險承擔</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        本平台展示之歷年落點數據均來自熱心考生的自主回報，<span className="font-bold text-rose-500">並非官方正式公告</span>。我們無法保證每一筆數據的絕對準確性與最新狀態。
                        使用者在選填志願或進行升學決策時，請務必多方查證、參考各校官方網站，並承擔使用本平台資訊的相關風險。本平台對因使用數據而造成的任何直接或間接損失概不負責。
                    </p>
                 </section>

                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-indigo-500 pl-3">4. 版權聲明 (Copyright)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        本網站的原始程式碼、介面設計、網站架構皆受相關智慧財產權保護。如需引用、修改或二次發布，請註明資料來源「TYCTW會考落點分享平台」。
                    </p>
                 </section>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                 <button
                     onClick={() => setShowPrivacyPolicy(false)}
                     className="w-full sm:w-auto sm:ml-auto block px-8 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors text-center"
                 >
                     我了解了
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
