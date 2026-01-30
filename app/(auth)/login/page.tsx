import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ - P-Turtor',
  description: 'เข้าสู่ระบบเพื่อเริ่มเรียนรู้',
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            ยินดีต้อนรับกลับมา
          </h1>
          <p className="text-sm text-muted-foreground">
            เข้าสู่ระบบเพื่อเริ่มเรียนรู้ต่อ
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}
