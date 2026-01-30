import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'สมัครสมาชิก - P-Turtor',
  description: 'สร้างบัญชีใหม่เพื่อเริ่มเรียนรู้',
}

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            สร้างบัญชีใหม่
          </h1>
          <p className="text-sm text-muted-foreground">
            กรอกข้อมูลด้านล่างเพื่อเริ่มต้นการเรียนรู้
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
