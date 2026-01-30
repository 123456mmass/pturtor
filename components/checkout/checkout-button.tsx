'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useToast } from '@/components/ui/use-toast'

interface CheckoutButtonProps {
  courseId: string
  price: number
  children?: React.ReactNode
}

export function CheckoutButton({ courseId, price, children }: CheckoutButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
          return
        }
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถทำรายการได้',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {children || 'ซื้อคอร์สนี้'}
    </Button>
  )
}
