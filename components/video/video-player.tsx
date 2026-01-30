'use client'

import { useEffect, useState, useRef } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface VideoPlayerProps {
  playbackId: string
  chapterId: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export function VideoPlayer({ playbackId, chapterId, onProgress, onComplete }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const playerRef = useRef<any>(null)
  const lastUpdate = useRef(Date.now())

  useEffect(() => {
    // Load saved progress
    const saved = localStorage.getItem(`video-progress-${chapterId}`)
    if (saved) {
      const { time } = JSON.parse(saved)
      if (playerRef.current) {
        playerRef.current.currentTime = time
      }
    }
  }, [chapterId])

  const handleTimeUpdate = async (e: any) => {
    const currentTime = e.target.currentTime
    const duration = e.target.duration
    
    // Save progress every 10 seconds
    const now = Date.now()
    if (now - lastUpdate.current > 10000) {
      localStorage.setItem(`video-progress-${chapterId}`, JSON.stringify({
        time: currentTime,
        duration,
        updatedAt: now,
      }))

      // Send to server
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId,
            watchTime: Math.floor(currentTime),
            completed: currentTime / duration > 0.9,
          }),
        })
      } catch (error) {
        console.error('Failed to save progress:', error)
      }

      lastUpdate.current = now
    }

    // Calculate progress percentage
    if (duration) {
      const progress = (currentTime / duration) * 100
      onProgress?.(progress)

      // Mark as complete if watched 90%+
      if (progress > 90) {
        onComplete?.()
      }
    }
  }

  const handleEnded = async () => {
    onComplete?.()
    
    // Mark as completed
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          watchTime: playerRef.current?.duration || 0,
          completed: true,
        }),
      })
    } catch (error) {
      console.error('Failed to mark complete:', error)
    }
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        onLoadedData={() => setIsReady(true)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        thumbnailTime={0}
        accentColor="#3b82f6"
        className="w-full h-full"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
    </div>
  )
}
