import { createClient } from '@supabase/supabase-js';
import { Grade, Region, ScoreEntry, SubjectScores, WritingGrade } from '../types';
import { calculateRegionalScore } from '../utils/scoreCalculator';

// ===============================
// Initialize Supabase Client
// ===============================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const VALID_GRADES = new Set<Grade>(['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C']);
const VALID_WRITING_GRADES = new Set<number>([0, 1, 2, 3, 4, 5, 6]);

const normalizeScores = (scores: any): SubjectScores | null => {
  const parsedScores = typeof scores === 'string' ? JSON.parse(scores) : scores;
  if (!parsedScores || typeof parsedScores !== 'object') return null;

  const normalized = {
    chinese: String(parsedScores.chinese || ''),
    english: String(parsedScores.english || ''),
    math: String(parsedScores.math || ''),
    nature: String(parsedScores.nature || ''),
    social: String(parsedScores.social || ''),
    writing: Number(parsedScores.writing),
  };

  const subjects = [
    normalized.chinese,
    normalized.english,
    normalized.math,
    normalized.nature,
    normalized.social,
  ];

  if (!subjects.every(score => VALID_GRADES.has(score as Grade))) return null;
  if (!VALID_WRITING_GRADES.has(normalized.writing)) return null;

  return normalized as SubjectScores;
};

const parseScoresSafely = (scores: any) => {
  if (typeof scores !== 'string') return scores;
  try {
    return JSON.parse(scores);
  } catch {
    return scores;
  }
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const sameNumber = (actual: unknown, expected: number | null) => {
  const actualNumber = toNullableNumber(actual);
  if (actualNumber === null || expected === null) return actualNumber === expected;
  return Math.abs(actualNumber - expected) < 0.001;
};

const getCorrectedScorePayload = (item: any) => {
  try {
    const scores = normalizeScores(item.scores);
    if (!scores || !item.region) return null;

    const calculated = calculateRegionalScore(item.region as Region, scores);
    const expectedPoints = Number(calculated.points);
    const expectedCredits = calculated.credits === '' ? null : Number(calculated.credits);

    if (!Number.isFinite(expectedPoints)) return null;

    const currentPoints = item.total_points ?? item.totalPoints;
    const currentCredits = item.total_credits ?? item.totalCredits;
    const needsPointFix = !sameNumber(currentPoints, expectedPoints);
    const needsCreditFix = !sameNumber(currentCredits, expectedCredits);

    if (!needsPointFix && !needsCreditFix) {
      return {
        entry: {
          ...item,
          scores,
          totalPoints: toNullableNumber(currentPoints) ?? expectedPoints,
          totalCredits: toNullableNumber(currentCredits) ?? undefined,
        } as ScoreEntry,
        update: null,
      };
    }

    const update = {
      total_points: expectedPoints,
      total_credits: expectedCredits,
    };

    return {
      entry: {
        ...item,
        scores,
        totalPoints: expectedPoints,
        totalCredits: expectedCredits ?? undefined,
      } as ScoreEntry,
      update,
    };
  } catch (error) {
    console.warn('Unable to validate score entry:', item?.id, error);
    return null;
  }
};

const repairScoreEntries = async (items: any[]): Promise<ScoreEntry[]> => {
  const repairedEntries: ScoreEntry[] = [];
  const updates: Array<{ id: string; update: { total_points: number; total_credits: number | null } }> = [];

  items.forEach(item => {
    const result = getCorrectedScorePayload(item);
    if (!result) {
      repairedEntries.push({
        ...item,
        scores: parseScoresSafely(item.scores),
        totalPoints: item.total_points ?? item.totalPoints,
        totalCredits: item.total_credits ?? item.totalCredits,
      } as ScoreEntry);
      return;
    }

    repairedEntries.push(result.entry);
    if (result.update && item.id) {
      updates.push({ id: item.id, update: result.update });
    }
  });

  if (updates.length > 0) {
    const results = await Promise.allSettled(
      updates.map(({ id, update }) =>
        supabase
          .from('score_entries')
          .update(update)
          .eq('id', id)
      )
    );

    const failedCount = results.filter(result => {
      if (result.status === 'rejected') return true;
      return Boolean(result.value.error);
    }).length;

    if (failedCount > 0) {
      console.warn(`Score repair completed with ${failedCount} failed update(s).`);
    }
  }

  return repairedEntries;
};

// ===============================
// Fetch Entries（讀取資料）
// ===============================
export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('score_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) return [];

    return await repairScoreEntries(data);
  } catch (error) {
    console.error('Error fetching entries from Supabase:', error);
    return [];
  }
};

// ===============================
// Submit Entry（寫入資料）
// ===============================
export const submitEntry = async (entry: ScoreEntry): Promise<boolean> => {
   try {
    const { error } = await supabase
      .from('score_entries')
      .insert([
        {
          id: entry.id,
          year: entry.year,
          school: entry.school,
          department: entry.department || null,
          region: entry.region,
          scores: parseScoresSafely(entry.scores),
          total_points: entry.totalPoints,
          total_credits: entry.totalCredits ?? null,
          notes: entry.notes || '',
          timestamp: entry.timestamp,
        }
      ]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Submit error:', error);
    return false;
  }
};

// ===============================
// Log User Action
// ===============================
export const logUserAction = (action: string, detail?: string): void => {
  try {
    console.log('[USER_ACTION]', {
      action,
      detail: detail ?? '',
      timestamp: Date.now(),
    });

  } catch (error) {
    console.warn('logUserAction failed:', error);
  }
};
