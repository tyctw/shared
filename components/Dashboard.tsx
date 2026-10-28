import PageIntro from './PageIntro';
import { useEntryYears } from '../hooks/useEntryYears';
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { BarChart3, Download, RotateCcw, Users, School, MapPin, Clock } from 'lucide-react';
import { ScoreEntry } from '../types';
import { GRADES, REGIONS } from '../constants';
import { NATIONAL_STATS, NATIONAL_TOTALS, NATIONAL_SOURCES } from '../data/nationalStats';
import { calculateDashboardStats, percentage } from '../utils/dashboardStats';

type Props = { entries: ScoreEntry[] };
const formatNumber = (value: number) => value.toLocaleString('zh-TW');
const formatPoints = (value: number | null) => value === null ? '—' : value.toLocaleString('zh-TW', { maximumFractionDigits: 2 });
const percent = (value: number, valid = true) => valid ? `${value.toFixed(1)}%` : '—';
const panel = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6';
const selectClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const gradeColors = ['#293321', '#52753a', '#8bb55a', '#bdf45b', '#cbd7b6', '#dedfca', '#b7aa7e'];

function Panel({ id, title, description, children }: { id?: string; title: string; description?: string; children: React.ReactNode }) {
  return <section id={id} className={`${panel} scroll-mt-28`}><h4 className="text-base font-bold text-slate-900">{title}</h4>
    {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
    <div className="mt-5">{children}</div></section>;
}
function Empty({ children = '此條件下尚無可統計資料。' }: { children?: React.ReactNode }) {
  return <p className="flex min-h-40 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm leading-6 text-slate-500">{children}</p>;
}
function Distribution({ data, valid }: { data: { name: string; count: number; share: number }[]; valid: number }) {
  if (!valid) return <Empty />;
  return <><div className="h-56" aria-hidden="true"><ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, left: -20, right: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
      <Tooltip formatter={(value, _name, item) => [`${formatNumber(Number(value))} 筆（${percent(item.payload.share)}）`, '回報筆數']} />
      <Bar dataKey="count" name="回報筆數" fill="#5b7d3d" radius={[4, 4, 0, 0]} maxBarSize={38} isAnimationActive={false} />
    </BarChart>
  </ResponsiveContainer></div>
  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{data.map(row => <div key={row.name} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
    <p className="font-semibold text-slate-700">{row.name}</p><p className="mt-1 text-slate-500">{formatNumber(row.count)} 筆 · {percent(row.share)}</p>
  </div>)}</div></>;
}

export default function Dashboard({ entries }: Props) {
  const availableYears = useEntryYears();
  const [year, setYear] = useState('all');
  const [region, setRegion] = useState('all');
  const [identity, setIdentity] = useState('all');
  const [officialYear, setOfficialYear] = useState<keyof typeof NATIONAL_STATS>('115');
  const years = useMemo(() => [...new Set([...availableYears, ...entries.map(e => e.year)])].sort((a, b) => b - a), [entries, availableYears]);
  const identities = useMemo(() => [...new Set(entries.map(e => e.studentIdentity || '一般生'))].sort((a, b) => a.localeCompare(b, 'zh-Hant')), [entries]);
  const stats = useMemo(() => calculateDashboardStats(entries, { year, region, identity }), [entries, year, region, identity]);
  const subjectChart = stats.subjects.map(subject => ({ name: subject.name, ...subject.percentages }));
  const official = NATIONAL_STATS[officialYear].map(row => ({ ...row, percentage: percentage(row.count, NATIONAL_TOTALS[officialYear]) }));
  const officialYears = Object.keys(NATIONAL_TOTALS) as (keyof typeof NATIONAL_TOTALS)[];
  const scope = `${year === 'all' ? '全部年度' : `${year} 年`} · ${region === 'all' ? '全部就學區' : region} · ${identity === 'all' ? '全部身分' : identity}`;
  const latest = stats.latest ? new Date(stats.latest).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '尚無有效回報時間';

  const exportSummary = () => {
    const rows: (string | number)[][] = [
      ['統計範圍', scope], ['資料來源', '平台匿名回報；非官方錄取門檻'],
      ['回報筆數', stats.total], ['涵蓋學校', stats.schoolCount], ['五科完整筆數', stats.completeGrades],
      [], ['科目', '有效筆數', ...GRADES],
      ...stats.subjects.map(subject => [subject.name, subject.valid, ...GRADES.map(grade => subject.counts[grade])]),
      [], ['A 等級科數', '筆數', '占五科完整資料比例 (%)'],
      ...stats.aDistribution.map(row => [row.name, row.count, stats.completeGrades ? row.share.toFixed(2) : '—']),
      [], ['寫作級分', '筆數', '占寫作有效資料比例 (%)'],
      ...stats.writingDistribution.map(row => [row.name, row.count, stats.writingValid ? row.share.toFixed(2) : '—']),
      [], ['就學區', '回報筆數', '占篩選結果比例 (%)'],
      ...stats.regions.map(row => [row.name, row.count, row.share.toFixed(2)]),
      [], ['考生身分', '回報筆數', '占篩選結果比例 (%)'],
      ...stats.identities.map(row => [row.name, row.count, row.share.toFixed(2)]),
      [], ['年度', '回報筆數', '有效積分筆數（單一就學區）', '平均積分', '積分中位數'],
      ...stats.years.map(row => [row.name, row.count, region === 'all' ? '—' : row.points.count,
        region === 'all' ? '—' : formatPoints(row.points.average), region === 'all' ? '—' : formatPoints(row.points.median)]),
      ...(stats.points ? [[], ['就學區積分摘要', region], ['有效積分筆數', stats.points.count],
        ['平均積分', formatPoints(stats.points.average)], ['中位數', formatPoints(stats.points.median)],
        ['第 25 百分位', formatPoints(stats.points.q1)], ['第 75 百分位', formatPoints(stats.points.q3)]] : []),
      [], ['學校', '就學區', '回報筆數', '占篩選結果比例 (%)', '有效積分筆數', '回報最低積分', '回報中位數', '回報最高積分'],
      ...stats.schools.map(row => [row.school, row.region, row.count, row.share.toFixed(2), row.points.count,
        formatPoints(row.points.min), formatPoints(row.points.median), formatPoints(row.points.max)]),
      [], ['全國官方參考年度', officialYear], ['五科皆有效考生人數', NATIONAL_TOTALS[officialYear]],
      ['官方來源', NATIONAL_SOURCES[officialYear]], ['A 等級科數', '人數', '占有效考生比例 (%)'],
      ...official.map(row => [row.category, row.count, row.percentage.toFixed(2)]),
    ];
    const csv = '\uFEFF' + rows.map(row => row.map(cell => {
      // Treat exported user-entered text as text when opened in spreadsheet apps.
      const value = String(cell);
      return `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `會考統計-${year}-${region}-${identity}.csv`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="space-y-6">
    <PageIntro number="03" eyebrow="READ THE DATA / 數據統計" title="讓數據，" highlight="說得更清楚。" description="從樣本範圍、成績分布到年度變化，讀懂每一筆匿名分享，也看見資料的適用範圍。">
      <div className="cap-stat-toolbar"><span>依年度、就學區與考生身分探索統計</span><button onClick={exportSummary} disabled={!stats.total} className="cap-ink-button"><Download size={16} /> 匯出統計 CSV</button></div>
    </PageIntro>

    <section className={panel} aria-label="統計篩選">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="text-xs font-semibold text-slate-600">會考年度<select aria-label="統計會考年度" className={selectClass} value={year} onChange={e => setYear(e.target.value)}><option value="all">全部年度</option>{years.map(y => <option key={y} value={y}>{y} 年</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">就學區<select aria-label="統計就學區" className={selectClass} value={region} onChange={e => setRegion(e.target.value)}><option value="all">全部就學區</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">考生身分<select aria-label="統計考生身分" className={selectClass} value={identity} onChange={e => setIdentity(e.target.value)}><option value="all">全部身分</option>{identities.map(i => <option key={i} value={i}>{i}</option>)}</select></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p aria-live="polite" className="text-xs leading-6 text-slate-600">{scope} · 符合 {formatNumber(stats.total)} / 全站 {formatNumber(entries.length)} 筆</p>
        <button onClick={() => { setYear('all'); setRegion('all'); setIdentity('all'); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600"><RotateCcw className="h-3.5 w-3.5" />重設篩選</button>
      </div>
      <p className="mt-2 text-xs leading-6 text-slate-500">以下為考生自願分享的樣本，可能偏向特定學校或成績；回報比例不代表全體考生分布，回報最低積分也不是官方錄取門檻。</p>
    </section>

    <nav aria-label="統計區塊" className="flex flex-wrap gap-2">
      {[['subject-distribution', '成績分布'], ['point-summary', '積分摘要'], ['yearly-summary', '年度變化'], ['school-summary', '學校摘要'], ['official-summary', '全國官方參考']].filter(([id]) => stats.total > 0 || id === 'official-summary').map(([id, label]) => <a key={id} href={`${window.location.pathname}#${id}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600">{label}</a>)}
    </nav>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        { label: '符合條件的回報', value: formatNumber(stats.total), detail: '筆匿名分享資料', icon: Users },
        { label: '涵蓋學校', value: formatNumber(stats.schoolCount), detail: '以就學區＋學校計算', icon: School },
        { label: '涵蓋就學區', value: formatNumber(stats.regionCount), detail: `五科完整資料 ${formatNumber(stats.completeGrades)} 筆`, icon: MapPin },
        { label: '今日新增回報', value: formatNumber(stats.today), detail: '依台灣時間及目前篩選', icon: Clock },
      ].map(card => <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs text-slate-500">{card.label}</p><card.icon className="h-4 w-4 shrink-0 text-indigo-500" /></div><p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{card.value}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{card.detail}</p></div>)}
    </div>
    <p className="text-xs text-slate-500">目前篩選內最新回報：{latest}（台灣時間）</p>
    {!stats.total && <Empty>目前篩選沒有回報資料，請調整年度、就學區或身分。下方全國官方參考資料仍可查看。</Empty>}

    {stats.total > 0 && <>
    <Panel id="subject-distribution" title="各科成績分布" description="每科各自統計；圖表顯示該科有效回報中的比例，表格提供筆數與比例。A++、A+、A 皆屬精熟。">
      {stats.subjects.some(subject => subject.valid > 0) ? <>
        <div className="h-64" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={subjectChart} layout="vertical" margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" /><XAxis type="number" domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, String(name)]} /><Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
          {GRADES.map((grade, index) => <Bar key={grade} dataKey={grade} stackId="grades" fill={gradeColors[index]} maxBarSize={25} isAnimationActive={false} />)}
        </BarChart></ResponsiveContainer></div>
        <p className="mt-4 text-[11px] text-slate-400 sm:hidden">表格可左右滑動，查看各等級筆數與比例。</p>
        <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[660px] text-left text-xs"><caption className="sr-only">各科成績筆數及占各科有效資料比例</caption>
          <thead className="border-b border-slate-200 text-slate-500"><tr>{['科目', '有效筆數', ...GRADES, '精熟比例'].map(label => <th scope="col" key={label} className="px-2 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{stats.subjects.map(subject => <tr key={subject.key} className="border-b border-slate-100 last:border-0"><th scope="row" className="px-2 py-3 font-semibold text-slate-700">{subject.name}</th><td className="px-2 py-3">{subject.valid}</td>{GRADES.map(grade => <td key={grade} className="px-2 py-3 tabular-nums"><span className="block text-slate-700">{subject.counts[grade]} 筆</span><span className="text-[10px] text-slate-400">{percent(subject.percentages[grade], subject.valid > 0)}</span></td>)}<td className="px-2 py-3 font-semibold text-indigo-600">{percent(subject.aShare, subject.valid > 0)}</td></tr>)}</tbody>
        </table></div>
      </> : <Empty />}
      <p className="mt-4 text-xs leading-5 text-slate-500">缺漏或無效等級不計入該科分母；各科樣本數可能不同。</p>
    </Panel>

    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="A 等級科數分布" description={`以五科完整資料 ${formatNumber(stats.completeGrades)} 筆為分母；5A 表示五科皆為 A、A+ 或 A++。`}><Distribution data={stats.aDistribution} valid={stats.completeGrades} /></Panel>
      <Panel title="寫作測驗級分分布" description={`以有效寫作資料 ${formatNumber(stats.writingValid)} 筆為分母；缺漏級分不當作 0 級分。`}><Distribution data={stats.writingDistribution} valid={stats.writingValid} /></Panel>
    </div>

    <Panel id="point-summary" title="就學區積分摘要" description="各區積分制度不同，請選擇單一就學區查看。所有數字均為目前篩選中的回報積分。">
      {region === 'all' ? <Empty>選擇上方「就學區」，即可查看平均數、中位數與分布範圍。</Empty> : stats.points && stats.points.count > 0 ? <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[
          ['有效積分筆數', formatNumber(stats.points.count)], ['平均積分', formatPoints(stats.points.average)], ['中位數', formatPoints(stats.points.median)],
          ['最低回報', formatPoints(stats.points.min)], ['最高回報', formatPoints(stats.points.max)], ['中間 50% 範圍', `${formatPoints(stats.points.q1)}～${formatPoints(stats.points.q3)}`],
        ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-2 text-lg font-bold tabular-nums text-slate-800">{value}</p></div>)}</div>
        <p className="mt-4 text-xs leading-6 text-slate-500">中位數代表一半回報在此值以下、一半在此值以上；中間 50% 範圍為第 25～75 百分位。{year === 'all' ? '目前合併各年度回報，建議再選年度觀察。' : ''}{identity === 'all' ? '目前包含不同考生身分，可再選身分縮小範圍。' : ''}{stats.points.count < 5 ? '目前有效積分少於 5 筆，數值容易受單筆回報影響。' : ''}</p>
      </> : <Empty>此就學區目前沒有有效積分資料。</Empty>}
    </Panel>

    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="就學區回報分布" description={`占目前篩選 ${formatNumber(stats.total)} 筆的比例，依筆數排序。`}>
        {stats.regions.length ? <div className="space-y-4">{stats.regions.map(row => <div key={row.name}><div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="font-semibold text-slate-700">{row.name}</span><span className="tabular-nums text-slate-500">{formatNumber(row.count)} 筆 · {percent(row.share)}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-400" style={{ width: `${row.share}%` }} /></div></div>)}</div> : <Empty />}
      </Panel>
      <Panel title="考生身分分布" description="身分缺漏的舊資料依平台規則歸為一般生；筆數與比例隨篩選更新。">
        {stats.identities.length ? <ul className="divide-y divide-slate-100">{stats.identities.map(row => <li key={row.name} className="flex items-start justify-between gap-3 py-3 text-xs"><span className="text-slate-700">{row.name}</span><span className="shrink-0 tabular-nums text-slate-500">{formatNumber(row.count)} 筆 · {percent(row.share)}</span></li>)}</ul> : <Empty />}
      </Panel>
    </div>

    <Panel id="yearly-summary" title="年度回報量與積分變化" description="依會考年度整理回報筆數；回報量變化反映平台資料累積，不能直接推論錄取難度。積分只在單一就學區顯示。">
      {stats.years.length ? <>
        <div className="h-56" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.years} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tickFormatter={value => `${value}年`} /><YAxis allowDecimals={false} /><Tooltip formatter={value => [`${formatNumber(Number(value))} 筆`, '回報筆數']} /><Bar dataKey="count" fill="#8cae61" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-xs"><caption className="sr-only">年度回報摘要</caption><thead className="border-b text-slate-500"><tr>{['年度', '回報筆數', '有效積分筆數', '平均積分', '中位數'].map(label => <th key={label} scope="col" className="px-2 py-3">{label}</th>)}</tr></thead><tbody>{stats.years.map(row => <tr key={row.name} className="border-b border-slate-100 last:border-0"><th scope="row" className="px-2 py-3">{row.name}</th><td className="px-2 py-3">{row.count}</td><td className="px-2 py-3">{region === 'all' ? '—' : row.points.count}</td><td className="px-2 py-3">{region === 'all' ? '—' : formatPoints(row.points.average)}</td><td className="px-2 py-3">{region === 'all' ? '—' : formatPoints(row.points.median)}</td></tr>)}</tbody></table></div>
      </> : <Empty />}
    </Panel>

    <Panel id="school-summary" title="學校回報摘要 Top 10" description="按回報筆數排序，同名學校依就學區分開；積分摘要限各列的同一就學區，未分科系／班別。">
      {stats.schools.length > 0 && <p className="mb-3 text-[11px] text-slate-400 sm:hidden">表格可左右滑動，查看完整積分摘要。</p>}
      {stats.schools.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><caption className="sr-only">回報最多的十所學校與積分摘要</caption><thead className="border-b text-slate-500"><tr>{['學校／就學區', '筆數／占比', '有效積分筆數', '最低回報', '中位數', '最高回報'].map(label => <th key={label} scope="col" className="px-3 py-3">{label}</th>)}</tr></thead><tbody>{stats.schools.slice(0, 10).map((row, index) => <tr key={row.name} className="border-b border-slate-100 last:border-0"><th scope="row" className="px-3 py-3 font-medium"><p className="text-slate-800">{index + 1}. {row.school}</p><p className="mt-1 font-normal text-slate-400">{row.region}</p></th><td className="px-3 py-3">{row.count} 筆<span className="mt-1 block text-slate-400">{percent(row.share)}</span></td><td className="px-3 py-3">{row.points.count}</td><td className="px-3 py-3">{formatPoints(row.points.min)}</td><td className="px-3 py-3 font-semibold text-indigo-600">{formatPoints(row.points.median)}</td><td className="px-3 py-3">{formatPoints(row.points.max)}</td></tr>)}</tbody></table></div> : <Empty />}
      <p className="mt-4 text-xs leading-6 text-slate-500">少量樣本、不同年度、身分或科系都可能影響範圍；這裡的最低回報不代表學校正式門檻。匯出檔包含所有符合篩選的學校。</p>
    </Panel>

    </>}

    <section id="official-summary" className={`${panel} scroll-mt-28 border-indigo-100`} aria-labelledby="official-heading">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs font-semibold text-indigo-600">全國官方參考 · 獨立於平台回報</p><h4 id="official-heading" className="font-bold text-slate-900">全國 A 等級科數分布</h4></div>
        <label className="text-xs text-slate-600">官方資料年度<select aria-label="官方資料年度" className={selectClass} value={officialYear} onChange={e => setOfficialYear(e.target.value as keyof typeof NATIONAL_STATS)}>{officialYears.map(y => <option key={y} value={y}>{y} 年</option>)}</select></label></div>
      <p className="mt-3 text-xs leading-6 text-slate-500">{officialYear} 年五科皆有效考生 {formatNumber(NATIONAL_TOTALS[officialYear])} 人。此分母已排除任一科缺考等情形，並非報名人數；不受上方地區或身分篩選影響。</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="h-64" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={official} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="category" /><YAxis tickFormatter={value => `${value}%`} /><Tooltip formatter={value => [`${Number(value).toFixed(2)}%`, '占有效考生比例']} /><Bar dataKey="percentage" name="比例" radius={[4, 4, 0, 0]} isAnimationActive={false}>{official.map((row, index) => <Cell key={row.category} fill={gradeColors[index]} />)}</Bar></BarChart></ResponsiveContainer></div>
        <table className="w-full text-left text-xs"><caption className="sr-only">全國官方 A 等級科數統計</caption><thead className="border-b text-slate-500"><tr><th scope="col" className="px-3 py-2">A 等級科數</th><th scope="col" className="px-3 py-2">人數</th><th scope="col" className="px-3 py-2">占有效考生比例</th></tr></thead><tbody>{official.map(row => <tr key={row.category} className="border-b border-slate-100"><th scope="row" className="px-3 py-2">{row.category}</th><td className="px-3 py-2 tabular-nums">{formatNumber(row.count)}</td><td className="px-3 py-2 tabular-nums">{row.percentage.toFixed(2)}%</td></tr>)}</tbody></table>
      </div>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[420px] text-left text-xs"><caption className="mb-3 text-left font-semibold text-slate-700">歷年全國有效考生摘要</caption><thead className="border-b text-slate-500"><tr>{['年度', '五科皆有效人數', '5A 人數', '5A 比例'].map(label => <th key={label} scope="col" className="px-3 py-2">{label}</th>)}</tr></thead><tbody>{officialYears.map(y => { const fiveA = NATIONAL_STATS[y].find(row => row.category === '5A')!; return <tr key={y} className="border-b border-slate-100"><th scope="row" className="px-3 py-2">{y}</th><td className="px-3 py-2">{formatNumber(NATIONAL_TOTALS[y])}</td><td className="px-3 py-2">{formatNumber(fiveA.count)}</td><td className="px-3 py-2">{percentage(fiveA.count, NATIONAL_TOTALS[y]).toFixed(2)}%</td></tr>; })}</tbody></table></div>
      <p className="mt-4 text-xs leading-6 text-slate-500">來源：<a href={NATIONAL_SOURCES[officialYear]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline underline-offset-2">{officialYear} 年國中教育會考官方統計（含原表）</a>。依官方細項人數合併為 0～5A，再除以五科皆有效人數；四捨五入後比例合計可能不等於 100%。</p>
    </section>
  </div>;
}
