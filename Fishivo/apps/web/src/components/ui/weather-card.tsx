import * as React from "react"

import { cn } from "@/lib/utils"

const WeatherCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl border bg-card p-4 text-card-foreground shadow-sm md:p-6",
      className
    )}
    {...props}
  />
))
WeatherCard.displayName = "WeatherCard"

const WeatherCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
WeatherCardHeader.displayName = "WeatherCardHeader"

const WeatherCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "flex flex-row items-center gap-2 text-sm font-semibold leading-none tracking-tight text-neutral-600 dark:text-neutral-400 md:text-base md:font-medium",
      className
    )}
    {...props}
  />
))
WeatherCardTitle.displayName = "WeatherCardTitle"

const WeatherCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
WeatherCardDescription.displayName = "WeatherCardDescription"

const WeatherCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold md:text-lg", className)}
    {...props}
  />
))
WeatherCardContent.displayName = "WeatherCardContent"

const WeatherCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto flex items-center pt-0 text-xs md:text-sm",
      className
    )}
    {...props}
  />
))
WeatherCardFooter.displayName = "WeatherCardFooter"

export { WeatherCard, WeatherCardHeader, WeatherCardFooter, WeatherCardTitle, WeatherCardDescription, WeatherCardContent }