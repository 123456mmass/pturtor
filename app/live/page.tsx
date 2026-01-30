import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getLiveStreams() {
  const streams = await prisma.liveStream.findMany({
    where: {
      status: {
        in: ['LIVE', 'SCHEDULED'],
      },
    },
    orderBy: [
      { status: 'asc' },
      { scheduledFor: 'asc' },
    ],
    include: {
      instructor: {
        select: { name: true, image: true },
      },
    },
    take: 20,
  })
  return streams
}

export default async function LivePage() {
  const streams = await getLiveStreams()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📺 Live สด</h1>
        <p className="text-muted-foreground">
          เรียนรู้แบบเรียลไทม์กับผู้สอน
        </p>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">ยังไม่มี Live ในขณะนี้</p>
          <p className="text-sm text-muted-foreground">
            ติดตามเราเพื่อไม่พลาด Live ถัดไป
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Link key={stream.id} href={`/live/${stream.id}`}>
              <div className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                <div className="aspect-video bg-black relative">
                  {stream.thumbnail ? (
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      📺 Live
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={stream.status === 'LIVE' ? 'destructive' : 'secondary'}
                      className={stream.status === 'LIVE' ? 'animate-pulse' : ''}
                    >
                      {stream.status === 'LIVE' ? '🔴 LIVE' : '⏰ กำลังจะเริ่ม'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {stream.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <img
                      src={stream.instructor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.instructor.name}`}
                      alt={stream.instructor.name || 'ผู้สอน'}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{stream.instructor.name}</span>
                  </div>
                  {stream.scheduledFor && stream.status === 'SCHEDULED' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      เริ่ม {new Date(stream.scheduledFor).toLocaleString('th-TH')}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
