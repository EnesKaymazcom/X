import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReviewCard } from '@/components/ui/review-card'
import { SectionHeader } from '@/components/ui/section-header'
import { Fish, Loader2 } from 'lucide-react'
import { SpeciesReview } from '@fishivo/types'

interface ReviewSectionProps {
  reviews: SpeciesReview[]
  userReview: SpeciesReview | null
  locale: string
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  userReview,
  locale
}) => {
  const [displayCount, setDisplayCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  
  // Filter out user's own review (if any)
  const otherReviews = reviews.filter(r => r.id !== userReview?.id)
  const displayedReviews = otherReviews.slice(0, displayCount)
  const hasMore = otherReviews.length > displayCount
  
  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount(prev => prev + 10)
      setIsLoading(false)
    }, 300)
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader 
          title={locale === 'tr' ? 'Değerlendirmeler' : 'Reviews'}
        />
      </div>

      {/* User's own review */}
      {userReview && (
        <ReviewCard
          review={userReview}
          locale={locale}
          isOwnReview
        />
      )}

      {/* Other reviews or empty state */}
      {otherReviews.length > 0 ? (
        <>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                locale={locale}
              />
            ))}
          </div>
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    {locale === 'tr' ? 'Daha Fazla Göster' : 'Show More'}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({otherReviews.length - displayCount})
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        // Empty state
        <EmptyReviews locale={locale} hasOwnReview={!!userReview} />
      )}
    </div>
  )
}

// Empty state component
const EmptyReviews: React.FC<{
  locale: string
  hasOwnReview: boolean
}> = ({ locale, hasOwnReview }) => {
  // Eğer kullanıcının kendi review'u varsa ve başka review yoksa, hiçbir şey gösterme
  if (hasOwnReview) {
    return null
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Fish className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          {locale === 'tr' 
            ? 'Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!'
            : 'No reviews yet. Be the first to review!'}
        </p>
      </CardContent>
    </Card>
  )
}