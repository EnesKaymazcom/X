"use client"

import { MessageCircle, HelpCircle, X } from "lucide-react"
import { LocalizedLink } from "@/components/ui/localized-link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/lib/i18n"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { TypographyH4, TypographyP } from '@/lib/typography'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation()

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const navigationItems = [
    {
      title: t('nav.fishSpecies'),
      href: "/fish-species",
    },
    {
      title: t('nav.map'),
      href: "/map",
    },
  ]

  const supportItems = [
    {
      title: t('nav.contact'),
      href: "/support",
      description: t('nav.contactDescription'),
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      title: t('nav.faq'),
      href: "/faq",
      description: t('nav.faqDescription'),
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80"
            onClick={onClose}
          />
          
          {/* Full Screen Menu */}
          <motion.div 
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="relative z-10 fixed inset-0 bg-background"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <LocalizedLink 
                href="/" 
                className="flex items-center space-x-2"
                onClick={onClose}
              >
                <div className="h-7 w-7 flex-shrink-0">
                  <Image 
                    src="/fishivo-black.svg" 
                    alt="Fishivo Logo" 
                    width={28} 
                    height={28}
                    className="h-7 w-7 dark:hidden"
                    priority
                  />
                  <Image 
                    src="/fishivo.svg" 
                    alt="Fishivo Logo" 
                    width={28} 
                    height={28}
                    className="h-7 w-7 hidden dark:block"
                    priority
                  />
                </div>
                <span className="font-bold text-lg">
                  Fishivo
                </span>
              </LocalizedLink>
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
              >
                <X className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </div>
            
            {/* Menu Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="p-6 space-y-6"
            >
              {/* Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg h-14 px-4"
                      asChild
                    >
                      <LocalizedLink href={item.href} onClick={onClose}>
                        {item.title}
                      </LocalizedLink>
                    </Button>
                  </motion.div>
                ))}
              </div>

              <Separator />

              {/* Support Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="space-y-4"
              >
                <TypographyH4 className="text-muted-foreground px-4">
                  {t('nav.support')}
                </TypographyH4>
                <div className="space-y-2">
                  {supportItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-4"
                        asChild
                      >
                        <LocalizedLink 
                          href={item.href} 
                          onClick={onClose}
                          className="flex items-start gap-4"
                        >
                          <div className="mt-1 text-muted-foreground">{item.icon}</div>
                          <div className="flex-1 text-left">
                            <TypographyP>{item.title}</TypographyP>
                            <TypographyP className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </TypographyP>
                          </div>
                        </LocalizedLink>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}