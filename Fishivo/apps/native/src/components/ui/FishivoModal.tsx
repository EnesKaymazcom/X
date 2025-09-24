import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';

interface ModalButton {
  text: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  
  // İçerik
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  
  // Butonlar
  buttons?: ModalButton[];
  buttonLayout?: 'horizontal' | 'vertical';
  
  // Hazır Tipler
  preset?: 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'delete' | 'report' | 'selector' | 'review' | 'loading';
  
  // Hızlı Butonlar
  primaryButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  };
  
  // Görünüm
  showCloseButton?: boolean;
  showDragIndicator?: boolean;
  backdropCloseable?: boolean;
  
  // Özel İçerik
  children?: React.ReactNode;
  
  // İçerik Hizalama
  contentAlign?: 'center' | 'left';
  
  // Radio Options
  renderRadioOptions?: {
    options: Array<{
      key: string;
      label: string;
      icon?: string;
      iconColor?: string;
    }>;
    selectedKey: string | null;
    onSelect: (key: string) => void;
  };
}

type PresetColorKey = 'success' | 'error' | 'warning' | 'primary';

interface PresetConfig {
  icon: string;
  iconColorKey: PresetColorKey;
  iconSize: number;
  buttonLayout: 'horizontal' | 'vertical';
  showCloseButton?: boolean;
  contentAlign?: 'center' | 'left';
  titleAlign?: 'center' | 'left';
}

const presetConfigs: Record<'success' | 'error' | 'warning' | 'info' | 'confirm' | 'delete' | 'report' | 'selector' | 'review' | 'loading', PresetConfig> = {
  success: {
    icon: 'check-circle',
    iconColorKey: 'success',
    iconSize: 35,
    buttonLayout: 'horizontal',
    showCloseButton: false,
    titleAlign: 'center'
  },
  error: {
    icon: 'alert-circle',
    iconColorKey: 'error',
    iconSize: 35,
    buttonLayout: 'horizontal',
    showCloseButton: false,
    titleAlign: 'center'
  },
  warning: {
    icon: 'alert-triangle',
    iconColorKey: 'warning',
    iconSize: 16,
    buttonLayout: 'horizontal'
  },
  info: {
    icon: '',
    iconColorKey: 'primary',
    iconSize: 0,
    buttonLayout: 'horizontal'
  },
  confirm: {
    icon: '',
    iconColorKey: 'primary',
    iconSize: 0,
    buttonLayout: 'vertical'
  },
  delete: {
    icon: '',
    iconColorKey: 'error',
    iconSize: 0,
    buttonLayout: 'vertical'
  },
  report: {
    icon: '',
    iconColorKey: 'warning',
    iconSize: 0,
    buttonLayout: 'horizontal',
    contentAlign: 'left'
  },
  selector: {
    icon: '',
    iconColorKey: 'primary',
    iconSize: 0,
    buttonLayout: 'horizontal',
    showCloseButton: true
  },
  review: {
    icon: '',
    iconColorKey: 'primary',
    iconSize: 0,
    buttonLayout: 'horizontal',
    showCloseButton: true,
    contentAlign: 'left'
  },
  loading: {
    icon: 'clock',
    iconColorKey: 'primary',
    iconSize: 35,
    buttonLayout: 'horizontal',
    showCloseButton: false
  }
};

const getPresetIconColor = (theme: Theme, colorKey: PresetColorKey): string => {
  switch (colorKey) {
    case 'success': return theme.colors.success;
    case 'error': return theme.colors.error;
    case 'warning': return theme.colors.warning;
    case 'primary': return theme.colors.primary;
    default: return theme.colors.primary;
  }
};

// Preset tiplerine göre default button metinleri
const getDefaultButtonTexts = (preset: string, t: (key: string) => string) => {
  const defaults: Record<string, { primary?: string; secondary?: string }> = {
    'confirm': { 
      primary: t('common.yes'), 
      secondary: t('common.cancel') 
    },
    'delete': { 
      primary: t('common.delete'), 
      secondary: t('common.cancel') 
    },
    'error': { 
      primary: t('common.ok') 
    },
    'success': { 
      primary: t('common.ok') 
    },
    'warning': { 
      primary: t('common.ok'), 
      secondary: t('common.cancel') 
    },
    'info': { 
      primary: t('common.ok') 
    },
    'report': { 
      primary: t('common.report'), 
      secondary: t('common.cancel') 
    },
    'selector': { 
      primary: t('common.ok'), 
      secondary: t('common.cancel') 
    }
  };
  return defaults[preset] || { primary: t('common.ok'), secondary: t('common.cancel') };
};

export const FishivoModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  description,
  icon,
  iconColor,
  iconSize,
  buttons,
  buttonLayout = 'horizontal',
  preset,
  primaryButton,
  secondaryButton,
  showCloseButton = true,
  showDragIndicator = true,
  backdropCloseable = true,
  children,
  renderRadioOptions
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  // Preset configs
  const presetConfig = preset ? presetConfigs[preset] : null;
  const finalIcon = icon || presetConfig?.icon;
  const finalIconColor = iconColor || (presetConfig?.iconColorKey ? getPresetIconColor(theme, presetConfig.iconColorKey) : undefined);
  const finalIconSize = iconSize || presetConfig?.iconSize || 48;
  const finalShowCloseButton = presetConfig?.showCloseButton !== undefined ? presetConfig.showCloseButton : showCloseButton;
  const finalTitleAlign = presetConfig?.titleAlign || 'left';

  // Generate buttons with automatic i18n fallbacks
  let finalButtons = buttons;
  if (!finalButtons && (primaryButton || secondaryButton)) {
    const defaultTexts = preset ? getDefaultButtonTexts(preset, t) : { primary: t('common.ok'), secondary: t('common.cancel') };
    
    finalButtons = [];
    if (secondaryButton) {
      finalButtons.push({
        text: secondaryButton.text || defaultTexts.secondary || t('common.cancel'),
        variant: secondaryButton.variant || 'secondary',
        onPress: secondaryButton.onPress
      });
    }
    if (primaryButton) {
      const defaultVariant = preset === 'error' || preset === 'delete' ? 'destructive' : 'primary';
      finalButtons.push({
        text: primaryButton.text || defaultTexts.primary || t('common.ok'),
        variant: primaryButton.variant || defaultVariant,
        onPress: primaryButton.onPress,
        disabled: primaryButton.disabled
      });
    }
  }

  // Smart layout selection based on text length
  const hasLongTexts = finalButtons?.some(btn => btn.text.length > 12);
  const baseButtonLayout = buttonLayout || presetConfig?.buttonLayout || 'horizontal';
  // If buttonLayout is explicitly set, always use it. Otherwise use smart detection
  const finalButtonLayout = buttonLayout ? buttonLayout : (hasLongTexts ? 'vertical' : baseButtonLayout);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible, slideAnim]);


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={backdropCloseable ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={backdropCloseable ? onClose : undefined}
        />
        <Animated.View style={[
          styles.container,
          { 
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          {showDragIndicator && <View style={styles.dragIndicator} />}
          
          {title && !children && (
            <View style={[styles.header, finalTitleAlign === 'center' && styles.headerCenter]}>
              <Text style={[styles.title, { textAlign: finalTitleAlign }]}>{title}</Text>
              {finalShowCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {title && children && (
            <View style={[styles.headerWithChildren, finalTitleAlign === 'center' && styles.headerCenter]}>
              <Text style={[styles.title, { textAlign: finalTitleAlign }]}>{title}</Text>
              {finalShowCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <View style={styles.content}>
            {finalIcon && !children && (
              <View style={styles.iconContainer}>
                <Icon 
                  name={finalIcon} 
                  size={finalIconSize} 
                  color={finalIconColor || theme.colors.primary} 
                />
              </View>
            )}
            
            {description && !children && (
              <Text style={[
                styles.description,
                (preset !== 'success' && preset !== 'error') && { textAlign: 'left' }
              ]}>
                {description}
              </Text>
            )}
            
            {/* Radio Options */}
            {renderRadioOptions && !children && (
              <View style={styles.radioContainer} pointerEvents="box-none">
                {renderRadioOptions.options.map((option) => {
                  const isSelected = renderRadioOptions.selectedKey === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.radioOption,
                        isSelected && styles.radioOptionSelected
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        renderRadioOptions.onSelect(option.key);
                      }}
                    >
                      <View style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected
                      ]}>
                        {isSelected && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      {option.icon && (
                        <Icon 
                          name={option.icon} 
                          size={20} 
                          color={option.iconColor || (isSelected ? theme.colors.primary : theme.colors.text)}
                          style={styles.radioIcon}
                        />
                      )}
                      <Text style={[
                        styles.radioLabel,
                        isSelected && styles.radioLabelSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            
            {children && (
              <View style={styles.childrenContainer}>
                {children}
              </View>
            )}
          </View>
          
          {finalButtons && finalButtons.length > 0 && (
            <View style={[
              styles.buttonContainer,
              finalButtonLayout === 'vertical' ? styles.buttonContainerVertical : styles.buttonContainerHorizontal,
              (preset === 'success' || preset === 'error') && finalButtons?.length === 1 && styles.buttonContainerCenter
            ]}>
              {finalButtons.map((button, index) => {
                const isSingleSuccessOrError = (preset === 'success' || preset === 'error') && (finalButtons?.length ?? 0) === 1;
                return (
                  <View 
                    key={`modal-button-${index}-${button.text}`}
                    style={isSingleSuccessOrError ? styles.singleButtonWrapper : (finalButtonLayout === 'vertical' ? styles.buttonVertical : styles.buttonHorizontal)}
                  >
                    <Button
                      variant={button.variant}
                      onPress={button.onPress}
                      disabled={button.disabled}
                      icon={button.icon}
                      fullWidth={!isSingleSuccessOrError}
                    >
                      {button.text}
                    </Button>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme, bottomInset: number) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: bottomInset > 0 ? bottomInset : theme.spacing.md,
    maxHeight: '80%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.layout.screenHorizontalPadding,
    position: 'relative',
  },
  headerCenter: {
    justifyContent: 'center',
  },
  headerWithChildren: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.layout.screenHorizontalPadding,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    width: '100%',
    paddingHorizontal: theme.layout.screenHorizontalPadding,
  },
  childrenContainer: {
    width: '100%',
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
    alignSelf: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.base * 1.5,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.layout.screenHorizontalPadding,
    paddingBottom: theme.spacing.xs,
  },
  buttonContainerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  buttonHorizontal: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  buttonVertical: {
    width: '100%',
  },
  buttonContainerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButtonWrapper: {
    minWidth: 120,
    paddingHorizontal: theme.spacing.md,
  },
  
  // Radio Options Styles
  radioContainer: {
    marginVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioIcon: {
    marginRight: theme.spacing.md,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    flex: 1,
    fontWeight: theme.typography.semibold,
  },
  radioLabelSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
});