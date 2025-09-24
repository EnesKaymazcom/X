"use client"

import { useState, memo, useMemo } from "react"
import { LocalizedLink } from "@/components/ui/localized-link"
import { FishivoLogo } from "@/components/ui/fishivo-logo"
import { MessageCircle, HelpCircle } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { HamburgerMenu } from "@/components/ui/hamburger-menu"
import { MobileMenu } from "@/components/ui/mobile-menu"
import { LanguageSwitcherCompact } from "@/components/ui/language-switcher"
import { AuthStatusWrapper } from "@/components/auth/auth-status-wrapper"
import { Button } from "@/components/ui/button"
import { TypographySmall } from "@/lib/typography"
import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import React from "react"


export const Navbar = memo(function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const components = useMemo(() => [
    {
      title: t('nav.contact'),
      href: "/support",
      description: t('nav.contactDescription'),
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      title: t('nav.faq'),
      href: "/faq",
      description: t('nav.faqDescription'),
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ], [t])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-md h-navbar" style={{ width: '100vw' }}>
      <div className="w-full max-w-[1600px] mx-auto h-full">
        {/* NAVBAR GRID LAYOUT - PIXEL PERFECT */}
        <div 
          className="grid h-full items-center px-4 sm:px-6 lg:px-8 py-4"
          style={{
            gridTemplateColumns: '120px 1fr auto',
            gridTemplateAreas: '"logo navigation utilities"'
          }}
        >
          
          {/* LOGO SECTION - ABSOLUTE FIXED */}
          <div 
            className="flex items-center"
            style={{ 
              gridArea: 'logo',
              width: '120px !important',
              minWidth: '120px !important',
              maxWidth: '120px !important',
              flexShrink: 0,
              flexGrow: 0
            }}
          >
            <FishivoLogo size="md" />
          </div>

          {/* NAVIGATION SECTION - FIXED POSITION */}
          <div 
            className="hidden md:flex items-center justify-start gap-0.5"
            style={{ 
              gridArea: 'navigation',
              paddingLeft: '0px !important',
              minHeight: '40px !important'
            }}
          >
            {/* Fish Species Page */}
            <Button variant="ghost" asChild>
              <LocalizedLink href="/fish-species">
                {t('nav.fishSpecies')}
              </LocalizedLink>
            </Button>

            {/* Map Page */}
            <Button variant="ghost" asChild>
              <LocalizedLink href="/map">
                {t('nav.map')}
              </LocalizedLink>
            </Button>

            {/* Weather Page - Commented out */}
            {/* <Button variant="ghost" asChild>
              <LocalizedLink href="/weather">
                {t('nav.weather')}
              </LocalizedLink>
            </Button> */}

            {/* Support Dropdown - NavigationMenu ile Hover Desteği */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-4 py-2">
                    {t('nav.support')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-1 p-2">
                      {components.map((component) => (
                        <li key={component.title}>
                          <NavigationMenuLink asChild>
                            <LocalizedLink 
                              href={component.href}
                              className="flex items-start gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <div className="mt-0.5">
                                {component.icon}
                              </div>
                              <div>
                                <TypographySmall className="font-medium">{component.title}</TypographySmall>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {component.description}
                                </p>
                              </div>
                            </LocalizedLink>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* UTILITIES SECTION - RIGHT SIDE */}
          <div 
            className="flex items-center gap-2 justify-end"
            style={{ 
              gridArea: 'utilities',
              minHeight: '40px !important'
            }}
          >
            {/* Language Switcher */}
            <LanguageSwitcherCompact />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Authentication Section */}
            <AuthStatusWrapper />
            
            {/* Hamburger Menu - Only visible on mobile */}
            <div className="md:hidden">
              <HamburgerMenu 
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  )
})
