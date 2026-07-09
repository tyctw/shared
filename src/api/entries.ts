import { ScoreEntry } from '../types'
import { supabase } from '../lib/supabase'
import { isEntryYearLocked } from '../../utils/entryOpenLock'

const SUPABASE_PAGE_SIZE = 1000

// ===============================
// Fetch Entries（讀取資料）
// ===============================
export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    const rows: any[] = []

    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
      const { data, error } = await supabase
        .from('score_entries')
        .select('*')
        .range(from, from + SUPABASE_PAGE_SIZE - 1)

      if (error) {
        console.error('Supabase error:', error)
        return []
      }

      rows.push(...(data || []))

      if (!data || data.length < SUPABASE_PAGE_SIZE) {
        break
      }
    }

    return rows.map((item: any) => ({
      ...item,
      scores: typeof item.scores === 'string' ? JSON.parse(item.scores) : item.scores,
      studentIdentity: item.student_identity ?? item.studentIdentity ?? '一般生',
      totalPoints: item.total_points ?? item.totalPoints,
      totalCredits: item.total_credits ?? item.totalCredits,
    }))
  } catch (error) {
    console.error('Error fetching entries:', error)
    return []
  }
}

// ===============================
// Submit Entry（寫入資料）
// ===============================
export const submitEntry = async (entry: ScoreEntry): Promise<boolean> => {
  try {
    if (isEntryYearLocked(entry.year)) {
      return false
    }

    const { error } = await supabase
      .from('score_entries')
      .insert([{
        id: entry.id,
        year: entry.year,
        school: entry.school,
        department: entry.department || null,
        student_identity: entry.studentIdentity,
        region: entry.region,
        scores: typeof entry.scores === 'string' ? JSON.parse(entry.scores) : entry.scores,
        total_points: entry.totalPoints,
        total_credits: entry.totalCredits ?? null,
        notes: entry.notes || '',
        timestamp: entry.timestamp,
      }])

    if (error) {
      console.error('Insert error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Submit error:', error)
    return false
  }
}

// ===============================
// Log User Action
// ===============================
export const logUserAction = (action: string, detail?: string): void => {
  console.log('[USER_ACTION]', {
    action,
    detail: detail ?? '',
    timestamp: Date.now(),
  })
}
