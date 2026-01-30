import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { CourseCard } from '@/components/course-card'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'คอร์สทั้งหมด - P-Turtor',
  description: 'ค้นพบคอร์สเรียนออนไลน์คุณภาพมากมาย',
}

async function getCourses() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      instructor: {
        select: { name: true, image: true }
      },
      _count: {
        select: { enrollments: true }
      }
    }
  })
  return courses
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">คอร์สทั้งหมด</h1>
          <p className="text-muted-foreground">
            พบ {courses.length} คอร์สที่เปิดให้เรียน
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาคอร์ส..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
