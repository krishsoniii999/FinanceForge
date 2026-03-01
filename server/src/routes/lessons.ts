import { Router } from 'express'
import { supabase } from '../services/supabase'

const router = Router()
const USER_ID = 'default'

router.get('/progress', async (_req, res, next) => {
  try {
    const { data } = await supabase.from('lesson_progress').select('*').eq('user_id', USER_ID)

    const progress: Record<string, { completed: boolean; lastAccessed: string }> = {}
    for (const row of data || []) {
      progress[row.lesson_id] = {
        completed: row.completed,
        lastAccessed: row.completed_at || new Date().toISOString(),
      }
    }
    res.json(progress)
  } catch (err) {
    next(err)
  }
})

router.post('/progress/:lessonId', async (req, res, next) => {
  try {
    const { lessonId } = req.params
    const { completed } = req.body
    const now = new Date().toISOString()

    await supabase.from('lesson_progress').upsert(
      { user_id: USER_ID, lesson_id: lessonId, completed: completed ?? true, completed_at: now },
      { onConflict: 'user_id,lesson_id' }
    )

    const { data } = await supabase.from('lesson_progress').select('*').eq('user_id', USER_ID)

    const progress: Record<string, { completed: boolean; lastAccessed: string }> = {}
    for (const row of data || []) {
      progress[row.lesson_id] = {
        completed: row.completed,
        lastAccessed: row.completed_at || now,
      }
    }
    res.json(progress)
  } catch (err) {
    next(err)
  }
})

export default router
