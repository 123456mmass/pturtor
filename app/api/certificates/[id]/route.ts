import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        course: {
          select: { title: true },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Check if user owns this certificate or is admin
    if (certificate.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate PDF if not exists
    const pdfBuffer = await generateCertificatePDF(certificate)

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}

async function generateCertificatePDF(certificate: any) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Sarabun', sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate {
          width: 800px;
          background: white;
          padding: 60px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          border: 10px solid #667eea;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 48px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        
        .subtitle {
          font-size: 20px;
          color: #666;
          margin-bottom: 40px;
        }
        
        .recipient {
          font-size: 36px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
          border-bottom: 2px solid #667eea;
          display: inline-block;
          padding-bottom: 10px;
        }
        
        .course {
          font-size: 24px;
          color: #667eea;
          margin-bottom: 40px;
          font-weight: 600;
        }
        
        .date {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .cert-number {
          font-size: 14px;
          color: #999;
          margin-top: 40px;
        }
        
        .signature {
          margin-top: 60px;
          display: flex;
          justify-content: space-around;
        }
        
        .signature-line {
          width: 200px;
          border-top: 1px solid #333;
          padding-top: 10px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="logo">P-Turtor</div>
        <div class="title">Certificate of Completion</div>
        <div class="subtitle">ใบประกาศนียบัตร</div>
        <div>ขอมอบให้แก่</div>
        <div class="recipient">${certificate.user.name || certificate.user.email}</div>
        <div>สำหรับการสำเร็จหลักสูตร</div>
        <div class="course">${certificate.course.title}</div>
        <div class="date">วันที่ ${new Date(certificate.issuedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="cert-number">เลขที่ใบประกาศนียบัตร: ${certificate.certificateNumber}</div>
        <div class="signature">
          <div class="signature-line">ผู้สอน<br>Instructor</div>
          <div class="signature-line">ผู้จัดการ<br>Director</div>
        </div>
      </div>
    </body>
    </html>
  `

  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
  })

  await browser.close()
  return pdf
}
