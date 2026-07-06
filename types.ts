export type Grade = 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C';
export type WritingGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type StudentIdentity =
  | '一般生'
  | '低收入戶生'
  | '中低收入戶生'
  | '直系血親尊親屬支領失業給付者'
  | '身心障礙生'
  | '原住民生'
  | '僑生'
  | '蒙藏生'
  | '政府派赴國外工作人員子女'
  | '境外優秀科學技術人才子女'
  | '退伍軍人';

export enum Region {
  KEELUNG_TAIPEI_NEWTAIPEI = '基北區',
  TAOYUAN = '桃連區',
  HSINCHU = '竹苗區',
  TAICHUNG = '中投區',
  CHANGHUA = '彰化區',
  YUNLIN = '雲林區',
  CHIAYI = '嘉義區',
  TAINAN = '台南區',
  KAOHSIUNG = '高雄區',
  PINGTUNG = '屏東區',
  YILAN = '宜蘭區',
  HUALIEN = '花蓮區',
  TAITUNG = '台東區',
  PENGHU = '澎湖區',
  KINMEN = '金門區',
}

export interface SubjectScores {
  chinese: Grade;
  english: Grade;
  math: Grade;
  nature: Grade;
  social: Grade;
  writing: WritingGrade;
}

export interface ScoreEntry {
  id: string;
  year: number; // ROC Year (e.g., 113)
  school: string;
  department: string;
  studentIdentity: StudentIdentity;
  region: Region;
  scores: SubjectScores;
  totalPoints: number; // e.g., 36, 108, etc. depending on region
  totalCredits?: number; // e.g. 97.5
  notes?: string;
  timestamp: number;
}

export interface AIAnalysisResult {
  analysis: string;
  strengths: string[];
  advice: string;
}
