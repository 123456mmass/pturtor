import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { VideoPlayer } from '@/components/video/video-player'
import { QuizPlayer } from '@/components/quiz/quiz-player'
import { Button } from '@/components/ui/button'

interface LearnPageProps {
  params: { slug: string }
}

async function getEnrollment(userId: string, courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  })

  if (!course) return null

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
    include: {
      course: {
        include: {
          chapters: {
            orderBy: { position: 'asc' },
            include: {
              quiz: {
                include: {
                  questions: true,
                },
              },
            },
          },
        },
      },
      progress: true,
    },
  })

  return enrollment
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  return {
    title: `เรียน ${params.slug} - P-Turtor`,
  }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const session = await requireAuth()
  const enrollment = await getEnrollment(session.user.id, params.slug)

  if (!enrollment) {
    notFound()
  }

  const { course } = enrollment

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{Math.round(enrollment.progress)}% เรียนแล้ว</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player / Quiz Area */}
        <div className="lg:col-span-2 space-y-6">
          {course.chapters.map((chapter) => {
            const progress = enrollment.progress.find(p => p.chapterId === chapter.id)
            
            return (
              <div key={chapter.id} id={`chapter-${chapter.id}`} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{chapter.title}</h3>
                  {progress?.completed && (
                    <span className="text-green-600 text-sm">✓ เรียนจบแล้ว</span>
                  )}
                </div>

                {chapter.videoUrl ? (
                  <VideoPlayer
                    playbackId={chapter.videoUrl}
                    chapterId={chapter.id}
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">ไม่มีวิดีโอ</span>
                  </div>
                )}

                {chapter.pdfUrl && (
                  <div className="mt-4">
                    <Link href={chapter.pdfUrl} target="_blank">
                      <Button variant="outline">📄 ดาวน์โหลดเอกสาร</Button>
                    </Link>
                  </div>
                )}

                {chapter.quiz && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">แบบทดสอบ: {chapter.quiz.title}</h4>
                    <QuizPlayer
                      quiz={chapter.quiz}
                      courseId={course.id}
                      chapterId={chapter.id}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sidebar - Chapter List */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-lg p-4">
            <h3 className="font-semibold mb-4">เนื้อหาคอร์ส</h3>
            <div className="space-y-2">
              {course.chapters.map((chapter, index) => {
                const progress = enrollment.progress.find(p => p.chapterId === chapter.id)
                return (
                  <a
                    key={chapter.id}
                    href={`#chapter-${chapter.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      progress?.completed ? 'bg-green-50' : 'hover:bg-secondary'
                    }`}
                  >
                    <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                    <span className="flex-1 text-sm">{chapter.title}</span>
                    {progress?.completed && (
                      <span className="text-green-600">✓</span>
                    )}
                  </a>
                )
              })}
            </div>

            {/* Certificate Download */}
            {enrollment.status === 'COMPLETED' && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">🎉 ยินดีด้วย!</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  คุณได้จบคอร์สนี้แล้ว
                </p>
                <Link href={`/certificates/${enrollment.courseId}`}>
                  <Button className="w-full">
                    ดาวน์โหลดใบประกาศนียบัตร
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
