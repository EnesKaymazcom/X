"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface HamburgerMenuProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function HamburgerMenu({ isOpen, onClick, className }: HamburgerMenuProps) {
  const { t } = useTranslation()
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col justify-center items-center w-7 h-7 space-y-[3px] focus:outline-none transition-all duration-300",
        className
      )}
      aria-label={t('common.ui.toggleMenu')}
    >
      <span
        className={cn(
          "block w-5 h-[2px] bg-foreground transition-all duration-300 ease-in-out",
          isOpen ? "rotate-45 translate-y-[5px]" : ""
        )}
      />
      <span
        className={cn(
          "block w-5 h-[2px] bg-foreground transition-all duration-300 ease-in-out",
          isOpen ? "opacity-0" : ""
        )}
      />
      <span
        className={cn(
          "block w-5 h-[2px] bg-foreground transition-all duration-300 ease-in-out",
          isOpen ? "-rotate-45 -translate-y-[5px]" : ""
        )}
      />
    </button>
  )
}