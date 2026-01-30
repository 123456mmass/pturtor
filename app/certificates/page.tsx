import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'ใบประกาศนียบัตรของฉัน - P-Turtor',
}

async function getCertificates(userId: string) {
  const certificates = await prisma.certificate.findMany({
    where: { userId },
    include: {
      course: {
        select: { title: true, slug: true },
      },
    },
    orderBy: { issuedAt: 'desc' },
  })
  return certificates
}

export default async function CertificatesPage() {
  const session = await requireAuth()
  const certificates = await getCertificates(session.user.id)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">ใบประกาศนียบัตรของฉัน</h1>
      <p className="text-muted-foreground mb-8">
        คุณมี {certificates.length} ใบประกาศนียบัตร
      </p>

      {certificates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">คุณยังไม่มีใบประกาศนียบัตร</p>
          <p className="text-sm text-muted-foreground mb-4">
            จบคอร์สเรียนเพื่อรับใบประกาศนียบัตร
          </p>
          <Link href="/courses">
            <Button>เลือกดูคอร์ส</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="border rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="font-bold text-lg">Certificate of Completion</h3>
                  <p className="text-white/80 text-sm">P-Turtor</p>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-1">{cert.course.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  ออกเมื่อ {new Date(cert.issuedAt).toLocaleDateString('th-TH')}
                </p>
                <Link href={`/api/certificates/${cert.id}`}>
                  <Button className="w-full">
                    <Icons.user className="mr-2 h-4 w-4" />
                    ดาวน์โหลด PDF
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
