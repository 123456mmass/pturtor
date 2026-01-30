import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'THB') {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours} ชั่วโมง ${minutes} นาที`
  }
  return `${minutes} นาที`
}
