import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const metadata: Metadata = {
  title: 'จัดการผู้ใช้ - P-Turtor Admin',
}

async function getUsers(search?: string) {
  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ],
  } : {}

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          purchases: true,
        },
      },
    },
  })
  return users
}

interface AdminUsersPageProps {
  searchParams: { search?: string }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireRole('ADMIN')
  const users = await getUsers(searchParams.search)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการผู้ใช้</h1>
        <Link href="/admin">
          <Button variant="outline">กลับไปแดชบอร์ด</Button>
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6 flex gap-2">
        <Input
          name="search"
          placeholder="ค้นหาผู้ใช้..."
          defaultValue={searchParams.search}
          className="max-w-sm"
        />
        <Button type="submit">ค้นหา</Button>
      </form>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">ผู้ใช้</th>
              <th className="text-left p-4">บทบาท</th>
              <th className="text-left p-4">การลงทะเบียน</th>
              <th className="text-left p-4">การซื้อ</th>
              <th className="text-left p-4">สมัครเมื่อ</th>
              <th className="text-left p-4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: typeof users[number]) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name || 'ไม่มีชื่อ'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">{user._count.enrollments}</td>
                <td className="p-4">{user._count.purchases}</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td className="p-4">
                  <Link href={`/admin/users/${user.id}`}>
                    <Button size="sm" variant="outline">แก้ไข</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
