import React from 'react'
import { cn } from '@/lib/utils'

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl",
      className
    )}>
      {children}
    </h1>
  )
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "scroll-m-20 pb-2 text-2xl font-bold tracking-tight first:mt-0 sm:text-3xl",
      className
    )}>
      {children}
    </h2>
  )
}

export function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl",
      className
    )}>
      {children}
    </h3>
  )
}

export function TypographyH4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "scroll-m-20 text-lg font-semibold tracking-tight sm:text-xl",
      className
    )}>
      {children}
    </h4>
  )
}

export function TypographyH5({ children, className }: TypographyProps) {
  return (
    <h5 className={cn(
      "scroll-m-20 text-base font-semibold tracking-tight sm:text-lg",
      className
    )}>
      {children}
    </h5>
  )
}

export function TypographyH6({ children, className }: TypographyProps) {
  return (
    <h6 className={cn(
      "scroll-m-20 text-sm font-semibold tracking-tight sm:text-base",
      className
    )}>
      {children}
    </h6>
  )
}

export function TypographyP({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm leading-6 sm:text-base sm:leading-7 [&:not(:first-child)]:mt-6",
      className
    )}>
      {children}
    </p>
  )
}

export function TypographyBlockquote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn(
      "mt-6 border-l-2 pl-6 italic text-sm sm:text-base",
      className
    )}>
      {children}
    </blockquote>
  )
}

export function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-lg text-muted-foreground sm:text-xl",
      className
    )}>
      {children}
    </p>
  )
}

export function TypographyLarge({ children, className }: TypographyProps) {
  return (
    <div className={cn(
      "text-lg font-semibold",
      className
    )}>
      {children}
    </div>
  )
}

export function TypographySmall({ children, className }: TypographyProps) {
  return (
    <small className={cn(
      "text-sm font-medium leading-none",
      className
    )}>
      {children}
    </small>
  )
}

export function TypographyMuted({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm text-muted-foreground",
      className
    )}>
      {children}
    </p>
  )
}

export function TypographyCode({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      className
    )}>
      {children}
    </code>
  )
}

interface TypographyListProps {
  children: React.ReactNode
  className?: string
  ordered?: boolean
}

export function TypographyList({ children, className, ordered = false }: TypographyListProps) {
  const Component = ordered ? 'ol' : 'ul'
  
  return (
    <Component className={cn(
      "my-6 ml-6 [&>li]:mt-2",
      ordered ? "list-decimal" : "list-disc",
      className
    )}>
      {children}
    </Component>
  )
}

export function TypographyInlineCode({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
      className
    )}>
      {children}
    </code>
  )
}