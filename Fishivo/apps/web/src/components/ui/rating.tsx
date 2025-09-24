import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingProps {
  value: number
  onChange?: (rating: number) => void
  max?: number
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  readonly = false,
  size = 'medium',
  disabled = false
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  }

  const handleClick = (rating: number) => {
    if (!readonly && !disabled && onChange) {
      onChange(rating)
    }
  }

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const filled = value >= starValue
        
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={readonly || disabled}
            className={cn(
              "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !readonly && !disabled && "cursor-pointer hover:scale-110",
              (readonly || disabled) && "cursor-default"
            )}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export interface RatingDisplayProps {
  rating: number
  max?: number
  size?: 'small' | 'medium' | 'large'
  showValue?: boolean
  count?: number
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating = 0,
  max = 5,
  size = 'small',
  showValue = true,
  count
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1
          const filled = rating >= starValue
          
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                filled ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              )}
            />
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </div>
  )
}