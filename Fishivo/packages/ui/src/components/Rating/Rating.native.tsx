import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { RatingProps, RatingDisplayProps } from './types'

// Placeholder for star icons - would use react-native-vector-icons in actual app
const StarIcon = ({ filled, size, color }: { filled: boolean; size: number; color: string }) => (
  <View style={{
    width: size,
    height: size,
    backgroundColor: color,
    opacity: filled ? 1 : 0.3
  }} />
)

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
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  }

  const handlePress = (rating: number) => {
    if (!readonly && !disabled && onChange) {
      onChange(rating)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1
          const filled = value >= starValue
          
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handlePress(starValue)}
              disabled={readonly || disabled}
              activeOpacity={readonly || disabled ? 1 : 0.7}
            >
              <StarIcon
                filled={filled}
                size={sizeMap[size]}
                color={filled ? color : emptyColor}
              />
            </TouchableOpacity>
          )
        })}
      </View>
      {showLabel && label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  )
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating = 0,
  max = 5,
  size = 'small',
  showCount = false,
  count = 0
}) => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24
  }

  return (
    <View style={styles.displayContainer}>
      <View style={styles.starsContainer}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1
          const filled = rating >= starValue
          
          return (
            <StarIcon
              key={i}
              filled={filled}
              size={sizeMap[size]}
              color={filled ? '#facc15' : '#d1d5db'}
            />
          )
        })}
      </View>
      <Text style={styles.ratingText}>
        {rating.toFixed(1)}
        {showCount && count > 0 && ` (${count})`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2
  },
  label: {
    fontSize: 14,
    color: '#6b7280'
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280'
  }
})