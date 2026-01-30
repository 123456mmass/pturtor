import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { omise } from '@/lib/omise'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, paymentMethod } = await req.json()

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

    const amount = Math.round(course.price * 100) // Convert to satang

    // Create Omise source based on payment method
    let sourceType: 'promptpay' | 'internet_banking_bbl' | 'internet_banking_scb' | 'internet_banking_ktb' | 'internet_banking_bay' = 'promptpay'
    
    if (paymentMethod.startsWith('internet_banking')) {
      sourceType = paymentMethod as any
    }

    const source = await omise.sources.create({
      type: sourceType,
      amount,
      currency: 'THB',
    })

    // Create charge
    const charge = await omise.charges.create({
      amount,
      currency: 'THB',
      source: source.id,
      description: `Purchase: ${course.title}`,
      metadata: {
        userId: session.user.id,
        courseId: course.id,
      },
    })

    // Create pending purchase record
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        amount: course.price,
        currency: 'THB',
        provider: 'OMISE',
        providerPaymentId: charge.id,
        status: 'PENDING',
      },
    })

    // Return the authorize URI for redirect
    return NextResponse.json({
      authorizeUri: charge.authorize_uri,
      chargeId: charge.id,
    })
  } catch (error) {
    console.error('Omise checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
