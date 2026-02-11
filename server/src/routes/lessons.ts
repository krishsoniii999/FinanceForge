import { Router } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()
const DATA_DIR = path.join(__dirname, '..', 'data')
const PROGRESS_FILE = path.join(DATA_DIR, 'lesson-progress.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadProgress(): Record<string, { completed: boolean; lastAccessed: string }> {
  ensureDataDir()
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2))
    return {}
  }
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
}

function saveProgress(data: Record<string, { completed: boolean; lastAccessed: string }>) {
  ensureDataDir()
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2))
}

router.get('/progress', (_req, res) => {
  res.json(loadProgress())
})

router.post('/progress/:lessonId', (req, res) => {
  const { lessonId } = req.params
  const { completed } = req.body
  const progress = loadProgress()
  progress[lessonId] = {
    completed: completed ?? true,
    lastAccessed: new Date().toISOString(),
  }
  saveProgress(progress)
  res.json(progress)
})

export default router
