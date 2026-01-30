'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useToast } from '@/components/ui/use-toast'

interface ThaiPaymentButtonProps {
  courseId: string
  price: number
}

export function ThaiPaymentButton({ courseId, price }: ThaiPaymentButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('promptpay')

  const paymentMethods = [
    { id: 'promptpay', name: 'พร้อมเพย์', icon: '💳' },
    { id: 'internet_banking_bbl', name: 'ธนาคารกรุงเทพ', icon: '🏦' },
    { id: 'internet_banking_scb', name: 'ธนาคารไทยพาณิชย์', icon: '🏦' },
    { id: 'internet_banking_ktb', name: 'ธนาคารกรุงไทย', icon: '🏦' },
    { id: 'internet_banking_bay', name: 'ธนาคารกรุงศรี', icon: '🏦' },
  ]

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout/omise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          paymentMethod: selectedMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
          return
        }
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to Omise payment page
      window.location.href = data.authorizeUri
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
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">เลือกวิธีชำระเงิน</label>
        <div className="grid grid-cols-1 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="flex-1 text-left">{method.name}</span>
              {selectedMethod === method.id && (
                <span className="text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full"
        size="lg"
        variant="outline"
      >
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        ชำระเงินผ่าน {paymentMethods.find(m => m.id === selectedMethod)?.name}
      </Button>
    </div>
  )
}
