import React from 'react';

type Props = { number: string; eyebrow: string; title: string; highlight: string; description: string; children?: React.ReactNode };

/** Shared editorial heading for every step beyond the home page. */
export default function PageIntro({ number, eyebrow, title, highlight, description, children }: Props) {
  return <header className="cap-page-intro">
    <div className="cap-page-meta"><span>{number} / {eyebrow}</span><span>YOUR NEXT CHAPTER ↗</span></div>
    <div className="cap-page-intro-body"><div className="cap-page-intro-copy"><h2>{title}<br /><mark>{highlight}</mark></h2><p>{description}</p></div>
      <div className="cap-page-symbol" aria-hidden="true"><svg viewBox="0 0 220 190" fill="none"><circle cx="112" cy="92" r="71" fill="#bdf45b"/><circle cx="112" cy="92" r="58" stroke="#24271e" strokeOpacity=".3"/><ellipse cx="112" cy="92" rx="99" ry="27" stroke="#24271e" transform="rotate(-32 112 92)"/><path d="M72 123l19-59 59-19-19 59z" fill="#24271e" stroke="#24271e" strokeWidth="2"/><path d="M91 64l21 20 19 20-59 19z" fill="#f8f7ef" stroke="#24271e" strokeWidth="2"/><circle cx="112" cy="84" r="5" fill="#bdf45b" stroke="#24271e" strokeWidth="2"/><path d="M178 35v-20m-10 10h20M39 147v-14m-7 7h14" stroke="#24271e" strokeWidth="1.5"/><circle cx="174" cy="134" r="4" fill="#24271e"/></svg><span>{number}</span></div>
    </div>
    {children && <div className="cap-page-intro-extra">{children}</div>}
  </header>;
}
