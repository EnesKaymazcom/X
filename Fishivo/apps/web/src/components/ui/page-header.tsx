import { cn } from "@/lib/utils"
import { TypographyH1, TypographyP } from '@/lib/typography'

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn("border-grid", className)} {...props}>
      <div className="container-wrapper">
        <div className="container flex flex-col items-start gap-1 py-8 md:py-10 lg:py-12">
          {children}
        </div>
      </div>
    </section>
  )
}

function PageHeaderHeading({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <TypographyH1 className={className} {...props}>
      {children}
    </TypographyH1>
  )
}

function PageHeaderDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <TypographyP 
      className={cn("max-w-2xl", className)} 
      {...props}
    >
      {children}
    </TypographyP>
  )
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription }