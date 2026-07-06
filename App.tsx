import React, { useState, useEffect, useCallback } from 'react';
import ScoreForm from './components/ScoreForm';
import ScoreList from './components/ScoreList';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import ScoreCompare from './components/ScoreCompare';
import ShareModal from './components/ShareModal';
import GreetingModal from './components/GreetingModal';
import { ScoreEntry } from './types';
import { REGIONS } from './constants';
import { fetchEntries, submitEntry, logUserAction } from './services/apiService';
import { ENTRY_LOCK_MESSAGE, isEntryYearLocked } from './utils/entryOpenLock';
import { GraduationCap, BarChart3, PlusCircle, BookOpen, CloudOff, Info, Menu, X, ExternalLink, Calculator, Compass, Sparkles, RefreshCw, Home, ShieldAlert, Check, Heart, Shield, Share2, ArrowRight, MapPin, Search, Table2, ChevronDown, MailWarning } from 'lucide-react';

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

type ActiveTab = 'list' | 'form' | 'stats' | 'guide' | 'compare' | 'minimums' | 'disclaimer' | 'privacy';
const CONTACT_EMAIL = 'tyctw.analyze@gmail.com';

const DisclaimerPage = ({ onBack }: { onBack: () => void }) => {
  const items = [
    ['非官方錄取資料', '本平台內容由考生匿名、自願回報，並非教育主管機關、招生委員會或學校公布的正式錄取門檻，也不代表最低錄取標準、保證錄取分數或任何官方統計結果。', 'rose'],
    ['資料可能存在誤差', '回報內容可能因記憶落差、輸入錯誤、不同招生管道、特殊身分、超額比序、志願序或年度規則差異而產生偏差。平台會盡力維護資料品質，但無法逐筆查核真實性。', 'indigo'],
    ['官方資訊優先', '選填志願前，請務必查閱當年度免試入學簡章、招生名額、超額比序規則、各區招生公告與學校正式資訊；若平台內容與官方資訊不同，應以官方公告為準。', 'amber'],
    ['判讀方式限制', '單筆資料不應被視為錄取門檻。建議同時比較同年度、同區域、同校科、多筆相近條件資料，並留意特殊身分、科系差異與積分制度變化。', 'emerald'],
    ['不構成升學建議', '平台提供資訊整理與經驗分享，不提供個別升學諮詢、錄取保證、志願序建議或法律責任承諾。任何升學決策仍應由使用者與家長、師長討論後自行判斷。', 'violet'],
    ['匿名分享與個資保護', '表單不要求姓名、電話或身分證字號。請勿在心得或補充說明中填寫姓名、准考證號、聯絡方式、地址、班級座號或任何可識別自己及他人的資訊。', 'indigo'],
    ['資料調整與移除', '平台可基於資料品質、隱私風險、明顯異常、惡意填寫或維運需求，調整、隱藏或移除部分資料。若你認為資料有誤，可透過頁面提供的回報方式協助更正。', 'amber'],
    ['聯絡資訊', `若需回報資料錯誤、隱私疑慮、刪修需求或平台問題，可來信 ${CONTACT_EMAIL}，請附上可協助定位資料的年份、區域、學校與科系。`, 'emerald'],
    ['使用者自行承擔風險', '使用本平台資料所做的志願選填、升學規劃或其他決策，其結果與風險由使用者自行承擔。平台維護者不對任何直接、間接、附帶或衍生損失負責。', 'rose'],
  ];

  const toneClass: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-500',
    indigo: 'bg-indigo-50 text-indigo-500',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)] ring-1 ring-amber-100 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[24px] border-amber-100/70" />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Platform notice</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">免責聲明</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">使用本平台資料前，請先了解資料來源、使用限制與判讀原則。</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:bg-indigo-600 active:scale-[0.98]"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            返回瀏覽資料
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {items.map(([title, body, tone], index) => (
          <article key={title} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${toneClass[tone]}`}>
              {index + 1}
            </div>
            <div>
              <h3 className="font-black text-slate-800">{title}</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{body}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

const PrivacyPage = ({ onBack }: { onBack: () => void }) => (
  <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-indigo-100/80 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Privacy & Copyright</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">隱私權與版權聲明</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">說明資料蒐集方式、瀏覽器儲存、資料風險與版權使用規範。</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:bg-indigo-600 active:scale-[0.98]"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          返回瀏覽資料
        </button>
      </div>
    </section>

    <section className="space-y-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">1. 資料蒐集與使用</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          本平台（CAP Score Sharing）為匿名性質的資料分享平台。當您填寫並送出分數分享表單時，我們會蒐集您自願提供的會考年份、就學區、錄取學校、科系或班別、考生身分、各科成績、總積分、總積點與補充說明等內容。
          這些資料將用於公開呈現、統計整理、篩選查詢與協助其他考生判讀歷年錄取經驗。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          本平台表單<span className="font-bold text-rose-500">不要求</span>姓名、身分證字號、電話、地址、准考證號、學號、班級座號或其他可直接識別個人的資料。請勿主動在心得或補充欄位填入自己或他人的個人資料。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">2. 瀏覽器儲存與使用紀錄</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          為了提供更好的使用體驗，本網站會使用 Local Storage 儲存您的收藏名單、已閱讀免責聲明狀態等偏好設定。這些資料主要存放於您的瀏覽器中，用於讓您下次回到網站時保留操作狀態。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          若您清除瀏覽器資料、更換裝置或使用無痕模式，這些本機偏好設定可能會消失。本平台不會以本機收藏資料識別您的真實身分。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-rose-500 pl-3 text-lg font-black text-slate-800">3. 公開資料與匿名風險</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          您送出的錄取資料可能會在網站上公開展示，供其他使用者查詢、篩選、比較或分享。雖然平台不要求直接識別個資，但若您在補充說明中留下足以辨識身分的內容，仍可能造成個資外洩風險。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          若發現資料含有個人資訊、錯誤內容、冒用或不當文字，平台可視情況進行修正、隱藏或刪除。使用者也可透過資料卡片上的回報方式協助我們維護資料品質。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">4. 第三方服務與資料傳輸</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          本平台可能使用第三方服務提供資料庫、網站部署、分析或分享功能，例如雲端資料庫、網站主機、瀏覽器分享 API 或外部社群分享連結。當您使用這些功能時，相關服務可能依其自身政策處理必要的技術資料。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          若您透過 LINE、社群平台、Email 或其他外部工具分享本站內容，該分享行為將受外部平台的服務條款與隱私政策約束。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">5. 資料保存、修正與刪除</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          為維持歷年資料參考價值，您自願送出的匿名錄取資料可能會被保存於資料庫中，直到平台維運者判斷不再需要、資料明顯錯誤、涉及隱私風險或使用者提出合理刪修需求。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          因本平台採匿名分享設計，若您未提供可驗證的資料識別資訊，平台可能無法確認特定資料是否由您本人提交。回報刪修時，請提供資料卡片中可見的年份、區域、學校、科系與錯誤原因，協助我們定位資料。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-amber-500 pl-3 text-lg font-black text-slate-800">6. 使用者責任</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          使用者應確保提交內容盡可能真實、完整且不侵害他人權益。請勿提交虛假資料、惡意攻擊、歧視性文字、廣告、個資、侵犯著作權內容或任何違反法律與善良風俗的資訊。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          若使用者因提交不當內容造成第三方權益受損或法律爭議，應由提交者自行負責；平台可基於安全與維運需求移除相關內容。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">7. 版權聲明 (Copyright)</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          本網站的原始程式碼、介面設計、網站架構、視覺排版、資料整理方式與文字內容，除另有標示外，皆受相關智慧財產權保護。未經授權，不得冒名、抄襲、販售、批量轉載或以誤導方式二次發布。
        </p>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          若您引用本站資料作為非商業討論、心得分享或教育參考，請註明資料來源「TYCTW會考落點分享平台」或「會考錄取分享平台」，並避免將匿名回報資料包裝成官方錄取門檻。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">8. 條款更新</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          本頁內容可能因平台功能、資料欄位、法規環境或維運需求而調整。更新後的內容會公布於本頁，使用者持續使用本平台即表示了解並接受更新後的聲明內容。
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="border-l-4 border-indigo-500 pl-3 text-lg font-black text-slate-800">9. 聯絡資訊</h3>
        <p className="pl-4 text-sm font-medium leading-7 text-slate-500">
          若您需要回報資料錯誤、提出刪修需求、反映隱私或版權問題，可寄信至
          <a href={`mailto:${CONTACT_EMAIL}`} className="mx-1 font-black text-indigo-600 hover:text-indigo-700">{CONTACT_EMAIL}</a>
          。來信時請盡量提供年份、區域、學校、科系與問題描述，方便我們定位資料。
        </p>
      </section>
    </section>
  </div>
);

const MinimumScoresPage = ({ entries }: { entries: ScoreEntry[] }) => {
  const [selectedYear, setSelectedYear] = React.useState('115');
  const [selectedRegion, setSelectedRegion] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isRegionModalOpen, setIsRegionModalOpen] = React.useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = React.useState('');
  const [selectedMinimumEntry, setSelectedMinimumEntry] = React.useState<(ScoreEntry & { count: number }) | null>(null);
  const [isMinimumNoticeOpen, setIsMinimumNoticeOpen] = React.useState(true);

  const generalEntries = React.useMemo(
    () => entries.filter(entry => (entry.studentIdentity ?? '一般生') === '一般生'),
    [entries]
  );

  const years = React.useMemo(
    () => Array.from(new Set(generalEntries.map(entry => String(entry.year))))
      .sort((a, b) => Number(b) - Number(a)),
    [generalEntries]
  );

  const regions = React.useMemo(
    () => Array.from(new Set(generalEntries
      .filter(entry => selectedYear === 'all' || String(entry.year) === selectedYear)
      .map(entry => entry.region)))
      .sort((a, b) => String(a).localeCompare(String(b), 'zh-TW')),
    [generalEntries, selectedYear]
  );

  const regionModalOptions = React.useMemo(
    () => REGIONS.filter(region => region.includes(regionSearchTerm)),
    [regionSearchTerm]
  );

  const filteredEntries = React.useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return generalEntries.filter(entry => {
      const matchesYear = selectedYear === 'all' || String(entry.year) === selectedYear;
      const matchesRegion = selectedRegion === 'all' || entry.region === selectedRegion;
      const matchesSearch = !keyword || [
        entry.region,
        entry.school,
        entry.department,
        String(entry.year),
      ].some(value => String(value ?? '').toLowerCase().includes(keyword));

      return matchesYear && matchesRegion && matchesSearch;
    });
  }, [generalEntries, searchTerm, selectedRegion, selectedYear]);

  const rows = React.useMemo(() => {
    const map = new Map<string, { entry: ScoreEntry; count: number }>();

    filteredEntries.forEach(entry => {
      const key = `${entry.region}__${entry.school}`;
      const current = map.get(key);
      const entryCredits = entry.totalCredits ?? Number.POSITIVE_INFINITY;
      const currentCredits = current?.entry.totalCredits ?? Number.POSITIVE_INFINITY;

      if (
        !current ||
        entry.totalPoints < current.entry.totalPoints ||
        (entry.totalPoints === current.entry.totalPoints && entryCredits < currentCredits)
      ) {
        map.set(key, { entry, count: (current?.count ?? 0) + 1 });
        return;
      }

      current.count += 1;
    });

    return Array.from(map.values())
      .map(({ entry, count }) => ({ ...entry, count }))
      .sort((a, b) => {
        const regionCompare = String(a.region).localeCompare(String(b.region), 'zh-TW');
        if (regionCompare !== 0) return regionCompare;
        return a.totalPoints - b.totalPoints || a.school.localeCompare(b.school, 'zh-TW');
      });
  }, [filteredEntries]);

  const regionCount = new Set(rows.map(row => row.region)).size;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#11132b] p-6 text-white shadow-[0_28px_80px_-45px_rgba(15,23,42,0.6)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-[70px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-[80px]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-bold text-indigo-100">
              <Table2 className="h-4 w-4 text-emerald-300" />
              各區學校最低錄取資料
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">最低錄取分數總表</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-300">
              僅統整一般生匿名分享資料，列出同一區域、同一學校中目前蒐集到的最低總積分紀錄。此表並不保證為該校真正最低錄取分數，請以官方簡章與正式公告為準。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-300">區域</span>
              <strong className="mt-1 block text-2xl font-black">{regionCount}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-300">學校</span>
              <strong className="mt-1 block text-2xl font-black">{rows.length}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-300">資料</span>
              <strong className="mt-1 block text-2xl font-black">{filteredEntries.length}</strong>
            </div>
          </div>
        </div>
      </section>

      {isMinimumNoticeOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
            onClick={() => setIsMinimumNoticeOpen(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-amber-50 p-5 ring-1 ring-amber-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Important notice</p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">請先了解資料限制</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm font-bold leading-7 text-slate-600">
                「最低錄取分數總表」只統整目前平台蒐集到的匿名一般生分享資料，顯示的是目前資料中的最低紀錄。
              </p>
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-black leading-6 text-rose-600 ring-1 ring-rose-100">
                這不代表該校實際或官方最低錄取分數，也不保證所有錄取資料都已被收錄。
              </div>
              <p className="text-xs font-bold leading-6 text-slate-500">
                志願選填仍請以當年度官方簡章、招生名額、超額比序規則與學校正式公告為準。
              </p>

              <button
                type="button"
                onClick={() => setIsMinimumNoticeOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:bg-indigo-600 active:scale-[0.98]"
              >
                我了解，繼續查看
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[150px_190px_1fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">年份</span>
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setSelectedRegion('all');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              <option value="115">115 年</option>
              {years.filter(year => year !== '115').map(year => (
                <option key={year} value={year}>{year} 年</option>
              ))}
              <option value="all">所有年份</option>
            </select>
          </label>

          <div className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">區域</span>
            <button
              type="button"
              onClick={() => {
                setRegionSearchTerm('');
                setIsRegionModalOpen(true);
              }}
              className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-bold text-slate-700 outline-none transition-all hover:border-indigo-200 hover:bg-white focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                <span className="truncate">{selectedRegion === 'all' ? '所有區域' : selectedRegion}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black text-slate-500">搜尋</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="搜尋學校、科系或區域"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_60px_-38px_rgba(15,23,42,0.35)]">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CloudOff className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-black text-slate-800">尚無可統整資料</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">目前篩選條件下沒有一般生錄取分享資料可計算最低分數。</p>
          </div>
        ) : (
          <>
          <div className="grid gap-3 p-3 md:hidden">
            {rows.map(row => (
              <article
                key={`${row.region}-${row.school}-mobile`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMinimumEntry(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedMinimumEntry(row);
                  }
                }}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 p-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600">
                        {row.region}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                        {row.year} 年
                      </span>
                    </div>
                    <h3 className="break-words text-base font-black leading-6 text-slate-900">{row.school}</h3>
                    <p className="mt-1 break-words text-sm font-bold text-slate-500">{row.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4">
                  <div className="rounded-2xl bg-indigo-50 p-3 ring-1 ring-indigo-100">
                    <span className="block text-[10px] font-black text-indigo-500">總積分</span>
                    <strong className="mt-1 block font-mono text-2xl font-black leading-none text-indigo-700">{row.totalPoints}</strong>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                    <span className="block text-[10px] font-black text-amber-500">總積點</span>
                    <strong className="mt-1 block font-mono text-2xl font-black leading-none text-amber-600">{row.totalCredits ?? '-'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-black text-slate-500">
                  <span>同校一般生資料</span>
                  <span>{row.count} 筆・點擊查看</span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[820px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <th className="px-5 py-4">區域</th>
                  <th className="px-5 py-4">學校</th>
                  <th className="px-5 py-4">最低總積分</th>
                  <th className="px-5 py-4">總積點</th>
                  <th className="px-5 py-4">年度</th>
                  <th className="px-5 py-4">科系/班別</th>
                  <th className="px-5 py-4">筆數</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(row => (
                  <tr
                    key={`${row.region}-${row.school}`}
                    tabIndex={0}
                    onClick={() => setSelectedMinimumEntry(row)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedMinimumEntry(row);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-indigo-50/40 focus:bg-indigo-50/60 focus:outline-none"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-indigo-600">{row.region}</td>
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-900">{row.school}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex min-w-16 justify-center rounded-2xl bg-indigo-50 px-3 py-2 font-mono text-lg font-black text-indigo-700 ring-1 ring-indigo-100">
                        {row.totalPoints}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-mono font-black text-amber-600">{row.totalCredits ?? '-'}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-600">{row.year} 年</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.department}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-slate-500">{row.count} 筆</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {selectedMinimumEntry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
            onClick={() => setSelectedMinimumEntry(null)}
          />

          <div className="relative max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600">
                    {selectedMinimumEntry.region}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                    {selectedMinimumEntry.year} 年
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                    一般生
                  </span>
                </div>
                <h3 className="break-words text-xl font-black leading-7 text-slate-900">
                  {selectedMinimumEntry.school}
                </h3>
                <p className="mt-1 break-words text-sm font-bold text-slate-500">
                  {selectedMinimumEntry.department}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMinimumEntry(null)}
                className="shrink-0 rounded-2xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-100 transition-colors hover:text-slate-700"
                aria-label="關閉詳細資料"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(86vh-120px)] overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                  <span className="block text-xs font-black text-indigo-500">總積分</span>
                  <strong className="mt-1 block font-mono text-3xl font-black leading-none text-indigo-700">
                    {selectedMinimumEntry.totalPoints}
                  </strong>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                  <span className="block text-xs font-black text-amber-500">總積點</span>
                  <strong className="mt-1 block font-mono text-3xl font-black leading-none text-amber-600">
                    {selectedMinimumEntry.totalCredits ?? '-'}
                  </strong>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[
                  ['國文', selectedMinimumEntry.scores.chinese],
                  ['英文', selectedMinimumEntry.scores.english],
                  ['數學', selectedMinimumEntry.scores.math],
                  ['自然', selectedMinimumEntry.scores.nature],
                  ['社會', selectedMinimumEntry.scores.social],
                  ['作文', `${selectedMinimumEntry.scores.writing}級`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                    <span className="block text-[10px] font-black text-slate-400">{label}</span>
                    <strong className="mt-1 block font-mono text-lg font-black text-slate-800">{value}</strong>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <span className="block text-xs font-black text-slate-400">同校一般生資料筆數</span>
                  <strong className="mt-1 block text-lg font-black text-slate-700">
                    {selectedMinimumEntry.count} 筆
                  </strong>
                </div>
              </div>

              {selectedMinimumEntry.notes && (
                <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <span className="block text-xs font-black text-slate-400">補充說明</span>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-600">
                    {selectedMinimumEntry.notes}
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs font-bold leading-5 text-slate-400">
                此彈窗顯示的是目前篩選條件下，該校一般生資料中總積分最低的來源紀錄。
              </p>
            </div>
          </div>
        </div>
      )}

      {isRegionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsRegionModalOpen(false)}
          />

          <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={regionSearchTerm}
                  onChange={(event) => setRegionSearchTerm(event.target.value)}
                  placeholder="搜尋區域..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="shrink-0 rounded-xl p-2 font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                取消
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion('all');
                  setIsRegionModalOpen(false);
                }}
                className="group flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left font-medium text-slate-700 transition-colors last:border-0 hover:bg-indigo-50"
              >
                <span className="group-hover:text-indigo-700">所有區域</span>
                {selectedRegion === 'all' && <Check className="h-4 w-4 text-indigo-500" />}
              </button>

              {regionModalOptions.length > 0 ? (
                regionModalOptions.map(region => {
                  const hasData = regions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(region);
                        setIsRegionModalOpen(false);
                      }}
                      className="group flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left font-medium text-slate-700 transition-colors last:border-0 hover:bg-indigo-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="group-hover:text-indigo-700">{region}</span>
                        {!hasData && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">
                            無資料
                          </span>
                        )}
                      </span>
                      {selectedRegion === region && <Check className="h-4 w-4 text-indigo-500" />}
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-3 px-4 py-12 text-center text-sm text-slate-400">
                  <div className="rounded-full bg-slate-50 p-4">
                    <Search className="h-6 w-6 text-slate-300" />
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

const App: React.FC = () => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
      const saved = localStorage.getItem('cap_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [pendingNavigationTab, setPendingNavigationTab] = useState<ActiveTab | null>(null);

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
    setLoadError(null);
    if (isManualRefresh) {
        logUserAction('refresh_data', 'User Triggered');
    }

    try {
      const data = await fetchEntries();
      data.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(data);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '資料載入失敗，請稍後再試。';
      setLoadError(message);
      logUserAction('load_data_failed', message);
    }

    // Add a small artificial delay for better UX (skeleton visibility)
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Initial load
  useEffect(() => {
    logUserAction('app_open', `Initial Load`);
    loadData();
  }, [loadData]);

  const performTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    logUserAction('tab_change', tab);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleTabChange = (tab: typeof activeTab) => {
    if (activeTab === 'form' && tab !== 'form' && isFormDirty) {
      setPendingNavigationTab(tab);
      return;
    }

    performTabChange(tab);
  };

  const handleConfirmLeaveForm = () => {
    if (!pendingNavigationTab) return;
    setIsFormDirty(false);
    const nextTab = pendingNavigationTab;
    setPendingNavigationTab(null);
    performTabChange(nextTab);
  };

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('cap_disclaimer_accepted', 'true');
    handleTabChange('list');
    logUserAction('accept_disclaimer', 'agreed');
  };

  const handleAddEntry = async (newEntry: Omit<ScoreEntry, 'id' | 'timestamp'>) => {
    if (isEntryYearLocked(newEntry.year)) {
      alert(ENTRY_LOCK_MESSAGE);
      return;
    }

    const entry: ScoreEntry = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    const success = await submitEntry(entry);
    if (success) {
      setEntries(prev => [entry, ...prev]);
      setIsFormDirty(false);
      performTabChange('list');
      setShowThankYouModal(true);
      return;
    }

    alert("資料同步到雲端失敗，請檢查網路或 API 設定後再試一次。");
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
    <div className="font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden min-h-screen">

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />

      {showThankYouModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={() => setShowThankYouModal(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-7 text-center sm:p-9">
              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[28px] border-emerald-100/70" />
              <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-indigo-100/70 blur-3xl" />

              <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-200">
                <Check className="h-8 w-8" />
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Submitted</p>
                <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">感謝你的分享</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-500">
                  你的錄取資料已成功送出，會成為下一位考生判斷志願時很有用的參考。
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setShowThankYouModal(false);
                  handleTabChange('form');
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
              >
                再分享一筆
              </button>
              <button
                type="button"
                onClick={() => setShowThankYouModal(false)}
                className="rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
              >
                查看分享資料
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Greeting Modal */}
      <GreetingModal />

      {pendingNavigationTab && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={() => setPendingNavigationTab(null)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-200">
            <div className="bg-amber-50 p-5 ring-1 ring-amber-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Unsaved changes</p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">資料尚未送出</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm font-bold leading-7 text-slate-600">
                你正在填寫「分享你的錄取數據」。如果現在離開，目前尚未送出的內容可能會遺失。
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPendingNavigationTab(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                >
                  繼續填寫
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeaveForm}
                  className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-[0.98]"
                >
                  放棄並離開
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFavoritesModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={() => setShowFavoritesModal(false)}
          />

          <div className="relative flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-slate-50 shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Favorites</p>
                  <h3 className="text-xl font-black text-slate-900">我的收藏</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFavoritesModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
                aria-label="關閉收藏"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <ScoreCompare
                entries={entries}
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
              />
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
        className={`fixed right-0 top-0 z-[70] h-full w-[90vw] max-w-[390px] overflow-hidden border-l border-white/80 bg-slate-50 shadow-[-24px_0_80px_-30px_rgba(15,23,42,0.25)] transition-transform duration-500 cubic-bezier(0.16,1,0.3,1) ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="relative flex h-full flex-col overflow-y-auto px-5 pb-6 pt-5 sm:px-7 sm:pt-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-200/70 blur-[80px]"></div>
          <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-indigo-100/80 blur-[90px]"></div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(79,70,229,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,.8)_1px,transparent_1px)] [background-size:32px_32px]"></div>

          <div className="relative z-10 mb-7 flex items-start justify-between">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">Student tools</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">升學工具箱</h2>
              <p className="mt-2 max-w-[260px] text-sm font-medium leading-6 text-slate-500">
                查榜、分析、探索與分享，一站找到需要的升學工具。
              </p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:rotate-90 hover:bg-slate-900 hover:text-white"
              aria-label="關閉功能選單"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="relative z-10 space-y-3">
            <p className="px-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">站內功能</p>
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setShowShareModal(true);
              }}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-[1.4rem] border border-white/15 bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-left shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-white/10"></div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                <Share2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block font-black text-white">分享這個網站</span>
                <span className="mt-0.5 block text-xs font-medium text-indigo-100">QR Code・LINE・社群分享</span>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1" />
            </button>

            {favoriteIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowFavoritesModal(true);
                }}
                className="group flex w-full items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 transition-transform group-hover:scale-110">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block font-black text-slate-800">查看收藏</span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-400">{favoriteIds.length} 筆收藏・落點比較</span>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-rose-500" />
              </button>
            )}

            <p className="px-1 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">升學服務</p>
            <a
              href="https://tyctw.github.io/front/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'exam_results')}
              className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/15 transition-all group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950">
                <Search className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block font-black text-slate-800">會考查榜</span>
                <span className="mt-0.5 block text-xs font-medium text-slate-400">錄取榜單・快速查詢</span>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-amber-300" />
            </a>

            <a 
              href="https://tyctw.github.io/spare/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'spare_analysis')}
              className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-400/15 text-indigo-300 ring-1 ring-indigo-300/15 transition-all group-hover:scale-110 group-hover:bg-indigo-400 group-hover:text-slate-950">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <span className="block font-black text-slate-800">落點分析</span>
                 <span className="mt-0.5 block text-xs font-medium text-slate-400">精準預測・歷年比對</span>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-indigo-300" />
            </a>

            <a 
              href="https://tyctw.github.io/Navigation/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'navigation_info')}
              className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/15 transition-all group-hover:scale-110 group-hover:bg-emerald-400 group-hover:text-slate-950">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <span className="block font-black text-slate-800">更多資訊</span>
                 <span className="mt-0.5 block text-xs font-medium text-slate-400">升學導航・校系介紹</span>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-emerald-300" />
            </a>
          </nav>
          
          <div className="relative z-10 mt-auto pt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                   <GraduationCap className="h-4 w-4" />
                 </div>
                 <div>
                   <p className="text-xs font-black text-slate-800">CAP Score Sharing</p>
                   <p className="text-[10px] font-medium text-slate-400">Made for students, by students.</p>
                 </div>
                 <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-black text-emerald-300">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {favoriteIds.length > 0 && (
        <button
          type="button"
          onClick={() => setShowFavoritesModal(true)}
          className="fixed bottom-28 right-4 z-50 flex items-center gap-2 rounded-full border border-rose-100 bg-white/90 px-4 py-3 text-sm font-black text-slate-700 shadow-[0_12px_36px_-18px_rgba(15,23,42,0.65)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-600 md:bottom-8 md:right-8"
          aria-label="查看收藏"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Heart className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
              {favoriteIds.length}
            </span>
          </span>
          <span className="hidden sm:inline">查看收藏</span>
        </button>
      )}

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
                  會考錄取<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">分享平台</span>
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase origin-left scale-90">CAP Score Sharing</p>
            </div>
          </div>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100/50 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] gap-1">
             <NavButton id="list" label="瀏覽" icon={BookOpen} />
             <NavButton id="minimums" label="最低" icon={Table2} />
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
            <MobileNavButton id="minimums" label="最低" icon={Table2} />
            <MobileNavButton id="stats" label="統計" icon={BarChart3} />
            <div className="w-px h-8 bg-slate-200/60 mx-1"></div>
            <MobileNavButton id="form" label="分享" icon={PlusCircle} />
         </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-28 sm:pb-16">
        
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
            
            {!isLoading && loadError && !['guide', 'disclaimer', 'privacy'].includes(activeTab) && (
                 <div className="mb-8 overflow-hidden rounded-2xl border border-rose-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                      <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                          <CloudOff className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                          <h4 className="font-black text-slate-800 text-lg">資料載入失敗</h4>
                          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                              {loadError}
                          </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadData(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-[0.98]"
                      >
                        <RefreshCw className="h-4 w-4" />
                        重新載入
                      </button>
                    </div>
                 </div>
            )}

            {!isLoading && !loadError && entries.length === 0 && !['guide', 'minimums', 'disclaimer', 'privacy'].includes(activeTab) && (
                 <div className="mb-8 bg-white/50 backdrop-blur-md border border-amber-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                        <CloudOff className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">目前沒有資料</h4>
                        <p className="text-slate-500 text-sm mt-1">
                            資料庫目前沒有可顯示的錄取分享。<br className="hidden sm:block"/>
                            歡迎成為第一位分享者。
                        </p>
                    </div>
                 </div>
            )}

            {activeTab === 'guide' && (
                <Guide onNavigate={(tab) => handleTabChange(tab)} />
            )}

            {activeTab === 'list' && (
            <div className="space-y-12">
                 {/* Editorial data-driven hero */}
                 <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_80px_-45px_rgba(15,23,42,0.38)] ring-1 ring-slate-200/70 sm:rounded-[2.75rem]">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-sky-100/90 blur-[90px]"></div>
                        <div className="absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-indigo-100/80 blur-[100px]"></div>
                        <div className="absolute inset-0 opacity-[0.38] [background-image:linear-gradient(rgba(99,102,241,.11)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.11)_1px,transparent_1px)] [background-size:42px_42px]"></div>
                    </div>

                    <div className="relative grid min-h-[510px] items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.08fr_.92fr] lg:px-14 lg:py-16">
                        <div className="max-w-xl">
                            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-100 bg-indigo-50/85 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-md sm:text-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70"></span>
                                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                                </span>
                                <span>115會考</span>
                                <span className="h-3 w-px bg-indigo-200"></span>
                                <span className="text-slate-500">數據即時更新</span>
                            </div>

                            <h2 className="text-[2.65rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-900 sm:text-6xl lg:text-[4.25rem]">
                                精準落點，
                                <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-sky-500 to-amber-500 bg-clip-text text-transparent">
                                    預見你的未來
                                </span>
                            </h2>

                            <p className="mt-6 max-w-lg text-base font-medium leading-8 text-slate-600 sm:text-lg">
                                彙整全台各區真實錄取分數，透明公開。<br className="hidden sm:block" />
                                拒絕資訊焦慮，用數據規劃最適合的升學藍圖。
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => handleTabChange('form')}
                                    className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-6 py-4 text-base font-black text-white shadow-[0_16px_35px_-18px_rgba(15,23,42,0.65)] transition-all hover:-translate-y-1 hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-[0.98] sm:w-auto"
                                >
                                    <PlusCircle className="h-5 w-5 text-indigo-200 transition-transform duration-500 group-hover:rotate-90" />
                                    我要分享分數
                                    <ArrowRight className="h-4 w-4 text-white/55 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                                </button>
                                <button
                                    onClick={() => handleTabChange('guide')}
                                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98] sm:w-auto"
                                >
                                    <BookOpen className="h-5 w-5 text-indigo-500" />
                                    新手指南
                                </button>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />匿名分享</span>
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />各區自動計分</span>
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />免費查詢</span>
                            </div>
                        </div>

                        <div className="relative hidden min-h-[390px] lg:block" aria-hidden="true">
                            <div className="absolute left-3 top-5 w-[88%] rotate-[-3deg] rounded-[2rem] border border-indigo-100 bg-white/60 p-5 opacity-80 shadow-sm backdrop-blur-xl"></div>
                            <div className="absolute right-0 top-0 w-[92%] rotate-2 rounded-[2rem] border border-sky-100 bg-white/70 p-5 opacity-90 shadow-sm backdrop-blur-xl"></div>

                            <div className="absolute inset-x-4 top-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            桃連區・114 年
                                        </div>
                                        <p className="text-lg font-black text-slate-900">理想高中錄取分享</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">匿名考生提供的真實經驗</p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600 ring-1 ring-emerald-100">
                                        已錄取
                                    </div>
                                </div>

                                <div className="mt-7 grid grid-cols-6 gap-2">
                                    {[
                                      ['國', 'A++'], ['英', 'A+'], ['數', 'A++'],
                                      ['自', 'A'], ['社', 'A+'], ['作', '5級']
                                    ].map(([subject, grade]) => (
                                      <div key={subject} className="rounded-xl border border-slate-200 bg-slate-50 px-1 py-3 text-center">
                                        <span className="block text-[9px] font-bold text-slate-400">{subject}</span>
                                        <strong className="mt-1 block text-xs font-black text-slate-800">{grade}</strong>
                                      </div>
                                    ))}
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                                        <span className="text-[10px] font-bold tracking-widest text-indigo-500">總積分</span>
                                        <strong className="mt-1 block text-3xl font-black text-indigo-700">31</strong>
                                    </div>
                                    <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                                        <span className="text-[10px] font-bold tracking-widest text-amber-500">總積點</span>
                                        <strong className="mt-1 block text-3xl font-black text-amber-600">33</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-2 bottom-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/90 p-3 pr-5 shadow-xl backdrop-blur-xl">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Data powered</p>
                                    <p className="text-sm font-black text-slate-800">真實資料，安心參考</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </section>

                <ScoreList
                    entries={entries}
                    isLoading={isLoading}
                    favoriteIds={favoriteIds}
                    toggleFavorite={toggleFavorite}
                    onRefresh={() => loadData(true)}
                    isRefreshing={isLoading}
                />
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

            {activeTab === 'minimums' && (
                <div className="space-y-8">
                    {isLoading ? (
                         <AppLoader />
                    ) : (
                        <MinimumScoresPage entries={entries} />
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
            <div className="max-w-4xl mx-auto">
                <ScoreForm onSubmit={handleAddEntry} onDirtyChange={setIsFormDirty} />
            </div>
            )}

            {activeTab === 'disclaimer' && (
              <DisclaimerPage onBack={handleAcceptDisclaimer} />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPage onBack={() => handleTabChange('list')} />
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
                    <a
                         href={`mailto:${CONTACT_EMAIL}`}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <MailWarning className="w-4 h-4" />
                        <span>聯絡資訊</span>
                    </a>
                    <button 
                         onClick={() => handleTabChange('disclaimer')}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>免責聲明</span>
                    </button>
                    <button 
                         onClick={() => handleTabChange('privacy')}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        <span>隱私權與版權聲明</span>
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col items-center gap-4 text-xs font-semibold text-slate-400">
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-500 transition-colors hover:text-indigo-600">
                    聯絡信箱：{CONTACT_EMAIL}
                </a>
                <p>
                    Copyright © 2024-{new Date().getFullYear()} TYCTW會考落點. All rights reserved.
                </p>
            </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
