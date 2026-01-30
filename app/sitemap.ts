import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const routes = [
    '',
    '/courses',
    '/login',
    '/register',
    '/live',
    '/subscription',
  ].map((route) => ({
    url: `${process.env.NEXTAUTH_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic course pages
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const courseRoutes = courses.map((course) => ({
    url: `${process.env.NEXTAUTH_URL}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...courseRoutes]
}
