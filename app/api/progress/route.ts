import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chapterId, watchTime, completed, lastPosition } = await req.json()

    // Get chapter to find course
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Update or create progress
    await prisma.progress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      update: {
        watchTime,
        completed,
        lastPosition: lastPosition || watchTime,
      },
      create: {
        userId: session.user.id,
        chapterId,
        watchTime,
        completed,
        lastPosition: lastPosition || watchTime,
      },
    })

    // Update enrollment progress
    const totalChapters = await prisma.chapter.count({
      where: { courseId: chapter.courseId },
    })

    const completedChapters = await prisma.progress.count({
      where: {
        userId: session.user.id,
        chapter: { courseId: chapter.courseId },
        completed: true,
      },
    })

    const progressPercentage = Math.round((completedChapters / totalChapters) * 100)

    await prisma.enrollment.updateMany({
      where: {
        userId: session.user.id,
        courseId: chapter.courseId,
      },
      data: {
        progress: progressPercentage,
        status: progressPercentage === 100 ? 'COMPLETED' : 'ACTIVE',
        completedAt: progressPercentage === 100 ? new Date() : undefined,
      },
    })

    // If course completed, generate certificate
    if (progressPercentage === 100) {
      await generateCertificate(session.user.id, chapter.courseId)
    }

    return NextResponse.json({ success: true, progress: progressPercentage })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

async function generateCertificate(userId: string, courseId: string) {
  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  })

  if (existing) return

  // Generate certificate number
  const certificateNumber = `PT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  // Create certificate record
  await prisma.certificate.create({
    data: {
      userId,
      courseId,
      certificateNumber,
      pdfUrl: `/certificates/${certificateNumber}.pdf`, // Placeholder
    },
  })
}
