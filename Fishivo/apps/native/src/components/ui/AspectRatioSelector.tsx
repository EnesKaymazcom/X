import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FishivoModal } from '@/components/ui/FishivoModal';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AspectRatioType, ASPECT_RATIOS } from '@fishivo/api/services/image';
import { Theme } from '@/theme';

interface AspectRatioSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (ratio: AspectRatioType) => void;
  selectedRatio?: AspectRatioType;
  availableRatios?: AspectRatioType[];
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  selectedRatio = 'square',
  availableRatios = ['portrait', 'square', 'landscape'],
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getRatioDescription = (ratio: AspectRatioType) => {
    const aspectRatio = ASPECT_RATIOS[ratio];
    return `${aspectRatio.width}:${aspectRatio.height}`;
  };

  return (
    <FishivoModal
      visible={visible}
      title={t('common.photo.selectAspectRatio')}
      onClose={onClose}
      showDragIndicator={true}
      showCloseButton={true}
    >
      <View style={styles.container}>
        {availableRatios.map(ratio => (
          <TouchableOpacity
            key={ratio}
            style={[
              styles.option,
              selectedRatio === ratio && styles.optionSelected
            ]}
            onPress={() => {
              onSelect(ratio);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionLabel,
                selectedRatio === ratio && styles.optionLabelSelected
              ]}>
                {t(`common.photo.${ratio}`)}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedRatio === ratio && styles.optionDescriptionSelected
              ]}>
                {getRatioDescription(ratio)}
              </Text>
            </View>
            {selectedRatio === ratio && (
              <Icon name="check" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </FishivoModal>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
  optionDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  optionDescriptionSelected: {
    color: theme.colors.primary,
  },
});

export default AspectRatioSelector;