import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypographySmall } from '@/lib/typography'

interface ProBadgeProps {
  variant?: 'default' | 'small' | 'large'
  className?: string
}

export function ProBadge({ variant = 'default', className }: ProBadgeProps) {
  const variants = {
    small: {
      badge: "text-xs px-1.5 py-0.5",
      icon: "w-2.5 h-2.5 mr-0.5",
      text: "text-xs"
    },
    default: {
      badge: "text-xs px-2 py-1",
      icon: "w-3 h-3 mr-1",
      text: "text-xs"
    },
    large: {
      badge: "text-sm px-3 py-1.5",
      icon: "w-4 h-4 mr-1.5",
      text: "text-sm"
    }
  }

  const currentVariant = variants[variant]

  return (
    <Badge 
      variant="default" 
      className={cn(
        "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-semibold",
        currentVariant.badge,
        className
      )}
    >
      <Crown className={currentVariant.icon} />
      <span className={currentVariant.text}>PRO</span>
    </Badge>
  )
}

interface ProMembershipCardProps {
  proUntil?: string | null
  className?: string
}

export function ProMembershipCard({ proUntil, className }: ProMembershipCardProps) {
  return (
    <div className={cn(
      "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg text-center",
      className
    )}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Crown className="w-4 h-4 text-yellow-600" />
        <TypographySmall className="font-semibold text-yellow-600">PRO Üyelik</TypographySmall>
      </div>
      <TypographySmall className="text-muted-foreground">
        {proUntil 
          ? `${new Date(proUntil).toLocaleDateString('tr-TR')} tarihine kadar`
          : 'Sınırsız süre'
        }
      </TypographySmall>
    </div>
  )
}