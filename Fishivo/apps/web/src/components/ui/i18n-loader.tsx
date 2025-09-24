'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n'
import { cn } from "@/lib/utils"

interface I18nTextProps {
  children: React.ReactNode
  className?: string
  fallbackWidth?: string // CSS width for skeleton loading
}

/**
 * Wrapper component that provides smooth transitions when i18n content changes
 * Prevents layout shifts during translation loading
 */
export function I18nText({ children, className, fallbackWidth }: I18nTextProps) {
  const { isLoading } = useI18n()
  
  return (
    <span 
      className={cn(
        "transition-opacity duration-200 ease-in-out",
        isLoading && "opacity-75",
        className
      )}
      style={fallbackWidth && isLoading ? { minWidth: fallbackWidth } : undefined}
    >
      {children}
    </span>
  )
}

/**
 * Skeleton placeholder for form fields during i18n loading
 */
export function I18nFieldSkeleton({ width = "w-24" }: { width?: string }) {
  return (
    <div className={cn("animate-pulse bg-muted rounded h-4", width)} />
  )
}

/**
 * Button text that maintains width during loading
 */
export function I18nButtonText({ children, className }: { children: React.ReactNode, className?: string }) {
  const { isLoading } = useI18n()
  
  return (
    <span 
      className={cn(
        "transition-all duration-200 ease-in-out inline-block",
        isLoading && "opacity-80 scale-[0.98]",
        className
      )}
    >
      {children}
    </span>
  )
}
