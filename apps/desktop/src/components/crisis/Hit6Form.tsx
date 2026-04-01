import { useState } from 'react'
import { HIT6_QUESTIONS, HIT6_OPTIONS, interpretHit6Score } from '@/types/crisis'

interface Hit6FormProps {
  onComplete: (score: number) => void
  onSkip: () => void
}

export function Hit6Form({ onComplete, onSkip }: Hit6FormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (currentQuestion < HIT6_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const totalScore = newAnswers.reduce((sum, v) => sum + v, 0)
      onComplete(totalScore)
    }
  }

  const totalScore = answers.reduce((sum, v) => sum + v, 0)
  const isComplete = answers.length === HIT6_QUESTIONS.length

  if (isComplete) {
    return (
      <div className="rounded-(--radius-lg) bg-(--color-bg-subtle) p-6 text-center">
        <p className="text-sm font-medium text-(--color-text-secondary)">Score HIT-6</p>
        <p className="mt-2 text-3xl font-bold text-(--color-brand)">{totalScore}</p>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          {interpretHit6Score(totalScore)}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-(--color-text-primary)">
          Questionnaire HIT-6
        </h3>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-(--color-text-muted) underline hover:text-(--color-text-secondary)"
        >
          Passer
        </button>
      </div>

      <div className="rounded-(--radius-lg) bg-(--color-bg-subtle) p-4">
        <p className="text-xs text-(--color-text-muted)">
          Question {currentQuestion + 1} / {HIT6_QUESTIONS.length}
        </p>
        <p className="mt-2 text-sm font-medium text-(--color-text-primary)">
          {HIT6_QUESTIONS[currentQuestion]}
        </p>

        <div className="mt-4 space-y-2">
          {HIT6_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleAnswer(option.value)}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-4 py-2.5 text-left text-sm text-(--color-text-primary) transition-colors hover:border-(--color-brand) hover:bg-(--color-bg-interactive)"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-(--radius-full) bg-(--color-bg-subtle)">
        <div
          className="h-full bg-(--color-brand) transition-all"
          style={{ width: `${((currentQuestion) / HIT6_QUESTIONS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
