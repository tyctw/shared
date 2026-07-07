export type ContentModerationResult = {
  isAllowed: boolean;
  cleanedText: string;
  reasons: string[];
};

const MAX_NOTES_LENGTH = 500;

const blockedPatterns: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /https?:\/\/|www\.|\.com|\.tw|\.net|\.org|\.shop|\.cc/i, reason: '請勿填寫網址或廣告連結' },
  { pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, reason: '請勿填寫 Email 或聯絡方式' },
  { pattern: /(?:\+?886[-\s]?)?0?9\d{2}[-\s]?\d{3}[-\s]?\d{3}/, reason: '請勿填寫手機號碼' },
  { pattern: /\b[A-Z][12]\d{8}\b/i, reason: '請勿填寫身分證字號' },
  { pattern: /\b\d{8,12}\b/, reason: '請勿填寫准考證號、學號或其他可識別編號' },
  { pattern: /(line|ig|instagram|facebook|fb|discord|telegram|wechat|微信|賴|加我|私訊|私信)/i, reason: '請勿留下社群帳號或私下聯絡資訊' },
  { pattern: /(幹你|幹他|幹妳|靠北|靠杯|垃圾|白癡|智障|去死|滾|廢物|王八|媽的|操你|fuck|shit|bitch|asshole)/i, reason: '請勿使用辱罵、攻擊或粗俗文字' },
  { pattern: /(支那|尼哥|黑鬼|賤民|低端人口|死同性戀|娘炮|死胖子|死肥宅)/i, reason: '請勿使用歧視或貶抑文字' },
  { pattern: /(約炮|裸照|色情|做愛|性交|性交易|援交|包養|A片|av女優)/i, reason: '請勿填寫色情或性暗示內容' },
  { pattern: /(殺了|砍死|炸掉|放火|自殺|輕生|割腕|跳樓|恐嚇)/i, reason: '請勿填寫暴力、威脅或自傷內容' },
  { pattern: /(代辦|保證錄取|穩上|買榜|作弊|外掛|破解|下注|賭博|投資群|貸款)/i, reason: '請勿填寫廣告、詐騙或違規內容' },
];

const repeatedCharacterPattern = /(.)\1{12,}/;

export const moderateNotesContent = (text: string): ContentModerationResult => {
  const normalizedText = String(text ?? '').replace(/\r\n/g, '\n').trim();
  const cleanedText = normalizedText.slice(0, MAX_NOTES_LENGTH);
  const reasons: string[] = [];

  if (normalizedText.length > MAX_NOTES_LENGTH) {
    reasons.push(`附加說明請控制在 ${MAX_NOTES_LENGTH} 字以內`);
  }

  if (repeatedCharacterPattern.test(normalizedText)) {
    reasons.push('請勿填寫大量重複或洗版內容');
  }

  blockedPatterns.forEach(({ pattern, reason }) => {
    if (pattern.test(normalizedText) && !reasons.includes(reason)) {
      reasons.push(reason);
    }
  });

  return {
    isAllowed: reasons.length === 0,
    cleanedText,
    reasons,
  };
};

