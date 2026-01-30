import { Metadata } from 'next'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'P-Turtor - แพลตฟอร์มเรียนออนไลน์ครบวงจร',
  description: 'เรียนรู้จากผู้เชี่ยวชาญ พัฒนาทักษะสู่อนาคตที่ดีกว่า คอร์สออนไลน์คุณภาพสำหรับคนไทย',
  keywords: ['เรียนออนไลน์', 'คอร์สออนไลน์', 'e-learning', 'thailand', 'online course'],
  authors: [{ name: 'P-Turtor' }],
  openGraph: {
    title: 'P-Turtor - แพลตฟอร์มเรียนออนไลน์',
    description: 'เรียนรู้จากผู้เชี่ยวชาญ พัฒนาทักษะสู่อนาคตที่ดีกว่า',
    type: 'website',
    locale: 'th_TH',
  },
}

export default function SeoWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
