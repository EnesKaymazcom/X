import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@fishivo/utils'
import { RatingProps, RatingDisplayProps } from './types'

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  readonly = false,
  size = 'medium',
  color = '#facc15', // yellow-400
  emptyColor = '#d1d5db', // gray-300
  enableHalfStar = false,
  disabled = false,
  showLabel = false,
  label
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  }

  const handleClick = (rating: number) => {
    if (!readonly && !disabled && onChange) {
      onChange(rating)
    }
  }

  return (
    <div className="flex items-center gap-2">
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
                "transition-colors focus:outline-none",
                !readonly && !disabled && "cursor-pointer hover:scale-110",
                (readonly || disabled) && "cursor-default"
              )}
              aria-label={`Rate ${starValue} out of ${max}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  filled ? "fill-current" : ""
                )}
                style={{
                  color: filled ? color : emptyColor
                }}
              />
            </button>
          )
        })}
      </div>
      {showLabel && label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating = 0,
  max = 5,
  size = 'small',
  showCount = false,
  count = 0
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
          const halfFilled = rating > i && rating < starValue
          
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled ? "fill-current text-yellow-400" : "text-gray-300"
              )}
            />
          )
        })}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)}
        {showCount && count > 0 && ` (${count})`}
      </span>
    </div>
  )
}