import React from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AnimatedTabContentProps {
  children: React.ReactNode;
  animationValue: Animated.Value;
  style?: any;
}

export const AnimatedTabContent: React.FC<AnimatedTabContentProps> = ({
  children,
  animationValue,
  style
}) => {
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animationValue,
          transform: [
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0], // Slight vertical movement for smooth transition
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});