import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TypographyH3 } from '@/lib/typography'
import { Check, X, HelpCircle, Users, Utensils, Trophy, Target } from 'lucide-react'

interface CommunityStatsData {
  good_eating_yes: number
  good_eating_no: number
  good_eating_total: number
  good_fight_yes: number
  good_fight_no: number
  good_fight_total: number
  hard_to_catch_yes: number
  hard_to_catch_no: number
  hard_to_catch_total: number
  total_contributors: number
}

interface CommunityStatsProps {
  stats: CommunityStatsData | null
  locale: string
}

export const CommunityStats: React.FC<CommunityStatsProps> = ({ stats, locale }) => {
  if (!stats || stats.total_contributors === 0) {
    return null
  }

  const getPercentage = (yes: number, total: number) => {
    if (total === 0) return 0
    return Math.round((yes / total) * 100)
  }

  const getResultBadge = (yesCount: number, noCount: number, locale: string) => {
    if (yesCount > noCount) {
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Check className="h-3 w-3 mr-1" />
          {locale === 'tr' ? 'Evet' : 'Yes'}
        </Badge>
      )
    } else if (noCount > yesCount) {
      return (
        <Badge variant="default" className="bg-red-600 hover:bg-red-700">
          <X className="h-3 w-3 mr-1" />
          {locale === 'tr' ? 'Hayır' : 'No'}
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <HelpCircle className="h-3 w-3 mr-1" />
          {locale === 'tr' ? 'Kararsız' : 'Mixed'}
        </Badge>
      )
    }
  }

  const StatCard = ({ 
    icon: Icon, 
    title, 
    yesCount, 
    noCount, 
    totalCount 
  }: {
    icon: React.ElementType
    title: string
    yesCount: number
    noCount: number
    totalCount: number
  }) => {
    const yesPercent = getPercentage(yesCount, totalCount)
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {title}
            </span>
            {getResultBadge(yesCount, noCount, locale)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-blue-600" />
                {locale === 'tr' ? 'Evet' : 'Yes'} ({yesPercent}%)
              </span>
              <span className="text-muted-foreground">{yesCount}</span>
            </div>
            <Progress value={yesPercent} className="h-2 [&>*]:bg-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <X className="h-3 w-3 text-red-600" />
                {locale === 'tr' ? 'Hayır' : 'No'} ({100 - yesPercent}%)
              </span>
              <span className="text-muted-foreground">{noCount}</span>
            </div>
            <Progress value={100 - yesPercent} className="h-2 bg-red-100 [&>*]:bg-red-500" />
          </div>
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            {totalCount} {locale === 'tr' ? 'yanıt' : 'responses'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <TypographyH3>{locale === 'tr' ? 'Topluluk Verileri' : 'Community Data'}</TypographyH3>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {stats.total_contributors} {locale === 'tr' ? 'katkıda bulunan' : 'contributors'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {locale === 'tr' 
            ? 'Bu tür hakkında detaylar vererek topluluğa yardımcı olun' 
            : 'Help the community by contributing details about this species'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Utensils}
          title={locale === 'tr' ? 'Yemek İçin İyi mi?' : 'Good Eating?'}
          yesCount={stats.good_eating_yes}
          noCount={stats.good_eating_no}
          totalCount={stats.good_eating_total}
        />
        
        <StatCard
          icon={Trophy}
          title={locale === 'tr' ? 'İyi Mücadele Eder mi?' : 'Good Fight?'}
          yesCount={stats.good_fight_yes}
          noCount={stats.good_fight_no}
          totalCount={stats.good_fight_total}
        />
        
        <StatCard
          icon={Target}
          title={locale === 'tr' ? 'Yakalamak Zor mu?' : 'Hard to Catch?'}
          yesCount={stats.hard_to_catch_yes}
          noCount={stats.hard_to_catch_no}
          totalCount={stats.hard_to_catch_total}
        />
      </div>
    </div>
  )
}