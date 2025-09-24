import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Modal,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { CloseButton } from '@/components/ui/CloseButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const renderImage = useCallback(({ item }: ListRenderItemInfo<string>) => (
    <TouchableOpacity 
      activeOpacity={1}
      onPress={onClose}
      style={styles.imageContainer}
    >
      <Image
        source={{ uri: item }}
        style={styles.image}
        resizeMode="contain"
      />
    </TouchableOpacity>
  ), [onClose, styles.imageContainer, styles.image]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  }, []);

  const getItemLayout = useCallback((_data: ArrayLike<string> | null | undefined, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), []);

  const keyExtractor = useCallback((_item: string, index: number) => index.toString(), []);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Close Button */}
        <View style={styles.header}>
          {images.length > 1 && (
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          )}
          <CloseButton
            onPress={onClose}
            containerStyle={styles.closeButton}
            color="#FFFFFF"
          />
        </View>

        {/* Images */}
        <FlatList
          data={images}
          renderItem={renderImage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialScrollIndex={initialIndex}
          scrollEventThrottle={16}
        />

        {/* Dots */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme, insets: EdgeInsets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    top: insets.top + 40,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  counterContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: insets.bottom + 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3.5,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 8.5,
    height: 8.5,
    borderRadius: 4.25,
  },
});

export default ImageViewerModal;