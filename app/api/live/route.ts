import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, scheduledFor, thumbnail } = await req.json()

    // Create live stream via Mux
    const Mux = require('@mux/mux-node')
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    })

    const stream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
    })

    // Save to database
    const liveStream = await prisma.liveStream.create({
      data: {
        title,
        description,
        thumbnail,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        muxStreamId: stream.id,
        muxPlaybackId: stream.playback_ids?.[0]?.id,
        status: 'SCHEDULED',
        instructorId: session.user.id,
      },
    })

    // Create chat room
    await prisma.chatRoom.create({
      data: {
        liveStreamId: liveStream.id,
        name: `Live: ${title}`,
      },
    })

    return NextResponse.json({
      id: liveStream.id,
      streamKey: stream.stream_key,
      playbackId: stream.playback_ids?.[0]?.id,
    })
  } catch (error) {
    console.error('Failed to create live stream:', error)
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const streams = await prisma.liveStream.findMany({
      where: {
        status: {
          in: ['LIVE', 'SCHEDULED'],
        },
      },
      orderBy: { scheduledFor: 'asc' },
      include: {
        instructor: {
          select: { name: true, image: true },
        },
      },
      take: 10,
    })

    return NextResponse.json({ streams })
  } catch (error) {
    console.error('Failed to fetch live streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    )
  }
}
