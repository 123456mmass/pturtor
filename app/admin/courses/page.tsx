import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'จัดการคอร์ส - P-Turtor Admin',
}

async function getCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      instructor: {
        select: { name: true, email: true },
      },
      _count: {
        select: {
          enrollments: true,
          chapters: true,
        },
      },
    },
  })
  return courses
}

export default async function AdminCoursesPage() {
  await requireRole('ADMIN')
  const courses = await getCourses()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการคอร์ส</h1>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline">กลับไปแดชบอร์ด</Button>
          </Link>
          <Link href="/admin/courses/new">
            <Button>+ สร้างคอร์สใหม่</Button>
          </Link>
        </div>
      </div>

      {/* Courses Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">คอร์ส</th>
              <th className="text-left p-4">ราคา</th>
              <th className="text-left p-4">สถานะ</th>
              <th className="text-left p-4">ผู้สอน</th>
              <th className="text-left p-4">นักเรียน</th>
              <th className="text-left p-4">บทเรียน</th>
              <th className="text-left p-4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnail || '/placeholder.jpg'}
                      alt={course.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.category}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {course.pricingType === 'SUBSCRIPTION' ? (
                    <span>{formatPrice(course.price || 499)}/เดือน</span>
                  ) : (
                    <span>{formatPrice(course.price)}</span>
                  )}
                </td>
                <td className="p-4">
                  <Badge variant={course.published ? 'default' : 'secondary'}>
                    {course.published ? 'เผยแพร่' : 'ร่าง'}
                  </Badge>
                  {course.featured && (
                    <Badge variant="outline" className="ml-1">แนะนำ</Badge>
                  )}
                </td>
                <td className="p-4">{course.instructor.name}</td>
                <td className="p-4">{course._count.enrollments}</td>
                <td className="p-4">{course._count.chapters}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button size="sm" variant="outline">แก้ไข</Button>
                    </Link>
                    <Link href={`/courses/${course.slug}`} target="_blank">
                      <Button size="sm" variant="ghost">ดู</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
