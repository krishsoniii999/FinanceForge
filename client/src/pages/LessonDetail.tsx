import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { PageTransition } from '../components/layout/PageTransition'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { lessons } from '../data/lessons'
import { useLessonStore } from '../stores/useLessonStore'
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  XCircle,
  PartyPopper,
} from 'lucide-react'

export function LessonDetail() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const lesson = lessons.find((l) => l.id === lessonId)
  const { progress, markCompleted } = useLessonStore()

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>(
    {}
  )

  if (!lesson) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-text-secondary">Lesson not found</p>
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => navigate('/lessons')}
            >
              Back to Lessons
            </Button>
          </div>
        </div>
      </PageTransition>
    )
  }

  const isCompleted = progress[lesson.id]?.completed
  const quizSections = lesson.sections
    .map((s, i) => ({ ...s, index: i }))
    .filter((s) => s.type === 'quiz')
  const allQuizzesCorrect = quizSections.every(
    (q) => quizSubmitted[q.index] && quizAnswers[q.index] === q.correctAnswer
  )

  const handleComplete = () => {
    markCompleted(lesson.id)
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back + header */}
        <div>
          <button
            onClick={() => navigate('/lessons')}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Back to Lessons
          </button>

          <div className="flex items-center gap-2 mb-2">
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
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lesson.description}
          </p>
        </div>

        {/* Sections */}
        {lesson.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {section.type === 'text' && (
              <GlassCard>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {section.content.split('**').map((part, i) =>
                    i % 2 === 1 ? (
                      <span key={i} className="font-semibold text-text-primary">
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </GlassCard>
            )}

            {section.type === 'tip' && (
              <GlassCard className="border-accent-blue/20 bg-accent-blue/[0.03]">
                <div className="flex gap-3">
                  <Lightbulb
                    size={16}
                    className="text-accent-blue flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-text-secondary leading-relaxed">
                    {section.content}
                  </div>
                </div>
              </GlassCard>
            )}

            {section.type === 'quiz' && section.options && (
              <GlassCard>
                <h3 className="text-sm font-semibold mb-3">{section.content}</h3>
                <div className="space-y-2">
                  {section.options.map((option, optIdx) => {
                    const isSelected = quizAnswers[index] === optIdx
                    const isSubmitted = quizSubmitted[index]
                    const isCorrect = optIdx === section.correctAnswer

                    return (
                      <button
                        key={optIdx}
                        onClick={() => {
                          if (!isSubmitted) {
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [index]: optIdx,
                            }))
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                          isSubmitted && isCorrect
                            ? 'bg-gain/10 border-gain/30 text-gain'
                            : isSubmitted && isSelected && !isCorrect
                            ? 'bg-loss/10 border-loss/30 text-loss'
                            : isSelected
                            ? 'bg-accent-blue/10 border-accent-blue/30 text-text-primary'
                            : 'bg-white/[0.03] border-white/[0.06] text-text-secondary hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isSubmitted && isCorrect && (
                            <CheckCircle size={14} />
                          )}
                          {isSubmitted && isSelected && !isCorrect && (
                            <XCircle size={14} />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {quizAnswers[index] !== undefined && !quizSubmitted[index] && (
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      setQuizSubmitted((prev) => ({ ...prev, [index]: true }))
                    }
                  >
                    Check Answer
                  </Button>
                )}
              </GlassCard>
            )}
          </motion.div>
        ))}

        {/* Completion */}
        <GlassCard className="text-center">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle size={32} className="text-gain" />
              <h3 className="text-sm font-semibold">Lesson Completed!</h3>
              <p className="text-xs text-text-secondary">
                You've already finished this lesson.
              </p>
            </div>
          ) : allQuizzesCorrect && quizSections.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <PartyPopper size={32} className="text-accent-blue" />
              <h3 className="text-sm font-semibold">Great job!</h3>
              <p className="text-xs text-text-secondary">
                You answered all questions correctly.
              </p>
              <Button onClick={handleComplete}>Mark as Complete</Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-text-secondary mb-3">
                {quizSections.length > 0
                  ? 'Answer all quiz questions correctly to complete this lesson.'
                  : 'Finished reading?'}
              </p>
              {quizSections.length === 0 && (
                <Button onClick={handleComplete}>Mark as Complete</Button>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  )
}
