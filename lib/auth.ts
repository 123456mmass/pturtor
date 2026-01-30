import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireRole(role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT') {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  if ((session.user as any).role !== role && (session.user as any).role !== 'ADMIN') {
    redirect('/')
  }
  return session
}
