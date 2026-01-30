import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId, answers } = await req.json()

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Calculate score
    let score = 0
    let maxScore = 0

    for (const question of quiz.questions) {
      const userAnswer = answers.find((a: any) => a.questionId === question.id)
      maxScore += question.points
      
      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        score += question.points
      }
    }

    const percentage = Math.round((score / maxScore) * 100)
    const passed = percentage >= quiz.passingScore

    // Save attempt
    await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId: quiz.id,
        answers,
        score,
        maxScore,
        percentage,
        passed,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({
      score,
      maxScore,
      percentage,
      passed,
      passingScore: quiz.passingScore,
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
