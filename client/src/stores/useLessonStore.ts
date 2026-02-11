import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LessonProgress {
  completed: boolean
  lastAccessed: string
}

interface LessonState {
  progress: Record<string, LessonProgress>
  markCompleted: (lessonId: string) => void
  markAccessed: (lessonId: string) => void
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set) => ({
      progress: {},
      markCompleted: (lessonId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: {
              completed: true,
              lastAccessed: new Date().toISOString(),
            },
          },
        })),
      markAccessed: (lessonId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: {
              completed: state.progress[lessonId]?.completed ?? false,
              lastAccessed: new Date().toISOString(),
            },
          },
        })),
    }),
    { name: 'financeforge-lessons' }
  )
)
