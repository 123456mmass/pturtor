import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export async function Navbar() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">P-Turtor</span>
        </Link>
        
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/courses" className="transition-colors hover:text-primary">
            คอร์สทั้งหมด
          </Link>
          <Link href="/live" className="transition-colors hover:text-primary text-red-500">
            🔴 Live
          </Link>
          <Link href="/subscription" className="transition-colors hover:text-primary">
            สมัครสมาชิก
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Icons.user className="mr-2 h-4 w-4" />
                  {session.user?.name || session.user?.email || 'User'}
                </Button>
              </Link>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">ออกจากระบบ</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">สมัครสมาชิก</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
