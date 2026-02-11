import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { PageTransition } from '../components/layout/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { Badge } from '../components/ui/Badge'
import { Tabs } from '../components/ui/Tabs'
import { lessons } from '../data/lessons'
import { useLessonStore } from '../stores/useLessonStore'
import { cardVariants, staggerContainer } from '../styles/animations'
import {
  GraduationCap,
  Clock,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'

const CATEGORIES = ['All', 'Basics', 'Valuation', 'Strategy', 'Technical'] as const

export function Lessons() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<string>('All')
  const { progress } = useLessonStore()

  const filteredLessons =
    category === 'All'
      ? lessons
      : lessons.filter((l) => l.category === category)

  const completedCount = lessons.filter(
    (l) => progress[l.id]?.completed
  ).length

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Learn to Invest</h1>
          <p className="text-sm text-text-secondary mt-1">
            Bite-sized lessons to build your investing knowledge
          </p>
        </div>

        {/* Progress overview */}
        <GlassCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} className="text-accent-blue" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Your Progress</h3>
                <p className="text-xs text-text-secondary">
                  {completedCount} of {lessons.length} lessons completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full sm:w-32 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-blue rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / lessons.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-text-secondary tabular-nums">
                {Math.round((completedCount / lessons.length) * 100)}%
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Category filter */}
        <Tabs tabs={CATEGORIES} active={category} onChange={setCategory} />

        {/* Lesson grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {filteredLessons.map((lesson, i) => {
            const isCompleted = progress[lesson.id]?.completed
            return (
              <motion.div key={lesson.id} variants={cardVariants} custom={i}>
                <GlassCard
                  hover
                  className="flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{lesson.category}</Badge>
                      <Badge
                        variant={
                          lesson.difficulty === 'beginner'
                            ? 'gain'
                            : lesson.difficulty === 'intermediate'
                            ? 'default'
                            : 'loss'
                        }
                      >
                        {lesson.difficulty}
                      </Badge>
                    </div>
                    {isCompleted && (
                      <CheckCircle size={16} className="text-gain" />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold mb-1">{lesson.title}</h3>
                  <p className="text-xs text-text-secondary flex-1">
                    {lesson.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock size={12} />
                      {lesson.duration}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-accent-blue">
                      {isCompleted ? 'Review' : 'Start'}
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </PageTransition>
  )
}
