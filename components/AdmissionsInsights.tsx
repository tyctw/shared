import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Compass,
  ExternalLink,
  HelpCircle,
  Layers3,
  LineChart,
  Map,
  Search,
  ShieldCheck,
  Target,
} from 'lucide-react';

type InsightsTab = 'list' | 'form' | 'stats' | 'minimums';

interface AdmissionsInsightsProps {
  onNavigate: (tab: InsightsTab) => void;
}

const AdmissionsInsights: React.FC<AdmissionsInsightsProps> = ({ onNavigate }) => {
  const strategyCards = [
    {
      icon: Search,
      title: '先找同校系樣本，不只看最高分',
      body: '同一個校系可能因年度、區域與身分別而有落差。建議先用學校與科別搜尋，再看最低、集中區間與樣本數，避免被單一高分或低分誤導。',
      action: '查看成績分享',
      tab: 'list' as const,
    },
    {
      icon: Layers3,
      title: '把志願分成安全、相近、挑戰三層',
      body: '安全志願用來穩住結果，相近志願是主要命中區，挑戰志願則保留夢想空間。排序時要把通勤、科別興趣與未來升學一起放進來。',
      action: '查最低錄取參考',
      tab: 'minimums' as const,
    },
    {
      icon: LineChart,
      title: '用趨勢判斷熱度，而不是只看一年',
      body: '熱門科系的分數可能連續上升，也可能因招生名額或地區選擇改變而回落。統計圖能協助你看出資料是否集中、是否正在升溫。',
      action: '看統計趨勢',
      tab: 'stats' as const,
    },
  ];

  const checklist = [
    '確認自己使用的是同一個入學管道與身分別資料。',
    '優先比較近兩到三年的資料，舊資料只當背景參考。',
    '同時看總積分、總積點與各科等級，不要只看單一數字。',
    '把交通時間、課程內容、社團資源與升學方向寫進志願表旁邊。',
    '若樣本數偏少，務必保留更多安全志願。',
  ];

  const faqItems = [
    {
      question: '最低錄取分數可以直接當作今年門檻嗎？',
      answer: '不建議直接當作門檻。最低分數比較適合當作風險參考，還要搭配今年招生名額、報名熱度、區域選擇與自己的志願排序。',
    },
    {
      question: '為什麼同一所學校不同科別落差很大？',
      answer: '科別熱門度、課程內容、升學出口、地點與產業趨勢都會影響選填意願，所以同校不同科別常常會有明顯落差。',
    },
    {
      question: '樣本數少的校系要怎麼判讀？',
      answer: '樣本數少時，單筆資料的影響會被放大。可以把它當成線索，但不要只靠它決定志願，最好再搭配官方簡章與歷年榜單。',
    },
    {
      question: '志願序要先填想去的，還是先填分數穩的？',
      answer: '志願序通常應先放真正想去的選項，再用安全志願收尾。不要因為怕浪費而把不想去的校系放太前面。',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-[0_28px_80px_-45px_rgba(15,23,42,0.7)] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-amber-400/15 blur-[90px]" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-bold text-cyan-100">
              <Compass className="h-4 w-4 text-cyan-300" />
              會考志願策略
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              不是只看分數，
              <span className="block text-cyan-200">而是把風險看懂。</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
              這裡整理會考落點、最低錄取參考、志願排序與資料判讀方法，幫助學生和家長把分數資料轉成更實際的選校決策。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ['3 層', '志願配置'],
              ['2-3 年', '趨勢比較'],
              ['5 項', '檢查清單'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-4 text-center">
                <strong className="block text-xl font-black text-white">{value}</strong>
                <span className="mt-1 block text-[10px] font-bold text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {strategyCards.map(({ icon: Icon, title, body, action, tab }) => (
          <article key={title} className="flex flex-col rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
            <p className="mt-2 flex-1 text-sm font-medium leading-7 text-slate-500">{body}</p>
            <button
              type="button"
              onClick={() => onNavigate(tab)}
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-700 transition-all hover:gap-3"
            >
              {action}
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Checklist</p>
              <h3 className="text-xl font-black text-slate-900">填志願前的 5 個檢查點</h3>
            </div>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm font-medium leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Method</p>
              <h3 className="text-xl font-black text-slate-900">安全、相近、挑戰怎麼抓</h3>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              ['安全志願', '近年資料明顯低於自己的落點，且科別與通勤都能接受。'],
              ['相近志願', '分數區間接近自己，是最需要仔細排序與比較的主戰場。'],
              ['挑戰志願', '略高於目前落點，但仍有興趣與機會，適合放在前段保留可能性。'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-white p-4 ring-1 ring-amber-100">
                <h4 className="font-black text-amber-700">{title}</h4>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: BarChart3,
            title: '資料不是保證',
            text: '分享資料能幫助判斷趨勢，但不等於官方錄取結果。最後仍要以簡章、招生名額與正式榜單為準。',
          },
          {
            icon: Map,
            title: '地區會影響選填',
            text: '同樣分數在不同區域的選擇密度不同，跨區、交通與住宿都會改變志願排序。',
          },
          {
            icon: ShieldCheck,
            title: '保留個資安全',
            text: '分享成績時避免填入姓名、電話、准考證號或社群帳號，讓資料有用也更安全。',
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-black text-slate-900">{title}</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">FAQ</p>
            <h3 className="text-xl font-black text-slate-900">常見判讀問題</h3>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {faqItems.map(({ question, answer }) => (
            <details key={question} className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 open:bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-slate-800">
                {question}
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium leading-6 text-slate-500">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-600 to-indigo-700 p-7 text-white shadow-xl shadow-cyan-100 sm:p-9">
        <AlertTriangle className="absolute right-7 top-7 h-6 w-6 text-white/35" />
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Community data</p>
          <h3 className="mt-2 text-2xl font-black">你的分享會讓下一位同學少一點焦慮。</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-cyan-50">
            若你願意匿名分享成績與志願結果，平台就能累積更完整的參考資料。資料越完整，判讀越有價值，也越能幫助學生做出適合自己的選擇。
          </p>
          <button
            type="button"
            onClick={() => onNavigate('form')}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-cyan-50"
          >
            匿名分享成績
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_18px_60px_-38px_rgba(8,145,178,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-100">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">Placement tool</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">搭配會考落點分析一起使用</h3>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                先用落點分析工具輸入成績，快速抓出可能區間；再回到本站比對歷年分享、最低錄取參考與同校系樣本，判斷哪些志願更接近安全、相近或挑戰。
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href="https://tyctw.github.io/spare/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 hover:bg-cyan-600"
            >
              開啟落點分析
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => onNavigate('minimums')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:text-cyan-700"
            >
              對照最低錄取
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdmissionsInsights;
