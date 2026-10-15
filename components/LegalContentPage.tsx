import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Mail, Shield, ShieldAlert } from 'lucide-react';
import { DISCLAIMER_SECTIONS, PRIVACY_SECTIONS, LEGAL_CONTACT_EMAIL, LEGAL_UPDATED_AT, type LegalPageKind } from '../data/legalContent';
import { pageHref, resolvePageRoute } from '../utils/pageRoutes';

interface Props {
  kind: LegalPageKind;
  onBack: () => void;
  onNavigate: (kind: LegalPageKind) => void;
}
const linkClass = 'font-medium text-indigo-700 underline underline-offset-4 hover:text-indigo-900 break-words';
const requestSubject = '資料更正／刪除／權利申請';
const requestBody = '申請類型：\n問題網址或資料 ID：\n會考年度／就學區／學校與科別：\n約略投稿時間：\n需處理欄位與理由：\n本人／代理關係說明：\n\n請勿附上未遮蔽的身分證、准考證、完整成績單或診斷資料。';
const requestUrl = `mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(requestSubject)}&body=${encodeURIComponent(requestBody)}`;
const providers = [
  { name: 'GitHub Pages', purpose: '網站託管及網頁資源傳送。', data: '載入網站時的連線與請求技術資訊，依 GitHub 政策處理。', url: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', label: 'GitHub 隱私聲明' },
  { name: 'Supabase', purpose: '錄取投稿資料庫與查詢。', data: '投稿欄位、系統 ID、時間及資料庫連線或維運所需資訊。', url: 'https://supabase.com/privacy', label: 'Supabase 隱私政策' },
  { name: 'Google Analytics／AdSense', purpose: '流量觀察、廣告與成效衡量。', data: '頁面與裝置資訊、Cookie 或識別資訊等，依服務及設定而定。', url: 'https://policies.google.com/technologies/partner-sites?hl=zh-TW', label: 'Google 合作網站資料說明' },
  { name: 'Google Fonts', purpose: '下載網站字型。', data: '字型請求所需的連線技術資訊；不以投稿為前提。', url: 'https://policies.google.com/privacy?hl=zh-TW', label: 'Google 隱私政策' },
  { name: 'Tailwind CDN', purpose: '載入網站樣式資源。', data: '資源請求所需的網路及裝置資訊；不代表會收到完整投稿。', url: 'https://tailwindcss.com/', label: '服務網站' },
];

function RequestBox() {
  return <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
    <p className="text-sm font-semibold text-slate-800">需要更正、刪除或提出權利申請？</p>
    <p className="mt-2 text-sm leading-7 text-slate-600">來信附上資料 ID 或可定位紀錄的資訊、申請事項與理由。寄送前請遮蔽不必要的個資；此連結只會開啟您的郵件工具，不會自動送信。</p>
    <a href={requestUrl} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 underline underline-offset-4"><Mail aria-hidden="true" className="h-4 w-4" />開啟申請信件範本</a>
  </div>;
}

export default function LegalContentPage({ kind, onBack, onNavigate }: Props) {
  const isPrivacy = kind === 'privacy';
  const sections = isPrivacy ? PRIVACY_SECTIONS : DISCLAIMER_SECTIONS;
  useEffect(() => {
    let frame: number | null = null;
    const scrollToLinkedSection = () => {
      const section = sections.find(item => window.location.hash === `#${kind}-${item.id}`);
      if (!section) return;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.getElementById(`${kind}-${section.id}`)?.scrollIntoView({ block: 'start' });
      });
    };
    scrollToLinkedSection();
    window.addEventListener('hashchange', scrollToLinkedSection);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToLinkedSection);
    };
  }, [kind]);
  const title = isPrivacy ? '隱私權與版權聲明' : '免責聲明';
  const otherKind = isPrivacy ? 'disclaimer' : 'privacy';
  const otherTitle = isPrivacy ? '免責聲明' : '隱私權與版權聲明';
  const otherHref = pageHref(otherKind, resolvePageRoute(window.location.pathname).base);
  const quickPoints = isPrivacy ? [
    '投稿會用於公開查詢與統計；未填姓名仍可能被間接辨識。',
    '本機收藏與雲端投稿不同；清除收藏不會刪除已投稿資料。',
    '本站載入 Google 分析及廣告服務，可能使用 Cookie。',
  ] : [
    '匿名錄取回報不是官方門檻，也不保證個人錄取結果。',
    '平台樣本與全國官方統計的來源和分母不同。',
    '本聲明不排除依法不得免除的責任與使用者的法定權利。',
  ];
  const navigateOther = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault(); onNavigate(otherKind);
  };
  return <div className="mx-auto max-w-4xl space-y-6">
    <header className={`rounded-2xl border p-5 sm:p-8 ${isPrivacy ? 'border-indigo-100 bg-indigo-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
      <div className="flex items-start gap-3 sm:gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isPrivacy ? 'bg-indigo-600' : 'bg-amber-600'} text-white`}>{isPrivacy ? <Shield aria-hidden="true" className="h-6 w-6" /> : <ShieldAlert aria-hidden="true" className="h-6 w-6" />}</div>
        <div className="min-w-0"><h2 className="text-2xl font-bold leading-9 text-slate-900 sm:text-3xl">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-500">最後更新：{LEGAL_UPDATED_AT} · 適用於目前平台功能</p></div></div>
      <p className="mt-5 text-sm leading-7 text-slate-600">{isPrivacy ? '說明哪些資料會被處理、如何公開與保存、第三方服務的影響，以及您的資料與著作權相關權利。' : '說明回報與統計資料的性質、使用限制、官方資訊的優先性，以及平台與使用者的責任範圍。'}</p>
      <ul className="mt-4 space-y-2 rounded-xl bg-white/80 p-4">{quickPoints.map(point => <li key={point} className="flex gap-2 text-sm leading-7 text-slate-700"><span aria-hidden="true" className="text-indigo-500">•</span>{point}</li>)}</ul>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm"><button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-indigo-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />返回資料列表</button><a href={otherHref} onClick={navigateOther} className="inline-flex items-center gap-1.5 font-medium text-indigo-700">閱讀{otherTitle}<ArrowRight aria-hidden="true" className="h-4 w-4" /></a></div>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-label="聲明目錄">
      <h3 className="font-semibold text-slate-900">快速查閱</h3><nav aria-label={`${title}目錄`} className="mt-4 grid gap-2 sm:grid-cols-2">{sections.map((section, index) => <a key={section.id} href={`${window.location.pathname}#${kind}-${section.id}`} className="rounded-lg px-2 py-2 text-sm leading-6 text-slate-600 hover:bg-slate-50 hover:text-indigo-700">{index + 1}. {section.title}</a>)}</nav>
      <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">平台聯絡窗口：<a className={linkClass} href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a></p>
    </section>

    <div className="space-y-4">{sections.map((section, index) => <section id={`${kind}-${section.id}`} key={section.id} aria-labelledby={`${kind}-${section.id}-title`} className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h3 id={`${kind}-${section.id}-title`} className="text-lg font-bold leading-8 text-slate-900">{index + 1}. {section.title}</h3>
      <div className="mt-4 space-y-3">{section.paragraphs.map(paragraph => <p key={paragraph} className="text-[15px] leading-8 text-slate-600">{paragraph}</p>)}</div>
      {section.bullets && <ul className="mt-4 space-y-2">{section.bullets.map(item => <li key={item} className="flex items-start gap-2 text-sm leading-7 text-slate-600"><span aria-hidden="true" className="text-indigo-500">•</span>{item}</li>)}</ul>}
      {section.extra === 'request' && <RequestBox />}
      {section.extra === 'controls' && <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4"><h4 className="text-sm font-semibold text-slate-800">您可以使用的外部設定</h4><ul className="mt-3 space-y-3 text-sm"><li><a className={linkClass} href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google 廣告個人化設定</a></li><li><a className={linkClass} href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics 退出外掛程式</a></li><li><a className={linkClass} href="https://policies.google.com/technologies/partner-sites?hl=zh-TW" target="_blank" rel="noopener noreferrer">Google 如何使用合作網站資訊</a></li></ul><p className="mt-3 text-xs leading-6 text-slate-500">這些是外部設定，不是本站內建的 Cookie 同意面板。您亦可使用瀏覽器的封鎖、清除網站資料等功能；不同設定不一定停止所有資料傳輸。</p></div>}
      {section.extra === 'providers' && <><p className="mt-4 text-xs text-slate-500 sm:hidden">下表可左右滑動，查看服務用途與資料項目。</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><caption className="sr-only">第三方服務及可能處理的資料</caption><thead className="border-b border-slate-200 text-slate-500"><tr><th scope="col" className="px-3 py-3">服務</th><th scope="col" className="px-3 py-3">功能</th><th scope="col" className="px-3 py-3">資料與說明</th></tr></thead><tbody>{providers.map(provider => <tr key={provider.name} className="border-b border-slate-100 last:border-0"><th scope="row" className="px-3 py-4 font-medium text-slate-800">{provider.name}</th><td className="px-3 py-4 leading-7 text-slate-600">{provider.purpose}</td><td className="px-3 py-4 leading-7 text-slate-600">{provider.data}<a href={provider.url} target="_blank" rel="noopener noreferrer" className={`mt-2 block text-xs ${linkClass}`}>{provider.label}</a></td></tr>)}</tbody></table></div></>}
    </section>)}</div>

    <footer className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h3 className="font-semibold text-slate-900">相關法規與官方說明</h3><ul className="mt-3 space-y-3 text-sm">
        {[
          ['個人資料保護法（請留意條文生效狀態）', 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021'],
          ['著作權法', 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0070017'],
          ['民法第 222 條：故意或重大過失責任', 'https://mojlaw.moj.gov.tw/LawContentExtent.aspx?LSID=fl001351&LawNo=222&media=print'],
          ['智慧財產局：事實、數據與著作權的範圍', 'https://www.tipo.gov.tw/tw/copyright/692-16404.html'],
        ].map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-start gap-1.5 ${linkClass}`}>{label}<ExternalLink aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0" /></a></li>)}
      </ul><p className="mt-4 text-xs leading-6 text-slate-500">外部參考連結有助查閱原文；本頁文字不取代當時有效法律，也不表示政府機關對本站提供背書。</p>
    </footer>
  </div>;
}
