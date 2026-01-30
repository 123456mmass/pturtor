import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth'
import { CheckoutButton } from '@/components/checkout/checkout-button'

interface CoursePageProps {
  params: { slug: string }
}

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      instructor: {
        select: { name: true, image: true }
      },
      chapters: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          duration: true,
          isFree: true,
        }
      },
      _count: {
        select: { enrollments: true, chapters: true }
      }
    }
  })
  return course
}

async function checkEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  })
  return enrollment
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = await getCourse(params.slug)
  if (!course) {
    return { title: 'ไม่พบคอร์ส - P-Turtor' }
  }
  return {
    title: `${course.title} - P-Turtor`,
    description: course.description || undefined,
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourse(params.slug)
  
  if (!course) {
    notFound()
  }

  const session = await getSession()
  const isEnrolled = session?.user ? await checkEnrollment(session.user.id!, course.id) : false

  const totalDuration = course.chapters.reduce((acc, ch) => acc + ch.duration, 0)

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="bg-secondary px-2 py-1 rounded">{course.category}</span>
              <span>{course.level === 'BEGINNER' ? 'ระดับเริ่มต้น' : course.level === 'INTERMEDIATE' ? 'ระดับปานกลาง' : 'ระดับขั้นสูง'}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Course Content */}
          <div>
            <h2 className="text-xl font-semibold mb-4">เนื้อหาคอร์ส</h2>
            <div className="border rounded-lg divide-y">
              {course.chapters.map((chapter, index) => (
                <div key={chapter.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-8">{index + 1}</span>
                    <div>
                      <p className="font-medium">{chapter.title}</p>
                      {chapter.isFree && (
                        <span className="text-xs text-green-600">ดูฟรี</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(chapter.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div>
            <h2 className="text-xl font-semibold mb-4">ผู้สอน</h2>
            <div className="flex items-center gap-4">
              <img
                src={course.instructor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.name}`}
                alt={course.instructor.name || 'ผู้สอน'}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <p className="font-semibold text-lg">{course.instructor.name}</p>
                <p className="text-muted-foreground">ผู้เชี่ยวชาญด้านการสอน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-lg p-6 space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={course.thumbnail || '/placeholder.jpg'}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {course.pricingType === 'SUBSCRIPTION' ? (
                  <span>{formatPrice(course.price || 499)}/เดือน</span>
                ) : (
                  <span>{formatPrice(course.price)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {course._count.enrollments} คนเรียนแล้ว
              </p>
            </div>

            {isEnrolled ? (
              <Link href={`/learn/${course.slug}`} className="block">
                <Button className="w-full" size="lg">
                  เรียนต่อ
                </Button>
              </Link>
            ) : (
              <CheckoutButton 
                courseId={course.id} 
                price={course.price}
              >
                ซื้อคอร์สนี้
              </CheckoutButton>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>จำนวนบทเรียน</span>
                <span>{course._count.chapters} บท</span>
              </div>
              <div className="flex justify-between">
                <span>ระยะเวลารวม</span>
                <span>{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span>ระดับ</span>
                <span>{course.level === 'BEGINNER' ? 'เริ่มต้น' : course.level === 'INTERMEDIATE' ? 'ปานกลาง' : 'ขั้นสูง'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
