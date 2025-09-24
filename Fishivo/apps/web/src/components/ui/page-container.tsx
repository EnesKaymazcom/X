import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function PageContainer({ 
  children, 
  className,
  noPadding = false 
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        "w-full mx-auto", // Navbar offset handled by main
        !noPadding && "px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 lg:pt-3 pb-8 sm:pb-12 lg:pb-20",
        "max-w-[1600px]", // Much wider container
        className
      )}
    >
      {children}
    </div>
  )
}