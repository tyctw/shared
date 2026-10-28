import navigatorIllustration from '../assets/illustrations/cap-navigator-v1.png';
import React from 'react';
import { ArrowDown, ArrowUpRight, Check, Compass, Heart, Search } from 'lucide-react';
import type { ActiveTab } from '../utils/pageRoutes';

export default function RouteHero({ year, onNavigate }: { year: string | number; onNavigate: (tab: ActiveTab) => void }) {
  const explore = () => document.getElementById('score-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return <>
    <section className="chapter-hero" aria-labelledby="route-hero-title">
      <div className="chapter-meta"><span><i /> {year} 會考錄取分享平台</span><span>MADE FOR STUDENTS, BY STUDENTS.</span><span>VOL. 01 — YOUR NEXT CHAPTER</span></div>
      <div className="chapter-main">
        <div className="chapter-copy">
          <p className="chapter-kicker"><span>升學這一題</span> 我們陪你一起解。</p>
          <h2 id="route-hero-title">下一站，<br /><span>由你</span>決定<span className="chapter-period">。</span></h2>
          <p className="chapter-description">分數只是起點，未來還有很多可能。<br />從學長姐的真實錄取經驗，找到屬於你的方向。</p>
          <div className="chapter-actions"><button onClick={explore} className="chapter-primary">找到我的方向 <ArrowUpRight size={22} /></button><button onClick={() => onNavigate('form')} className="chapter-secondary">分享錄取經驗 <ArrowUpRight size={17} /></button></div>
          <div className="chapter-promises"><span><Check size={13} /> 免費查詢</span><span><Check size={13} /> 匿名分享</span><span><Check size={13} /> 一起讓資訊透明</span></div>
        </div>
        <figure className="chapter-illustration chapter-illustration--navigator">
          <img src={navigatorIllustration} width={1254} height={1254} alt="會考平台專屬領航員：拿著望遠鏡的貓頭鷹站在升學地圖上，亮綠色路線穿過山丘，通往理想校園。" fetchPriority="high" decoding="async" />
          <figcaption><span>✳</span> 每一種可能，都值得探索。</figcaption>
        </figure>
      </div>
      <div className="chapter-foot"><p><span>↗</span> 不必一個人猜。<strong>一起把方向找出來。</strong></p><button onClick={explore}>往下探索 <ArrowDown size={17} /></button></div>
    </section>
    <section className="route-tools" aria-label="升學探索工具"><div className="route-tools-intro"><span>TAKE YOUR NEXT STEP</span><h3>方向，一起找。</h3></div>{[{id:'minimums',n:'01',icon:Search,title:'查錄取門檻',desc:'各校歷年最低錄取分享'},{id:'stats',n:'02',icon:Compass,title:'看數據全貌',desc:'從分數分布，找到參考方向'},{id:'insights',n:'03',icon:Heart,title:'做好升學準備',desc:'選校策略與實用升學資訊'}].map(t=><button key={t.id} onClick={()=>onNavigate(t.id as ActiveTab)}><span className="route-tool-number">{t.n}</span><div><h4>{t.title} <ArrowUpRight size={16}/></h4><p>{t.desc}</p></div><t.icon size={24} strokeWidth={1.4}/></button>)}</section>
    <div className="route-explorer-heading" id="score-explorer"><div><p className="route-eyebrow">REAL SCORES. REAL STORIES.</p><h2>看看大家，走到了哪裡。</h2></div><span>每一筆分享，都讓升學資訊更透明 ↙</span></div>
  </>;
}
