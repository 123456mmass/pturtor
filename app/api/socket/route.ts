import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = any & {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

import { NextResponse } from 'next/server'
import { Server } from 'socket.io'
import { prisma } from '@/lib/prisma'

const ioHandler = (req: Request) => {
  if ((global as any).io) {
    console.log('Socket.io already running')
    return NextResponse.json({ success: true, status: 'already-running' })
  }

  console.log('Setting up Socket.io server...')
  
  const io = new Server({
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join course chat room
    socket.on('join-room', (courseId: string) => {
      socket.join(`course-${courseId}`)
      console.log(`User ${socket.id} joined course-${courseId}`)
    })

    // Leave course chat room
    socket.on('leave-room', (courseId: string) => {
      socket.leave(`course-${courseId}`)
      console.log(`User ${socket.id} left course-${courseId}`)
    })

    // Send message
    socket.on('send-message', async (data: {
      courseId: string
      userId: string
      content: string
    }) => {
      try {
        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            roomId: data.courseId,
            userId: data.userId,
            content: data.content,
          },
          include: {
            user: {
              select: { name: true, image: true }
            }
          }
        })

        // Broadcast to room
        io.to(`course-${data.courseId}`).emit('new-message', {
          id: message.id,
          content: message.content,
          userId: message.userId,
          userName: message.user.name,
          userImage: message.user.image,
          createdAt: message.createdAt,
        })
      } catch (error) {
        console.error('Failed to save message:', error)
      }
    })

    // Typing indicator
    socket.on('typing', (data: { courseId: string; userName: string }) => {
      socket.to(`course-${data.courseId}`).emit('user-typing', {
        userName: data.userName,
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  ;(global as any).io = io

  return NextResponse.json({ success: true, status: 'initialized' })
}

export const GET = ioHandler
export const POST = ioHandler
