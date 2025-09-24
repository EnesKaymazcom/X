export interface RatingProps {
  value: number
  onChange?: (rating: number) => void
  max?: number
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: string
  emptyColor?: string
  enableHalfStar?: boolean
  disabled?: boolean
  showLabel?: boolean
  label?: string
}

export interface RatingDisplayProps {
  rating: number
  max?: number
  size?: 'small' | 'medium' | 'large'
  showCount?: boolean
  count?: number
}