import React from 'react';
import { X, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = window.location.origin;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLineShare = () => {
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent('來看看這個會考落點分享平台！\n' + shareUrl)}`);
  };

  const handleIGShare = () => {
     // IG doesn't have a direct link share like line, maybe tell user to copy link
     handleCopyLink();
     alert('已複製網址！可以到 Instagram 限時動態分享囉～');
  };
  
  const handleThreadsShare = () => {
      // Threads web intent allows prefilling text via intent URL
      window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent('大推這個會考落點分享平台！\n\n' + shareUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-slate-800 mb-6">分享這個網站</h3>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
           <QRCodeSVG 
               value={shareUrl} 
               size={200}
               level="H"
               className="mx-auto"
               includeMargin={false}
           />
        </div>

        <div className="w-full flex justify-between gap-3 mb-6">
            <button 
                onClick={handleLineShare}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-3 bg-[#06C755] hover:bg-[#05B54D] text-white rounded-2xl transition-all"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="text-[10px] font-bold">LINE</span>
            </button>
            <button 
                onClick={handleIGShare}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584] hover:opacity-90 text-white rounded-2xl transition-all"
            >
                <div className="border-2 border-white rounded-[8px] w-6 h-6 flex items-center justify-center relative">
                    <div className="w-2.5 h-2.5 border-2 border-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full absolute top-[2px] right-[2px]"></div>
                </div>
                <span className="text-[10px] font-bold">IG</span>
            </button>
            <button 
                onClick={handleThreadsShare}
                className="flex-1 flex flex-col items-center justify-center gap-2 p-3 bg-black hover:bg-zinc-800 text-white rounded-2xl transition-all"
            >
                <span className="font-serif text-lg font-bold leading-none select-none">@</span>
                <span className="text-[10px] font-bold">Threads</span>
            </button>
        </div>

        <button 
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '已複製網址！' : '複製網站連結'}</span>
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
