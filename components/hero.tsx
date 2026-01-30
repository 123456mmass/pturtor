import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative">
      <div className="container flex flex-col items-center justify-center gap-4 py-12 md:py-16 lg:py-24 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          เรียนรู้ทักษะใหม่<br />
          <span className="text-primary">พัฒนาตนเองสู่อนาคต</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
          คอร์สออนไลน์คุณภาพจากผู้เชี่ยวชาญ เรียนได้ทุกที่ทุกเวลา
          พร้อมใบประกาศนียบัตรรับรอง
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/courses">
            <Button size="lg" className="min-w-[200px]">
              ดูคอร์สทั้งหมด
            </Button>
          </Link>
          <Link href="/subscription">
            <Button size="lg" variant="outline" className="min-w-[200px]">
              สมัครสมาชิก
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
