'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  content: string
  userId: string
  userName: string
  userImage?: string
  createdAt: string
}

interface ChatRoomProps {
  courseId: string
  roomName: string
}

export function ChatRoom({ courseId, roomName }: ChatRoomProps) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Fetch existing messages
    fetch(`/api/chat/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages)
        }
      })

    // Initialize socket
    const newSocket = io({
      path: '/api/socket/io',
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat')
      setIsConnected(true)
      newSocket.emit('join-room', courseId)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat')
      setIsConnected(false)
    })

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('user-typing', ({ userName }: { userName: string }) => {
      setTypingUsers(prev => [...new Set([...prev, userName])])
      
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== userName))
      }, 3000)
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('leave-room', courseId)
      newSocket.close()
    }
  }, [courseId])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || !socket || !session?.user) return

    socket.emit('send-message', {
      courseId,
      userId: session.user.id,
      content: input.trim(),
    })

    setInput('')
  }

  const handleTyping = (value: string) => {
    setInput(value)

    if (socket && session?.user) {
      socket.emit('typing', {
        courseId,
        userName: session.user.name || session.user.email,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">💬 {roomName}</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              ยังไม่มีข้อความ<br />
              เริ่มต้นบทสนทนาเลย!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.userId === session?.user?.id ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {msg.userImage ? (
                    <img src={msg.userImage} alt={msg.userName} className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-sm font-medium">
                      {msg.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`max-w-[70%] ${msg.userId === session?.user?.id ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{msg.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`inline-block px-3 py-2 rounded-lg text-sm ${
                      msg.userId === session?.user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            {typingUsers.join(', ')} กำลังพิมพ์...
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        {session?.user ? (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              ส่ง
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            กรุณาเข้าสู่ระบบเพื่อแชท
          </div>
        )}
      </div>
    </div>
  )
}
