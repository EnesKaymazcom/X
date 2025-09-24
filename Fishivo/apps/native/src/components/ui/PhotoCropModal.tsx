import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { 
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';

interface PhotoCropModalProps {
  visible: boolean;
  imageUri?: string;  // Tek foto için
  images?: string[];  // Çoklu foto için
  onClose: () => void;
  onCrop?: (croppedUri: string, aspectRatio?: AspectRatioType) => void;  // Tek foto callback with aspect ratio
  onCropAll?: (croppedUris: string[], aspectRatios?: AspectRatioType[]) => void;  // Çoklu foto callback with aspect ratios
  defaultAspectRatio?: 'square' | 'portrait' | 'landscape';
  forSpot?: boolean;  // Spot için sadece 4:3 göster
}

export type AspectRatioType = 'square' | 'portrait' | 'landscape';

interface AspectRatioConfig {
  ratio: number;
  icon: string;
  label: string;
}

interface CropSetting {
  scale: number;
  translateX: number;
  translateY: number;
  aspectRatio: AspectRatioType;
}

const ASPECT_RATIOS: Record<AspectRatioType, AspectRatioConfig> = {
  square: { ratio: 1.0, icon: 'square', label: '1:1' },
  portrait: { ratio: 0.8, icon: 'smartphone', label: '4:5' },
  landscape: { ratio: 1.333, icon: 'monitor', label: '4:3' }
};

const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  visible,
  imageUri,
  images,
  onClose,
  onCrop,
  onCropAll,
  defaultAspectRatio = 'square',
  forSpot = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const viewShotRef = useRef<ViewShot>(null);

  // Batch mode detection
  const isBatchMode = !imageUri && images && images.length > 0;
  const allImages = useMemo(() => 
    isBatchMode ? images : (imageUri ? [imageUri] : []),
    [isBatchMode, images, imageUri]
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [croppedAspectRatios, setCroppedAspectRatios] = useState<AspectRatioType[]>([]);
  const [cropSettings, setCropSettings] = useState<CropSetting[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(defaultAspectRatio);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Available aspect ratios based on context
  const availableRatios = useMemo((): AspectRatioType[] => {
    return forSpot 
      ? ['landscape']  // Sadece 4:3 için spot'lar
      : (Object.keys(ASPECT_RATIOS) as AspectRatioType[]);  // Tüm seçenekler
  }, [forSpot]);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const screenDimensions = Dimensions.get('window');
  const cropAreaPadding = 30;

  const currentImageUri = allImages[currentIndex];
  const isLastImage = currentIndex === allImages.length - 1;
  const isFirstImage = currentIndex === 0;

  const getCropDimensions = () => {
    const ratio = ASPECT_RATIOS[aspectRatio].ratio;
    const maxWidth = screenDimensions.width - cropAreaPadding * 2;
    const maxHeight = screenDimensions.height * 0.6;
    
    let width = maxWidth;
    let height = width / ratio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    
    return { width, height };
  };

  const cropDimensions = getCropDimensions();

  const calculateMinZoom = (imgWidth: number, imgHeight: number, cropWidth: number, cropHeight: number) => {
    'worklet';
    if (!imgWidth || !imgHeight) return 1;
    
    const scaleX = cropWidth / imgWidth;
    const scaleY = cropHeight / imgHeight;
    
    return Math.max(scaleX, scaleY);
  };

  const resetPosition = useCallback(() => {
    'worklet';
    const minZoom = calculateMinZoom(imageSize.width, imageSize.height, cropDimensions.width, cropDimensions.height);
    scale.value = minZoom;
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = minZoom;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [imageSize.width, imageSize.height, cropDimensions.width, cropDimensions.height, scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY]);

  useEffect(() => {
    if (visible && currentImageUri) {
      // Validate URI before trying to get size - now supports data URI
      if (currentImageUri.startsWith('file://') || currentImageUri.startsWith('http') || currentImageUri.startsWith('data:image')) {
        Image.getSize(
          currentImageUri,
          (width, height) => {
            setImageSize({ width, height });
            resetPosition();
          },
          () => {
            // Silently handle error, set default size
            setImageSize({ width: screenDimensions.width, height: screenDimensions.width });
            resetPosition();
          }
        );
      } else {
        // Invalid URI, set default size
        setImageSize({ width: screenDimensions.width, height: screenDimensions.width });
        resetPosition();
      }
    }
  }, [visible, currentImageUri, currentIndex, resetPosition, screenDimensions.width]);

  useEffect(() => {
    resetPosition();
  }, [aspectRatio, imageSize, resetPosition]);

  // Initialize crop settings for all images
  useEffect(() => {
    if (visible && allImages.length > 0) {
      const initialSettings = allImages.map(() => ({
        scale: 1,
        translateX: 0,
        translateY: 0,
        aspectRatio: defaultAspectRatio
      }));
      setCropSettings(initialSettings);
      setCroppedImages(new Array(allImages.length).fill(''));
    }
  }, [visible, allImages, defaultAspectRatio]);

  const saveCropSettings = () => {
    const newSettings = [...cropSettings];
    newSettings[currentIndex] = {
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      aspectRatio
    };
    setCropSettings(newSettings);
  };

  const loadCropSettings = (index: number) => {
    if (cropSettings[index]) {
      const settings = cropSettings[index];
      scale.value = settings.scale;
      translateX.value = settings.translateX;
      translateY.value = settings.translateY;
      setAspectRatio(settings.aspectRatio);
    } else {
      resetPosition();
    }
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      'worklet';
      const minZoom = calculateMinZoom(imageSize.width, imageSize.height, cropDimensions.width, cropDimensions.height);
      scale.value = Math.max(minZoom, Math.min(3, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(saveCropSettings)();
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      
      const scaledWidth = imageSize.width * scale.value;
      const scaledHeight = imageSize.height * scale.value;
      
      const maxX = Math.max(0, (scaledWidth - cropDimensions.width) / 2);
      const maxY = Math.max(0, (scaledHeight - cropDimensions.height) / 2);
      
      translateX.value = clamp(
        savedTranslateX.value + event.translationX,
        -maxX,
        maxX
      );
      translateY.value = clamp(
        savedTranslateY.value + event.translationY,
        -maxY,
        maxY
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(saveCropSettings)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      const minZoom = calculateMinZoom(imageSize.width, imageSize.height, cropDimensions.width, cropDimensions.height);
      
      if (scale.value > minZoom * 1.5) {
        scale.value = minZoom;
      } else {
        scale.value = minZoom * 2;
      }
      translateX.value = 0;
      translateY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleAspectRatioChange = (newRatio: AspectRatioType) => {
    setAspectRatio(newRatio);
    saveCropSettings();
  };

  const captureCurrentCrop = async () => {
    if (!viewShotRef.current || !imageSize.width || !imageSize.height) {
      // Return original image as fallback
      return allImages[currentIndex];
    }

    try {
      const uri = await viewShotRef.current.capture?.();
      // Validate captured URI - now supports data URI format
      if (uri && (uri.startsWith('data:image') || uri.startsWith('file://') || uri.startsWith('http'))) {
        return uri;
      }
      // Return original if invalid URI
      return allImages[currentIndex];
    } catch (error) {
      // Return original on error
      return allImages[currentIndex];
    }
  };

  const handleNext = async () => {
    setIsProcessing(true);
    
    // Capture current crop
    const croppedUri = await captureCurrentCrop();
    
    // Update arrays with current crop
    let updatedCroppedImages = [...croppedImages];
    let updatedAspectRatios = [...croppedAspectRatios];
    
    // Always save the image (either cropped or original)
    updatedCroppedImages[currentIndex] = croppedUri || allImages[currentIndex];
    updatedAspectRatios[currentIndex] = aspectRatio;
    
    setCroppedImages(updatedCroppedImages);
    setCroppedAspectRatios(updatedAspectRatios);

    if (isLastImage) {
      // All done, return all cropped images with aspect ratios
      // Use the updated arrays that include the last image
      const finalImages = updatedCroppedImages.filter(uri => uri && uri !== '');
      const finalAspectRatios = updatedAspectRatios.filter((_, index) => 
        updatedCroppedImages[index] && updatedCroppedImages[index] !== ''
      );
      
      if (isBatchMode && onCropAll) {
        onCropAll(finalImages, finalAspectRatios);
      } else if (!isBatchMode && onCrop && croppedUri) {
        onCrop(croppedUri, aspectRatio);
      }
      onClose();
    } else {
      // Move to next image
      saveCropSettings();
      setCurrentIndex(currentIndex + 1);
      loadCropSettings(currentIndex + 1);
    }
    
    setIsProcessing(false);
  };

  const handlePrevious = async () => {
    if (!isFirstImage) {
      // Save current crop before moving to previous
      const croppedUri = await captureCurrentCrop();
      // Always save (either cropped or original)
      const newCroppedImages = [...croppedImages];
      newCroppedImages[currentIndex] = croppedUri || allImages[currentIndex];
      setCroppedImages(newCroppedImages);
      
      const newAspectRatios = [...croppedAspectRatios];
      newAspectRatios[currentIndex] = aspectRatio;
      setCroppedAspectRatios(newAspectRatios);
      
      saveCropSettings();
      setCurrentIndex(currentIndex - 1);
      loadCropSettings(currentIndex - 1);
    }
  };

  const handleApplyToAll = async () => {
    setIsProcessing(true);
    
    // Mevcut crop ayarlarını tüm fotoğraflara uygula
    const currentSetting = {
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      aspectRatio
    };
    
    const newSettings = allImages.map(() => ({ ...currentSetting }));
    setCropSettings(newSettings);
    
    // Tüm fotoğrafları mevcut ayarlarla crop et
    const allCroppedImages: string[] = [];
    const allAspectRatios: AspectRatioType[] = [];
    
    for (let i = 0; i < allImages.length; i++) {
      // Geçici olarak mevcut index'i değiştir
      setCurrentIndex(i);
      
      // Biraz bekle ki görüntü yüklensin
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Crop işlemini yap
      const croppedUri = await captureCurrentCrop();
      if (croppedUri) {
        allCroppedImages.push(croppedUri);
        allAspectRatios.push(aspectRatio);
      } else {
        // If capture fails, use original image
        allCroppedImages.push(allImages[i]);
        allAspectRatios.push(aspectRatio);
      }
    }
    
    // Callback'i çağır ve modal'ı kapat
    if (onCropAll && allCroppedImages.length > 0) {
      onCropAll(allCroppedImages, allAspectRatios);
    }
    
    setIsProcessing(false);
    onClose();
  };

  const handleCrop = async () => {
    if (isBatchMode) {
      await handleNext();
    } else {
      setIsProcessing(true);
      const croppedUri = await captureCurrentCrop();
      if (croppedUri && onCrop) {
        onCrop(croppedUri, aspectRatio);
        onClose();
      }
      setIsProcessing(false);
    }
  };

  if (!visible || allImages.length === 0) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={false}
      animationType="fade"
      presentationStyle="fullScreen"
    >
      <GestureHandlerRootView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Left Button - Cancel or Previous */}
          <TouchableOpacity 
            onPress={isBatchMode && !isFirstImage ? handlePrevious : onClose} 
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>
              {isBatchMode && !isFirstImage ? t('common.previous') : t('common.cancel')}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('common.cropPhoto')}</Text>
            {isBatchMode && (
              <Text style={styles.progressText}>
                {currentIndex + 1} / {allImages.length}
              </Text>
            )}
          </View>
          
          {/* Right Button - Next or Done */}
          <TouchableOpacity 
            onPress={handleCrop} 
            style={styles.headerButton}
            disabled={isProcessing}
          >
            <Text style={[styles.headerButtonText, styles.doneButton]}>
              {isBatchMode && !isLastImage ? t('common.next') : t('common.done')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Crop Area */}
        <View style={styles.cropContainer}>
          <ViewShot
            ref={viewShotRef}
            style={[
              styles.cropArea,
              {
                width: cropDimensions.width,
                height: cropDimensions.height,
              },
            ]}
            options={{ format: 'jpg', quality: 1.0, result: 'data-uri' }}
          >
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture)}>
              <View style={[styles.imageContainer, { width: cropDimensions.width, height: cropDimensions.height }]}>
                <Animated.Image
                  source={{ uri: currentImageUri }}
                  style={[
                    {
                      width: imageSize.width,
                      height: imageSize.height,
                    },
                    animatedStyle
                  ]}
                  resizeMode="contain"
                />
              </View>
            </GestureDetector>
          </ViewShot>
          
          {/* Grid Overlay */}
          <View 
            style={[
              styles.gridOverlay, 
              { 
                width: cropDimensions.width, 
                height: cropDimensions.height 
              }
            ]} 
            pointerEvents="none"
          >
            <View style={[styles.gridLine, styles.gridLineHorizontal, styles.gridLineHorizontalTop]} />
            <View style={[styles.gridLine, styles.gridLineHorizontal, styles.gridLineHorizontalBottom]} />
            <View style={[styles.gridLine, styles.gridLineVertical, styles.gridLineVerticalLeft]} />
            <View style={[styles.gridLine, styles.gridLineVertical, styles.gridLineVerticalRight]} />
            
            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Bottom Bar - Aspect Ratio Selector */}
        <View style={styles.bottomBar}>
          <View style={styles.ratioButtonsContainer}>
            {availableRatios.map((ratio) => (
              <TouchableOpacity
                key={ratio}
                style={[
                  styles.ratioButton,
                  aspectRatio === ratio && styles.ratioButtonActive
                ]}
                onPress={() => handleAspectRatioChange(ratio)}
              >
                <Icon 
                  name={ASPECT_RATIOS[ratio].icon} 
                  size={24} 
                  color={aspectRatio === ratio ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.ratioLabel,
                  aspectRatio === ratio && styles.ratioLabelActive
                ]}>
                  {ASPECT_RATIOS[ratio].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Apply to All Button */}
          {isBatchMode && allImages.length > 1 && (
            <TouchableOpacity 
              style={[styles.applyToAllButton, isProcessing && styles.applyToAllButtonDisabled]}
              onPress={handleApplyToAll}
              disabled={isProcessing}
            >
              <Icon name="copy" size={18} color={isProcessing ? theme.colors.textSecondary : theme.colors.primary} />
              <Text style={[styles.applyToAllText, isProcessing && styles.applyToAllTextDisabled]}>
                {isProcessing ? t('common.processing') : t('crop.applyToAll')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: insets.top + theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerButtonText: {
    fontSize: theme.typography.base,
    color: '#fff',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    fontWeight: '600',
    color: '#fff',
  },
  progressText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  doneButton: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cropContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropArea: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 0.5,
  },
  gridLineVertical: {
    width: 0.5,
    height: '100%',
  },
  gridLineHorizontalTop: {
    top: '33.33%',
  },
  gridLineHorizontalBottom: {
    top: '66.66%',
  },
  gridLineVerticalLeft: {
    left: '33.33%',
  },
  gridLineVerticalRight: {
    left: '66.66%',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTopRight: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  bottomBar: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: insets.bottom + theme.spacing.lg,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratioButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  ratioButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratioLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  ratioLabelActive: {
    color: theme.colors.primary,
  },
  applyToAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  applyToAllText: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  applyToAllButtonDisabled: {
    opacity: 0.5,
  },
  applyToAllTextDisabled: {
    color: theme.colors.textSecondary,
  },
});

export default PhotoCropModal;