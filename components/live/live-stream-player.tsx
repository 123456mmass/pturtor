'use client'

import MuxPlayer from '@mux/mux-player-react'
import { Badge } from '@/components/ui/badge'

interface LiveStreamPlayerProps {
  playbackId: string
  title: string
  status: 'LIVE' | 'SCHEDULED' | 'ENDED'
}

export function LiveStreamPlayer({ playbackId, title, status }: LiveStreamPlayerProps) {
  return (
    <div className="relative">
      {/* Live badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge 
          variant={status === 'LIVE' ? 'destructive' : 'secondary'}
          className="animate-pulse"
        >
          {status === 'LIVE' ? '🔴 LIVE' : status === 'SCHEDULED' ? '⏰ กำลังจะเริ่ม' : '⏹️ จบแล้ว'}
        </Badge>
      </div>

      {/* Video player */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <MuxPlayer
          playbackId={playbackId}
          streamType="live"
          accentColor="#ef4444"
          thumbnailTime={0}
          className="w-full h-full"
        />
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    </div>
  )
}
