"use client"

import Image from "next/image"
import { LocalizedLink } from "@/components/ui/localized-link"
import { cn } from "@/lib/utils"

interface FishivoLogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  forceWhite?: boolean
}

export function FishivoLogo({ 
  className, 
  showText = true,
  size = "md",
  forceWhite = false 
}: FishivoLogoProps) {
  const sizeConfig = {
    sm: {
      container: "w-20",
      image: "h-5 w-5",
      text: "text-base",
      imageSize: 20
    },
    md: {
      container: "w-[116px]",
      image: "h-7 w-7",
      text: "text-lg",
      imageSize: 28
    },
    lg: {
      container: "w-36",
      image: "h-9 w-9", 
      text: "text-xl",
      imageSize: 36
    },
    xl: {
      container: "w-auto",
      image: "h-12 w-12", 
      text: "text-5xl",
      imageSize: 48
    }
  }

  const config = sizeConfig[size]

  return (
    <LocalizedLink 
      href="/" 
      className={cn(
        "flex items-center gap-2",
        config.container,
        className
      )}
      style={{
        textDecoration: 'none',
        fontFamily: 'inherit',
        fontWeight: '700',
        fontSize: size === "md" ? '20px' : size === "xl" ? '30px' : undefined,
        lineHeight: size === "md" ? '28px' : size === "xl" ? '36px' : undefined,
        letterSpacing: '-0.025em',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      <div className={cn("flex-shrink-0", config.image)}>
        {forceWhite ? (
          <Image 
            src="/fishivo.svg" 
            alt="Fishivo Logo" 
            width={config.imageSize} 
            height={config.imageSize}
            className={cn(config.image)}
            priority
          />
        ) : (
          <>
            <Image 
              src="/fishivo-black.svg" 
              alt="Fishivo Logo" 
              width={config.imageSize} 
              height={config.imageSize}
              className={cn(config.image, "dark:hidden")}
              priority
            />
            <Image 
              src="/fishivo.svg" 
              alt="Fishivo Logo" 
              width={config.imageSize} 
              height={config.imageSize}
              className={cn(config.image, "hidden dark:block")}
              priority
            />
          </>
        )}
      </div>
      {showText && (
        <span className={cn("font-bold", config.text, forceWhite && "text-white")}>
          Fishivo
        </span>
      )}
    </LocalizedLink>
  )
}