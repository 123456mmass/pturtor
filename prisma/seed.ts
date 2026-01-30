import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pturtor.com' },
    update: {},
    create: {
      email: 'admin@pturtor.com',
      name: 'Admin',
      role: 'ADMIN',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@pturtor.com' },
    update: {},
    create: {
      email: 'instructor@pturtor.com',
      name: 'สอนเก่ง ใจดี',
      role: 'INSTRUCTOR',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor',
    },
  })
  console.log('✅ Instructor created:', instructor.email)

  // Create sample courses
  const courses = [
    {
      title: 'Python สำหรับผู้เริ่มต้น',
      slug: 'python-beginner',
      description: 'เรียนรู้ Python ตั้งแต่พื้นฐานจนถึงการสร้างโปรแกรมจริง เหมาะสำหรับผู้ไม่มีพื้นฐานการเขียนโปรแกรม',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      price: 999,
      pricingType: 'ONETIME',
      level: 'BEGINNER',
      category: 'Programming',
      tags: ['python', 'programming', 'beginner'],
      published: true,
      featured: true,
    },
    {
      title: 'Web Development Bootcamp',
      slug: 'web-development-bootcamp',
      description: 'เรียนรู้การสร้างเว็บไซต์แบบ Full-Stack ด้วย HTML, CSS, JavaScript, React และ Node.js',
      thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800',
      price: 2999,
      pricingType: 'ONETIME',
      level: 'BEGINNER',
      category: 'Web Development',
      tags: ['html', 'css', 'javascript', 'react', 'nodejs'],
      published: true,
      featured: true,
    },
    {
      title: 'Data Science 101',
      slug: 'data-science-101',
      description: 'วิเคราะห์ข้อมูลด้วย Python, Pandas, NumPy และสร้าง Machine Learning Models',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      price: 1999,
      pricingType: 'ONETIME',
      level: 'INTERMEDIATE',
      category: 'Data Science',
      tags: ['python', 'data', 'machine-learning', 'pandas'],
      published: true,
      featured: true,
    },
    {
      title: 'All Access Pass',
      slug: 'all-access-pass',
      description: 'เข้าถึงคอร์สทั้งหมดบนแพลตฟอร์ม เรียนได้ไม่จำกัดตลอดการสมัครสมาชิก',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      price: 0,
      pricingType: 'SUBSCRIPTION',
      subscriptionPrice: 499,
      level: 'BEGINNER',
      category: 'Subscription',
      tags: ['subscription', 'all-access'],
      published: true,
      featured: true,
    },
  ]

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        ...courseData,
        instructorId: instructor.id,
      },
    })
    console.log('✅ Course created:', course.title)

    // Create sample chapters for each course
    if (courseData.slug !== 'all-access-pass') {
      const chapters = [
        {
          title: 'บทนำและการติดตั้ง',
          position: 1,
          duration: 900,
          isFree: true,
        },
        {
          title: 'พื้นฐานที่จำเป็น',
          position: 2,
          duration: 1800,
          isFree: true,
        },
        {
          title: 'เริ่มต้นเขียนโค้ด',
          position: 3,
          duration: 2400,
          isFree: false,
        },
        {
          title: 'แบบฝึกหัดจริง',
          position: 4,
          duration: 3600,
          isFree: false,
        },
      ]

      for (const chapter of chapters) {
        await prisma.chapter.upsert({
          where: { 
            courseId_position: {
              courseId: course.id,
              position: chapter.position
            }
          },
          update: {},
          create: {
            ...chapter,
            courseId: course.id,
          },
        })
      }
      console.log(`✅ Chapters created for: ${course.title}`)
    }
  }

  console.log('\n✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
