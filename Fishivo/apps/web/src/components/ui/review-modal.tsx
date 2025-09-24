import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Rating } from '@/components/ui/rating'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Check, X, HelpCircle } from 'lucide-react'
import { SpeciesReview } from '@fishivo/types'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Form validation schema
const reviewSchema = z.object({
  rating: z.number().min(1, 'Lütfen bir puan verin').max(5),
  review_text: z.string().optional(),
  // Community questions
  is_good_eating: z.boolean().nullable().optional(),
  puts_up_good_fight: z.boolean().nullable().optional(),
  is_hard_to_catch: z.boolean().nullable().optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReviewFormData) => Promise<void>
  existingReview?: SpeciesReview | null
  locale: string
  speciesName: string
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingReview,
  locale,
  speciesName
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      review_text: existingReview?.review_text || '',
      is_good_eating: null,
      puts_up_good_fight: null,
      is_hard_to_catch: null
    }
  })

  // Reset form when modal opens/closes or review changes
  useEffect(() => {
    if (isOpen) {
      reset({
        rating: existingReview?.rating || 0,
        review_text: existingReview?.review_text || '',
        is_good_eating: null,
        puts_up_good_fight: null,
        is_hard_to_catch: null
      })
      setError(null)
    }
  }, [isOpen, existingReview, reset])

  const onFormSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      await onSubmit(data)
      onClose()
    } catch (err: any) {
      setError(err.message || (locale === 'tr' ? 'Bir hata oluştu' : 'An error occurred'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingReview 
              ? (locale === 'tr' ? 'Değerlendirmeyi Düzenle' : 'Edit Review')
              : (locale === 'tr' ? `${speciesName} için Değerlendirme` : `Review for ${speciesName}`)
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="required">
              {locale === 'tr' ? 'Puan' : 'Rating'}
            </Label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Rating
                    value={field.value}
                    onChange={field.onChange}
                    size="large"
                  />
                  {field.value > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {field.value}/5
                    </span>
                  )}
                </div>
              )}
            />
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review_text">
              {locale === 'tr' ? 'Deneyiminiz (İsteğe bağlı)' : 'Your Experience (Optional)'}
            </Label>
            <Controller
              name="review_text"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={locale === 'tr' 
                    ? 'Bu balık hakkındaki deneyimlerinizi paylaşın...'
                    : 'Share your experience with this fish...'}
                  rows={4}
                />
              )}
            />
          </div>

          {/* Community Questions Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                {locale === 'tr' ? 'DAHA FAZLA BİLGİ VER' : 'TELL US MORE'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === 'tr' 
                  ? 'Bu tür hakkında detaylar vererek topluluğa yardımcı olun' 
                  : 'Help the community by contributing details about this species'}
              </p>
            </div>

            {/* Is good eating? */}
            <div className="space-y-2">
              <Label>{locale === 'tr' ? 'Bu balık yemek için iyi mi?' : 'Is the fish good eating?'}</Label>
              <Controller
                name="is_good_eating"
                control={control}
                render={({ field }) => (
                  <RadioGroup 
                    value={field.value === null ? undefined : field.value.toString()} 
                    onValueChange={(val) => field.onChange(val === 'null' ? null : val === 'true')}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="eating-yes" />
                      <Label htmlFor="eating-yes" className="flex items-center gap-1 cursor-pointer">
                        <Check className="h-4 w-4 text-blue-600" />
                        {locale === 'tr' ? 'Evet' : 'Yes'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="eating-no" />
                      <Label htmlFor="eating-no" className="flex items-center gap-1 cursor-pointer">
                        <X className="h-4 w-4 text-red-600" />
                        {locale === 'tr' ? 'Hayır' : 'No'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="null" id="eating-unsure" />
                      <Label htmlFor="eating-unsure" className="flex items-center gap-1 cursor-pointer">
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                        {locale === 'tr' ? 'Emin Değilim' : 'Not Sure'}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Does fish put up a good fight? */}
            <div className="space-y-2">
              <Label>{locale === 'tr' ? 'Balık iyi mücadele eder mi?' : 'Does fish put up a good fight?'}</Label>
              <Controller
                name="puts_up_good_fight"
                control={control}
                render={({ field }) => (
                  <RadioGroup 
                    value={field.value === null ? undefined : field.value.toString()} 
                    onValueChange={(val) => field.onChange(val === 'null' ? null : val === 'true')}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="fight-yes" />
                      <Label htmlFor="fight-yes" className="flex items-center gap-1 cursor-pointer">
                        <Check className="h-4 w-4 text-blue-600" />
                        {locale === 'tr' ? 'Evet' : 'Yes'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="fight-no" />
                      <Label htmlFor="fight-no" className="flex items-center gap-1 cursor-pointer">
                        <X className="h-4 w-4 text-red-600" />
                        {locale === 'tr' ? 'Hayır' : 'No'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="null" id="fight-unsure" />
                      <Label htmlFor="fight-unsure" className="flex items-center gap-1 cursor-pointer">
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                        {locale === 'tr' ? 'Emin Değilim' : 'Not Sure'}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Is fish hard to catch or find? */}
            <div className="space-y-2">
              <Label>{locale === 'tr' ? 'Balığı yakalamak veya bulmak zor mu?' : 'Is fish hard to catch or find?'}</Label>
              <Controller
                name="is_hard_to_catch"
                control={control}
                render={({ field }) => (
                  <RadioGroup 
                    value={field.value === null ? undefined : field.value.toString()} 
                    onValueChange={(val) => field.onChange(val === 'null' ? null : val === 'true')}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="catch-yes" />
                      <Label htmlFor="catch-yes" className="flex items-center gap-1 cursor-pointer">
                        <Check className="h-4 w-4 text-blue-600" />
                        {locale === 'tr' ? 'Evet' : 'Yes'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="catch-no" />
                      <Label htmlFor="catch-no" className="flex items-center gap-1 cursor-pointer">
                        <X className="h-4 w-4 text-red-600" />
                        {locale === 'tr' ? 'Hayır' : 'No'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="null" id="catch-unsure" />
                      <Label htmlFor="catch-unsure" className="flex items-center gap-1 cursor-pointer">
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                        {locale === 'tr' ? 'Emin Değilim' : 'Not Sure'}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {locale === 'tr' ? 'İptal' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || watch('rating') === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingReview 
                ? (locale === 'tr' ? 'Güncelle' : 'Update')
                : (locale === 'tr' ? 'Gönder' : 'Submit')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}