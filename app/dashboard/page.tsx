import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Dashboard - P-Turtor',
  description: 'จัดการการเรียนรู้ของคุณ',
}

async function getEnrolledCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: {
            select: { name: true }
          },
          _count: {
            select: { chapters: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return enrollments
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const enrollments = await getEnrolledCourses(session.user.id)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับ, {session.user.name || session.user.email}</h1>
      <p className="text-muted-foreground mb-8">จัดการการเรียนรู้ของคุณ</p>

      <div className="grid gap-8">
        {/* My Courses */}
        <section>
          <h2 className="text-xl font-semibold mb-4">คอร์สของฉัน</h2>
          {enrollments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">คุณยังไม่มีคอร์ส</p>
              <Link href="/courses">
                <Button>เลือกดูคอร์ส</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img
                      src={enrollment.course.thumbnail || '/placeholder.jpg'}
                      alt={enrollment.course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{enrollment.course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      โดย {enrollment.course.instructor.name}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>ความคืบหน้า</span>
                        <span>{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/learn/${enrollment.course.slug}`}>
                      <Button className="w-full mt-4">
                        {enrollment.progress === 0 ? 'เริ่มเรียน' : 'เรียนต่อ'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-6">
            <div className="text-3xl font-bold">{enrollments.length}</div>
            <div className="text-muted-foreground">คอร์สที่ลงเรียน</div>
          </div>
          <div className="border rounded-lg p-6">
            <div className="text-3xl font-bold">
              {enrollments.filter(e => e.status === 'COMPLETED').length}
            </div>
            <div className="text-muted-foreground">คอร์สที่จบแล้ว</div>
          </div>
          <div className="border rounded-lg p-6">
            <div className="text-3xl font-bold">
              {Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / (enrollments.length || 1))}%
            </div>
            <div className="text-muted-foreground">ความคืบหน้าเฉลี่ย</div>
          </div>
        </section>
      </div>
    </div>
  )
}
