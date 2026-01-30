import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LiveStreamPlayer } from '@/components/live/live-stream-player'
import { ChatRoom } from '@/components/chat/chat-room'

interface LiveStreamPageProps {
  params: { id: string }
}

async function getLiveStream(id: string) {
  const stream = await prisma.liveStream.findUnique({
    where: { id },
    include: {
      instructor: {
        select: { name: true, image: true },
      },
      chatRoom: true,
    },
  })
  return stream
}

export async function generateMetadata({ params }: LiveStreamPageProps): Promise<Metadata> {
  const stream = await getLiveStream(params.id)
  if (!stream) {
    return { title: 'ไม่พบ Live - P-Turtor' }
  }
  return {
    title: `${stream.title} - P-Turtor Live`,
  }
}

export default async function LiveStreamPage({ params }: LiveStreamPageProps) {
  const stream = await getLiveStream(params.id)

  if (!stream) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <LiveStreamPlayer
            playbackId={stream.muxPlaybackId || ''}
            title={stream.title}
            status={stream.status}
          />
          
          <div className="mt-6">
            <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
            <p className="text-muted-foreground mb-4">{stream.description}</p>
            
            <div className="flex items-center gap-3">
              <img
                src={stream.instructor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.instructor.name}`}
                alt={stream.instructor.name || 'ผู้สอน'}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">{stream.instructor.name}</p>
                <p className="text-sm text-muted-foreground">ผู้สอน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          {stream.chatRoom ? (
            <ChatRoom
              courseId={stream.chatRoom.id}
              roomName="แชทสด"
            />
          ) : (
            <div className="border rounded-lg p-4 h-[500px] flex items-center justify-center">
              <p className="text-muted-foreground">ไม่มีห้องแชท</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
