import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await req.json()

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // Get or create Stripe customer
    let customerId: string | undefined = (session.user as any).stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || session.user.email!,
      })
      customerId = customer.id
      
      // Save customer ID to user
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: course.title,
              images: course.thumbnail ? [course.thumbnail] : undefined,
            },
            unit_amount: Math.round((course.price as any) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${course.slug}`,
      metadata: {
        userId: session.user.id,
        courseId: course.id,
      },
    } as any)

    // Create pending purchase record
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        amount: course.price,
        currency: 'THB',
        provider: 'STRIPE',
        providerPaymentId: checkoutSession.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
