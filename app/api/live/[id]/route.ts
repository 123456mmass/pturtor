import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await req.json()

    const liveStream = await prisma.liveStream.findUnique({
      where: { id: params.id },
    })

    if (!liveStream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Only instructor can update status
    if (liveStream.instructorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.liveStream.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update stream:', error)
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    )
  }
}
