import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CancelPageProps {
  searchParams: { course?: string }
}

export default function CheckoutCancelPage({ searchParams }: CancelPageProps) {
  return (
    <div className="container max-w-md mx-auto py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
        <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">การชำระเงินถูกยกเลิก</h2>
      <p className="text-muted-foreground mb-6">
        คุณได้ยกเลิกการชำระเงิน หากต้องการซื้อคอร์สในภายหลัง สามารถกลับมาซื้อได้ตลอดเวลา
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {searchParams.course ? (
          <Link href={`/courses/${searchParams.course}`}>
            <Button>กลับไปที่คอร์ส</Button>
          </Link>
        ) : (
          <Link href="/courses">
            <Button>ดูคอร์สทั้งหมด</Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button variant="outline">ไปที่ Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
