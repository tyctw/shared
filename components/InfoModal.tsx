import React, { useState } from 'react';
import { X, BookOpen, Sparkles, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "序位區間是什麼？",
      a: "「個人序位區間」是將該就學區所有參加免試入學學生的超額比序積分（含會考成績、多元學習表現等）由高至低排列後，計算出學生所在的排名百分比區間（例如：0.3%~1%）。這能幫助學生預估自己的落點位置。"
    },
    {
      q: "志願序重要嗎？",
      a: "非常重要！大多數就學區（如基北、中投、高雄）都有「志願序積分」，填在越前面的志願積分越高。建議將「最想讀且有機會」的學校填在前面，並務必填寫「保險志願」以免落榜。"
    },
    {
      q: "忘記帳號密碼怎麼辦？",
      a: "請立即洽詢您就讀國中的「註冊組」或「教務處」協助重置密碼。若為個別報名學生，請聯繫該區免試入學委員會。"
    },
    {
      q: "可以跨區報名嗎？",
      a: "若您因搬家、戶籍遷徙等因素需變更就學區，必須在規定時間內向原就讀國中提出申請，經審核通過後才能跨區參加免試入學。"
    },
    {
      q: "五專可以一起報名嗎？",
      a: "可以。高中職免試入學與五專優先免試入學是分開的管道，可以同時報名，但報到時只能擇一報到。"
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/50 ring-1 ring-black/5 flex flex-col">
        
        {/* Header */}
        <div className="bg-white/50 p-6 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm shrink-0">
             <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    使用說明與常見問題
                </h3>
            </div>
            <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
            
            {/* Precautions Section */}
            <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                    志願選填注意事項
                </h4>
                <ul className="space-y-4">
                    {[
                        "請務必確認您的「就學區」，跨區選填需依規定辦理。",
                        "建議先查詢「個別序位區間」，了解自己在該區的落點位置。",
                        "志願序非常重要，建議依「最想讀」到「最保險」的順序排列。",
                        "選填完畢後，務必在期限內由學校集體報名或個人送件。"
                    ].map((item, idx) => (
                        <li key={idx} className="flex gap-4 items-start group">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-black mt-0.5 border border-indigo-200">{idx + 1}</span>
                            <span className="text-slate-600 text-sm font-medium leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    常見問題 (FAQ)
                </h4>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index}
                            className={`rounded-2xl transition-all duration-300 border ${
                                openFaqIndex === index 
                                ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
                                : 'bg-white border-slate-100 hover:border-indigo-100'
                            }`}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                            >
                                <span className={`font-bold text-sm ${openFaqIndex === index ? 'text-indigo-700' : 'text-slate-700'}`}>
                                    {faq.q}
                                </span>
                                {openFaqIndex === index ? (
                                    <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                )}
                            </button>
                            
                            <div 
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    openFaqIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed font-medium border-t border-indigo-100/50 pt-3 mx-2">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Help Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/10">
                 {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[64px] opacity-30 -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500 rounded-full mix-blend-overlay filter blur-[40px] opacity-20 -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                        </div>
                        需要更多協助？
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 opacity-90 font-medium">
                        對於超額比序積分、志願選填系統操作有疑問嗎？建議前往各區委員會網站查看最新簡章，或諮詢學校輔導室。
                    </p>
                    
                    <a 
                        href="https://cap.rcpet.edu.tw/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center w-full px-5 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors gap-2 text-sm shadow-lg"
                    >
                        前往國中教育會考網站 <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <div className="text-center">
                 <p className="text-xs text-slate-400 font-medium">
                    本網站僅提供連結彙整，實際日程與規定請以官方公告為準。
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};