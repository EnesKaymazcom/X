import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title,
  className
}) => {
  return (
    <h3 className={cn(
      "text-xl font-bold",
      className
    )}>
      {title}
    </h3>
  )
}