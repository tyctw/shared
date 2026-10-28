import React from 'react';
import { ArrowUpRight, Check, ChevronDown, Copy, Heart, MapPin, Quote, Flag, GraduationCap } from 'lucide-react';
import type { ScoreEntry } from '../types';

type Props = {
  entry: ScoreEntry;
  isFavorite: boolean;
  isMinimum: boolean;
  copied: boolean;
  onFavorite?: () => void;
  onCopy: () => void;
  reportHref: string;
};
const subjects = [['chinese', '國文'], ['english', '英文'], ['math', '數學'], ['nature', '自然'], ['social', '社會']] as const;

export default function AdmissionCard({ entry, isFavorite, isMinimum, copied, onFavorite, onCopy, reportHref }: Props) {
  const note = entry.notes?.trim();
  const longNote = !!note && note.length > 42;
  const titleId = React.useId();
  return <article className={`admission-card${isFavorite ? ' admission-card--saved' : ''}`} aria-labelledby={titleId}>
    <div className="admission-card-topline"><span className="admission-year">{entry.year}<small>會考</small></span><span className="admission-region"><MapPin size={12} />{entry.region}</span><span className="admission-record-label">ADMISSION RECORD</span></div>
    <div className="admission-school"><div><h3 id={titleId}>{entry.school}</h3><p>{entry.department || '未提供科系'}<span aria-hidden="true">/</span><span className="admission-identity">{entry.studentIdentity ?? '一般生'}</span></p></div><GraduationCap className="admission-school-symbol" size={27} strokeWidth={1.3} aria-hidden="true" /></div>
    <div className="admission-score-strip"><div className="admission-main-score"><span>總積分</span><strong>{entry.totalPoints}</strong></div><div className="admission-secondary-score"><span>總積點</span><strong>{entry.totalCredits ?? '—'}</strong></div><span className="admission-score-caption">依就學區計分<ArrowUpRight size={15} aria-hidden="true" /></span></div>
    <div className="admission-body">
      <div className="admission-grades" aria-label="各科會考成績">{subjects.map(([key, label]) => <div key={key} className={entry.scores[key].startsWith('A') ? 'admission-grade admission-grade--a' : 'admission-grade'}><span>{label}</span><strong>{entry.scores[key]}</strong></div>)}<div className="admission-grade admission-grade--writing"><span>作文</span><strong>{entry.scores.writing}<small>級</small></strong></div></div>
      {isMinimum && <p className="admission-minimum"><span aria-hidden="true">↘</span> 同校同年最低錄取分享<span className="admission-minimum-note">目前收錄資料</span></p>}
      {note && (longNote ? <details className="admission-note"><summary><span className="admission-note-label"><Quote size={13} aria-hidden="true" /> 學長姐筆記 <ChevronDown className="admission-note-chevron" size={14} aria-hidden="true" /></span><span className="admission-note-preview">{note.slice(0,42)}…</span><span className="admission-note-toggle"><span className="admission-note-expand">展開全文</span><span className="admission-note-collapse">收起筆記</span></span></summary><p>{note}</p></details> : <div className="admission-note admission-note--short"><span className="admission-note-label"><Quote size={13} aria-hidden="true" /> 學長姐筆記</span><p>{note}</p></div>)}
    </div>
    <div className="admission-card-footer"><span className="admission-anonymous"><i /> 匿名分享<small>僅供升學參考</small></span><div className="admission-actions">
      {onFavorite && <button type="button" onClick={onFavorite} aria-label={`${isFavorite ? '取消收藏' : '加入收藏'}：${entry.school}`} aria-pressed={isFavorite} className={isFavorite ? 'admission-action admission-action--saved' : 'admission-action'}><Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} /><span>{isFavorite ? '已收藏' : '收藏'}</span></button>}
      <button type="button" onClick={onCopy} aria-label={`複製分享內容：${entry.school}`} className="admission-action"><span aria-hidden="true">{copied ? <Check size={15} /> : <Copy size={15} />}</span><span aria-live="polite">{copied ? '已複製' : '複製'}</span></button>
      <a className="admission-action admission-action--report" href={reportHref} aria-label={`Email 回報資料錯誤：${entry.school}`} title="回報資料錯誤"><Flag size={14} /></a>
    </div></div>
  </article>;
}
