'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface Quiz {
  id: string
  title: string
  questions: {
    id: string
    content: string
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
    options?: { text: string; isCorrect: boolean }[]
    correctAnswer: string
  }[]
  timeLimit?: number
  passingScore: number
}

interface QuizPlayerProps {
  quiz: Quiz
  courseId: string
  chapterId?: string
}

export function QuizPlayer({ quiz, courseId, chapterId }: QuizPlayerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<any>(null)

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [question.id]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = quiz.questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      toast({
        title: 'ยังไม่ตอบครบ',
        description: `เหลือ ${unanswered.length} ข้อที่ยังไม่ได้ตอบ`,
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quiz')
      }

      setResult(data)
      setShowResults(true)
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResults && result) {
    return (
      <div className="max-w-2xl mx-auto p-6 border rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">ผลการทดสอบ</h2>
          <div className={`text-4xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.percentage}%
          </div>
          <p className="text-muted-foreground mt-2">
            {result.score} / {result.maxScore} คะแนน
          </p>
          <p className="mt-2">
            {result.passed ? (
              <span className="text-green-600 font-medium">✅ ผ่าน!</span>
            ) : (
              <span className="text-red-600 font-medium">❌ ไม่ผ่าน</span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">เฉลย</h3>
          {quiz.questions.map((q, idx) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correctAnswer
            return (
              <div key={q.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-medium mb-2">{idx + 1}. {q.content}</p>
                <p className="text-sm">
                  คำตอบของคุณ: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userAnswer}</span>
                </p>
                {!isCorrect && (
                  <p className="text-sm text-green-600">
                    คำตอบที่ถูกต้อง: {q.correctAnswer}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-4 mt-6">
          <Button onClick={() => router.refresh()} variant="outline" className="flex-1">
            ทำใหม่
          </Button>
          <Button onClick={() => router.push(`/courses/${courseId}`)} className="flex-1">
            กลับไปที่คอร์ส
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>คำถามที่ {currentQuestion + 1} จาก {quiz.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">{question.content}</h3>

        {question.type === 'MULTIPLE_CHOICE' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.text)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answers[question.id] === option.text
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                {option.text}
              </button>
            ))}
          </div>
        )}

        {question.type === 'TRUE_FALSE' && (
          <div className="space-y-2">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answers[question.id] === option
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {option === 'True' ? '✅ จริง' : '❌ เท็จ'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          ก่อนหน้า
        </Button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <Button onClick={handleNext}>
            ถัดไป
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
          </Button>
        )}
      </div>
    </div>
  )
}
