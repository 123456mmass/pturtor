import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

interface SuccessPageProps {
  searchParams: { session_id?: string }
}

async function getSessionDetails(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch {
    return null
  }
}

function SuccessContent({ sessionId }: { sessionId: string }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessVerification sessionId={sessionId} />
    </Suspense>
  )
}

async function SuccessVerification({ sessionId }: { sessionId: string }) {
  const session = await getSessionDetails(sessionId)

  if (!session || session.payment_status !== 'paid') {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
          <Icons.spinner className="h-8 w-8 text-yellow-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">กำลังตรวจสอบการชำระเงิน</h2>
        <p className="text-muted-foreground mb-6">
          ระบบกำลังตรวจสอบการชำระเงินของคุณ กรุณารอสักครู่...
        </p>
      </div>
    )
  }

  const courseId = session.metadata?.courseId
  const course = courseId ? await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, slug: true }
  }) : null

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">ชำระเงินสำเร็จ!</h2>
      <p className="text-muted-foreground mb-2">
        ขอบคุณสำหรับการสั่งซื้อ
      </p>
      {course && (
        <p className="text-lg font-medium mb-6">
          {course.title}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/dashboard">
          <Button>ไปที่ Dashboard</Button>
        </Link>
        {course && (
          <Link href={`/learn/${course.slug}`}>
            <Button variant="outline">เริ่มเรียนเลย</Button>
          </Link>
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold mb-2">กำลังโหลด...</h2>
    </div>
  )
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect('/courses')
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <SuccessContent sessionId={sessionId} />
    </div>
  )
}
