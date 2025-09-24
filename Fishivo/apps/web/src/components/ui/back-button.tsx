"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  iconType?: 'chevron' | 'arrow'
  className?: string
}

export function BackButton({ 
  href, 
  label = 'Geri', 
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  iconType = 'chevron',
  className = ''
}: BackButtonProps) {
  const router = useRouter()
  
  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }
  
  const Icon = iconType === 'chevron' ? ChevronLeft : ArrowLeft
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      {label}
    </Button>
  )
}