import React, { useEffect, useRef } from 'react'
import { Text, TextStyle, Animated } from 'react-native'

interface AnimatedNumberProps {
  value: number
  duration?: number
  style?: TextStyle
  formatter?: (value: number) => string
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  style,
  formatter
}) => {
  const animatedValue = useRef(new Animated.Value(value)).current
  const currentValue = useRef(value)

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false
    }).start()
    
    currentValue.current = value
  }, [value, duration, animatedValue])

  const formatNumber = (num: number): string => {
    if (formatter) {
      return formatter(num)
    }
    
    // Instagram style number formatting
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 10000) {
      return `${(num / 1000).toFixed(1)}K`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    
    return num.toString()
  }

  return (
    <Animated.Text style={style}>
      {animatedValue.interpolate({
        inputRange: [0, value],
        outputRange: ['0', formatNumber(value)]
      })}
    </Animated.Text>
  )
}

export default AnimatedNumber