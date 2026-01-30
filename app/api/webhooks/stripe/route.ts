import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const payload = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const { userId, courseId } = session.metadata

        // Update purchase status
        await prisma.purchase.updateMany({
          where: {
            providerPaymentId: session.id,
          },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        })

        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
            status: 'ACTIVE',
          },
        })

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any
        // Handle subscription renewal
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: {
              providerSubscriptionId: invoice.subscription,
            },
            data: {
              currentPeriodEnd: new Date(invoice.period_end * 1000),
              status: 'ACTIVE',
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await prisma.subscription.updateMany({
          where: {
            providerSubscriptionId: subscription.id,
          },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
