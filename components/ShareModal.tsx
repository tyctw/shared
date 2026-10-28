import navigatorIllustration from '../assets/illustrations/cap-navigator-v1.png';
import React, { useEffect } from 'react';
import {
  AtSign,
  Check,
  Copy,
  ExternalLink,
  ArrowUpRight,
  GraduationCap,
  Instagram,
  Link2,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedMessage, setCopiedMessage] = React.useState('已複製網站連結');
  const shareUrl = window.location.href;
  const shareTitle = document.title;
  const shareText = '一起用真實錄取資料，找到更適合自己的升學方向。';

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const sheet = document.querySelector<HTMLElement>('.share-sheet');
    sheet?.querySelector<HTMLButtonElement>('.share-sheet-close')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !sheet) return;
      const controls = Array.from(sheet.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyLink = async (message = '已複製網站連結') => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedMessage(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
      }
    }

    await copyLink();
  };

  const handleLineShare = () => {
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(`${shareTitle}\n${shareText}\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleIGShare = () => {
    void copyLink('網址已複製，可貼到 IG 分享');
  };

  const handleThreadsShare = () => {
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="share-sheet-overlay" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <button type="button" className="share-sheet-backdrop" onClick={onClose} aria-label="關閉分享視窗" />
      <div className="share-sheet share-sheet--v2">
        <header className="share-v2-top"><span><GraduationCap size={18} />會考錄取分享平台</span><button type="button" onClick={onClose} aria-label="關閉" className="share-sheet-close"><X size={19} /></button></header>
        <div className="share-v2-intro"><div><p className="share-v2-eyebrow">GOOD THINGS ARE BETTER SHARED</p><h3 id="share-modal-title">把好工具，<br /><span>分享給同學。</span></h3><p className="share-v2-description">找方向的路上，有你一起更好。<br />把這份升學地圖，傳給正在需要的人。</p></div><img src={navigatorIllustration} width={1254} height={1254} alt="拿著望遠鏡的貓頭鷹升學領航員" /></div>
        <div className="share-v2-content"><section className="share-v2-qr" aria-label="掃碼分享"><p><span>01</span> 面對面，掃一下。</p><div className="share-v2-qr-frame"><QRCodeSVG value={shareUrl} size={170} level="H" fgColor="#24271e" bgColor="#fffef8" includeMargin={true} title="掃碼開啟目前頁面" /></div><span className="share-v2-qr-caption">手機掃碼，立刻開始探索 <ArrowUpRight size={12} /></span></section>
          <section className="share-v2-social" aria-label="選擇分享方式"><p><span>02</span> 傳給在意的人。</p><div className="share-v2-channels">
            <button type="button" onClick={handleLineShare} aria-label="分享到 LINE"><span className="share-v2-channel-icon"><MessageCircle size={21} /></span><span><strong>LINE</strong><small>傳給同學或升學群組</small></span><ArrowUpRight size={17} /></button>
            <button type="button" onClick={handleIGShare} aria-label="複製連結分享到 Instagram"><span className="share-v2-channel-icon"><Instagram size={21} /></span><span><strong>Instagram</strong><small>複製連結，貼進聊天或限動</small></span><Copy size={15} /></button>
            <button type="button" onClick={handleThreadsShare} aria-label="分享到 Threads"><span className="share-v2-channel-icon"><AtSign size={21} /></span><span><strong>Threads</strong><small>分享給也在找方向的人</small></span><ArrowUpRight size={17} /></button>
          </div></section></div>
        <div className="share-v2-bottom"><button type="button" onClick={handleNativeShare} className="share-v2-native"><Send size={16} />使用其他 App 分享<ExternalLink size={14} /></button><div className="share-v2-link"><div><span>或直接分享連結</span><p title={shareUrl}>{shareUrl}</p></div><button type="button" onClick={() => void copyLink()} className={copied ? 'is-copied' : ''}>{copied ? <Check size={16} /> : <Link2 size={16} />}<span>{copied ? '複製成功' : '複製連結'}</span></button></div><p className="share-v2-status" role="status" aria-live="polite">{copied ? copiedMessage : '✳  你的分享，可能就是別人需要的那個方向。'}</p></div>
      </div>
    </div>
  );
};

export default ShareModal;
