import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    
    // Verify webhook (in production, add signature verification)
    const event = payload

    if (event.object === 'event') {
      const charge = event.data

      switch (event.key) {
        case 'charge.complete':
          if (charge.status === 'successful') {
            // Update purchase status
            await prisma.purchase.updateMany({
              where: {
                providerPaymentId: charge.id,
              },
              data: {
                status: 'COMPLETED',
                paidAt: new Date(),
              },
            })

            // Create enrollment
            if (charge.metadata?.userId && charge.metadata?.courseId) {
              await prisma.enrollment.upsert({
                where: {
                  userId_courseId: {
                    userId: charge.metadata.userId,
                    courseId: charge.metadata.courseId,
                  },
                },
                update: {
                  status: 'ACTIVE',
                },
                create: {
                  userId: charge.metadata.userId,
                  courseId: charge.metadata.courseId,
                  status: 'ACTIVE',
                },
              })
            }
          }
          break

        case 'charge.failed':
          await prisma.purchase.updateMany({
            where: {
              providerPaymentId: charge.id,
            },
            data: {
              status: 'FAILED',
            },
          })
          break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Omise webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
