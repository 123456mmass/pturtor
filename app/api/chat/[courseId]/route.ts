import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: { chatRoom: true },
    })

    if (!course || !course.chatRoom) {
      return NextResponse.json({ messages: [] })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { roomId: course.chatRoom.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    })

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        userId: msg.userId,
        userName: msg.user.name,
        userImage: msg.user.image,
        createdAt: msg.createdAt,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
