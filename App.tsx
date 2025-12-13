import React, { useState, useEffect } from 'react';
import ScoreForm from './components/ScoreForm';
import ScoreList from './components/ScoreList';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import { ScoreEntry } from './types';
import { fetchEntries, submitEntry } from './services/apiService';
import { GraduationCap, BarChart3, PlusCircle, BookOpen, CloudOff, Info, Menu, X, ExternalLink, Calculator, Compass } from 'lucide-react';

// New Custom Loader Component
const AppLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in duration-500">
    <div className="relative">
      {/* Outer Orbit */}
      <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
      {/* Inner Orbit */}
      <div className="absolute inset-0 m-auto w-16 h-16 rounded-full border-4 border-purple-50 border-b-purple-500 animate-spin-slow-reverse"></div>
      {/* Center Icon */}
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

  // Load data from Google Apps Script on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchEntries();
      
      if (data.length > 0) {
         data.sort((a, b) => b.timestamp - a.timestamp);
         setEntries(data);
      }
      // Add a small delay for smoother transition if data loads too fast
      setTimeout(() => setIsLoading(false), 800);
    };

    loadData();
  }, []);

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

  const NavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 overflow-hidden flex-shrink-0 ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-100' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100/80'
      }`}
    >
        <Icon className={`w-4 h-4 ${activeTab === id ? 'animate-pulse' : ''}`} />
        <span className={id === 'form' ? '' : 'hidden md:inline'}>{label}</span>
    </button>
  );

  return (
    <div className="font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[85vw] sm:w-80 bg-white/95 backdrop-blur-2xl shadow-2xl z-[70] transition-transform duration-300 ease-in-out border-l border-white/50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">更多功能</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
          
          <nav className="space-y-4">
            <a 
              href="https://tyctw.github.io/spare/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold transition-all group shadow-sm hover:shadow-md"
            >
              <div className="bg-indigo-100 p-2 rounded-lg group-hover:scale-110 transition-transform text-indigo-600">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="flex-1">落點分析</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>

            <a 
              href="https://tyctw.github.io/Navigation/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold transition-all group shadow-sm hover:shadow-md"
            >
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:scale-110 transition-transform text-emerald-600">
                <Compass className="w-5 h-5" />
              </div>
              <span className="flex-1">更多資訊</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} CAP Score Sharing</p>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 w-full z-40 transition-all duration-300 glass-header shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer group flex-shrink-0" onClick={() => setActiveTab('list')}>
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight hidden sm:block">
              會考落點分享
            </h1>
             <h1 className="text-xl font-bold text-slate-800 sm:hidden">
              會考分享
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
            <nav className="flex items-center p-1.5 bg-slate-100/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-inner overflow-x-auto no-scrollbar flex-1 sm:flex-none justify-between sm:justify-start max-w-[240px] sm:max-w-none">
                <NavButton id="list" label="瀏覽分數" icon={BookOpen} />
                <NavButton id="stats" label="統計數據" icon={BarChart3} />
                <NavButton id="form" label="分享成績" icon={PlusCircle} />
                <NavButton id="guide" label="使用說明" icon={Info} />
            </nav>

            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 rounded-2xl bg-white/60 hover:bg-white border border-white/60 text-slate-600 hover:text-indigo-600 shadow-sm transition-all active:scale-95 flex-shrink-0"
                title="更多功能"
            >
                <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
            
            {!isLoading && entries.length === 0 && activeTab !== 'guide' && (
                 <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
                    <CloudOff className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <strong>尚未載入資料</strong>：可能是 Google Sheet 為空，或是尚未設定 API URL。
                        <br />請記得部署 App Script 並更新 <code>services/apiService.ts</code>。
                    </div>
                 </div>
            )}

            {activeTab === 'guide' && (
                <Guide onNavigate={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'list' && (
            <div className="space-y-10">
                 {/* Hero Section */}
                 <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700 rounded-[2.5rem] p-8 sm:p-14 text-white shadow-2xl shadow-indigo-900/25 isolate border border-white/10">
                    <div className="absolute inset-0 bg-grid-pattern opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse duration-[3s]"></div>
                    <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-fuchsia-400/30 rounded-full blur-3xl mix-blend-overlay"></div>
                    
                    <div className="relative z-10 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-50 text-sm font-semibold mb-6 backdrop-blur-md shadow-lg">
                        <BarChart3 className="w-4 h-4 text-amber-300" />
                        <span>2024 - 2025 歷年錄取數據</span>
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight leading-[1.15]">
                        探索高中職錄取標準<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">找到你的理想學校</span>
                      </h2>
                      <p className="text-indigo-100 text-lg sm:text-xl leading-relaxed max-w-2xl font-medium opacity-90">
                          彙整全台各區會考錄取分數，透明公開的分享平台。<br className="hidden sm:block"/>協助你掌握精準落點資訊，規劃完美升學藍圖。
                      </p>
                      <button 
                         onClick={() => setActiveTab('guide')}
                         className="mt-8 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-md"
                      >
                         <Info className="w-4 h-4" /> 新手指南
                      </button>
                    </div>
                 </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-5">
                       {/* While main data is loading, show skeletons */}
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
                <div className="space-y-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">數據統計中心</h2>
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
      
      <footer className="py-12 mt-12 bg-white/40 backdrop-blur-md border-t border-white/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-2.5 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
                    <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-700 tracking-wide">會考落點分享平台</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} CAP Score Sharing. Powered by Google Gemini & Google Sheets.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;