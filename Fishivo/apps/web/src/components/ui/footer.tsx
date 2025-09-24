"use client"

import { LocalizedLink } from "@/components/ui/localized-link"
import { FishivoLogo } from "@/components/ui/fishivo-logo"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { TypographyH3, TypographyH4, TypographySmall } from "@/lib/typography"
import { cn } from "@/lib/utils"
import { 
  Instagram, 
  Youtube, 
  Mail
} from "lucide-react"
import { XIcon } from "@/components/icons/x-icon"
import { AppDownloadButtons } from "./app-download-buttons"

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { href: "/", label: t("components.footer.sections.navigation.home") },
    { href: "/fish-species", label: t("components.footer.sections.navigation.fishSpecies") },
    { href: "/map", label: t("components.footer.sections.navigation.map") },
    { href: "/support", label: t("components.footer.sections.navigation.support") },
    { href: "/faq", label: t("components.footer.sections.navigation.faq") },
  ]

  const legalLinks = [
    { href: "/privacy", label: t("components.footer.sections.legal.privacy") },
    { href: "/terms", label: t("components.footer.sections.legal.terms") },
    { href: "/kvkk", label: t("components.footer.sections.legal.kvkk") },
    { href: "/cookies", label: t("components.footer.sections.legal.cookies") },
  ]

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/fishivo", label: "Instagram" },
    { icon: XIcon, href: "https://x.com/fishivoapp", label: "X" },
    { icon: Youtube, href: "https://youtube.com/@fishivo", label: "YouTube" },
  ]

  return (
    <footer className={cn("bg-background border-t w-full", className)}>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-[150px]">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              <FishivoLogo size="md" />
              {/* Mobile App Buttons */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">{t("components.footer.sections.mobile.description")}</p>
                <AppDownloadButtons size="sm" className="!justify-start" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">
              {t("components.footer.sections.navigation.title")}
            </h4>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedLink
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">
              {t("components.footer.sections.legal.title")}
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedLink
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-sm mb-4">
              {t("components.footer.sections.contact.title")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@fishivo.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  contact@fishivo.com
                </a>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="mt-6">
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {social.icon === XIcon ? (
                      <XIcon className="h-3 w-3" />
                    ) : (
                      <social.icon className="h-4 w-4" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}