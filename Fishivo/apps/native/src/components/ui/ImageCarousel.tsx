import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface ImageCarouselProps {
  images: string[];
  aspectRatio?: '4:3' | '1:1' | '4:5';
  showCounter?: boolean;
  onImagePress?: (index: number) => void;
  style?: ViewStyle;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  aspectRatio = '1:1',
  showCounter = true,
  onImagePress,
  style,
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState<number>(0);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const calculateHeight = (width: number): number => {
    const ratios = {
      '4:3': 3 / 4,
      '1:1': 1,
      '4:5': 5 / 4,
    };
    return width * ratios[aspectRatio];
  };

  const containerHeight = measuredWidth > 0 ? calculateHeight(measuredWidth) : undefined;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (measuredWidth <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / measuredWidth);
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
  };

  // Track touch start position to determine gesture direction
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isHorizontalGestureRef = useRef(false);

  return (
    <View
      style={[styles.container, containerHeight ? { height: containerHeight } : null, style]}
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        setMeasuredWidth(width);
      }}
    >
      {measuredWidth > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEnabled={images.length > 1}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="always"
        >
          {images.map((imageUri, index) => (
            <View
              key={index}
              style={[styles.imageContainer, { width: measuredWidth }]}
              onStartShouldSetResponder={(evt) => {
                // Store the initial touch position
                touchStartRef.current = {
                  x: evt.nativeEvent.pageX,
                  y: evt.nativeEvent.pageY
                };
                return false; // Don't capture initially
              }}
              onMoveShouldSetResponder={(evt) => {
                // Calculate the movement delta
                const dx = Math.abs(evt.nativeEvent.pageX - touchStartRef.current.x);
                const dy = Math.abs(evt.nativeEvent.pageY - touchStartRef.current.y);
                
                // Only capture if horizontal movement is greater
                const shouldCapture = dx > dy && dx > 10;
                isHorizontalGestureRef.current = shouldCapture;
                return shouldCapture;
              }}
              onResponderTerminationRequest={() => !isHorizontalGestureRef.current}
            >
              <Pressable
                onPress={() => onImagePress?.(index)}
                style={styles.pressable}
              >
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.image} 
                  resizeMode="cover" 
                />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {showCounter && images.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
      )}

      {!showCounter && images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceVariant,
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  counterContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

export default React.memo(ImageCarousel);