import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Rating } from '@/components/ui/rating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Fish, Calendar, User } from 'lucide-react'
import { SpeciesReview } from '@fishivo/types'

interface ReviewCardProps {
  review: SpeciesReview
  locale: string
  isOwnReview?: boolean
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  locale,
  isOwnReview = false
}) => {
  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'easy':
        return locale === 'tr' ? 'Kolay' : 'Easy'
      case 'medium':
        return locale === 'tr' ? 'Orta' : 'Medium'
      case 'hard':
        return locale === 'tr' ? 'Zor' : 'Hard'
      default:
        return level
    }
  }

  if (isOwnReview) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {locale === 'tr' ? 'Sizin Değerlendirmeniz' : 'Your Review'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user?.avatar_url} alt={review.user?.username || review.user?.full_name} />
              <AvatarFallback>
                {review.user?.username?.charAt(0)?.toUpperCase() || 
                 review.user?.full_name?.charAt(0)?.toUpperCase() || 
                 <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            {/* User info and rating */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {review.user?.username || review.user?.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString(locale)}
                </span>
              </div>
              <Rating value={review.rating} readonly size="small" />
            </div>
          </div>
          <ReviewContent review={review} locale={locale} getDifficultyLabel={getDifficultyLabel} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user?.avatar_url} alt={review.user?.username || review.user?.full_name} />
              <AvatarFallback>
                {review.user?.username?.charAt(0)?.toUpperCase() || 
                 review.user?.full_name?.charAt(0)?.toUpperCase() || 
                 <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            {/* User info and rating */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {review.user?.username || review.user?.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString(locale)}
                </span>
              </div>
              <Rating value={review.rating} readonly size="small" />
            </div>
          </div>
          {review.is_verified && (
            <Badge variant="secondary">
              {locale === 'tr' ? 'Doğrulandı' : 'Verified'}
            </Badge>
          )}
        </div>
        
        <ReviewContent review={review} locale={locale} getDifficultyLabel={getDifficultyLabel} />
      </CardContent>
    </Card>
  )
}

// Shared review content component
const ReviewContent: React.FC<{
  review: SpeciesReview
  locale: string
  getDifficultyLabel: (level: string) => string
}> = ({ review, locale, getDifficultyLabel }) => {
  return (
    <div className="space-y-3">      
      {review.review_text && (
        <p className="text-sm">{review.review_text}</p>
      )}
      
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {review.caught_count !== undefined && review.caught_count > 0 && (
          <span className="flex items-center gap-1">
            <Fish className="h-4 w-4" />
            {review.caught_count} {locale === 'tr' ? 'yakalama' : 'catches'}
          </span>
        )}
        {review.best_season && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {review.best_season}
          </span>
        )}
        {review.difficulty_level && (
          <Badge variant={review.user ? "outline" : "secondary"} className="text-xs">
            {getDifficultyLabel(review.difficulty_level)}
          </Badge>
        )}
      </div>
      
      {(review.best_bait || review.best_technique || review.fishing_tips) && (
        <div className="mt-3 pt-3 border-t space-y-1">
          {review.best_bait && (
            <p className="text-xs">
              <span className="font-medium">{locale === 'tr' ? 'En iyi yem:' : 'Best bait:'}</span> {review.best_bait}
            </p>
          )}
          {review.best_technique && (
            <p className="text-xs">
              <span className="font-medium">{locale === 'tr' ? 'En iyi teknik:' : 'Best technique:'}</span> {review.best_technique}
            </p>
          )}
          {review.fishing_tips && (
            <p className="text-xs">
              <span className="font-medium">{locale === 'tr' ? 'İpuçları:' : 'Tips:'}</span> {review.fishing_tips}
            </p>
          )}
        </div>
      )}
    </div>
  )
}