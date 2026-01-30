import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/course-card'
import { Hero } from '@/components/hero'
import { prisma } from '@/lib/prisma'

async function getFeaturedCourses() {
  const courses = await prisma.course.findMany({
    where: { published: true, featured: true },
    take: 6,
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

export default async function HomePage() {
  const courses = await getFeaturedCourses()

  return (
    <>
      <Hero />
      
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">คอร์สยอดนิยม</h2>
            <p className="text-muted-foreground mt-2">
              เรียนรู้จากคอร์สคุณภาพที่ได้รับความนิยมสูงสุด
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/courses">ดูทั้งหมด</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-muted-foreground">นักเรียนที่เรียนจบ</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">คอร์สคุณภาพ</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">ผู้สอนมืออาชีพ</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
