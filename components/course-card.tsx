import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Course {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  price: number
  pricingType: string
  level: string
  category: string | null
  instructor: {
    name: string | null
  }
  _count: {
    enrollments: number
  }
}

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="group relative overflow-hidden rounded-lg border bg-background p-2 hover:border-primary transition-colors">
        <div className="aspect-video overflow-hidden rounded-md">
          <img
            src={course.thumbnail || '/placeholder.jpg'}
            alt={course.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="bg-secondary px-2 py-1 rounded">{course.category}</span>
            <span>{course.level === 'BEGINNER' ? 'เริ่มต้น' : course.level === 'INTERMEDIATE' ? 'ปานกลาง' : 'ขั้นสูง'}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            โดย {course.instructor.name || 'ผู้สอน'}
          </p>
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg">
              {course.pricingType === 'SUBSCRIPTION' ? (
                <span>เริ่มต้น {formatPrice(course.price || 499)}/เดือน</span>
              ) : (
                <span>{formatPrice(course.price)}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {course._count.enrollments} คนเรียน
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
