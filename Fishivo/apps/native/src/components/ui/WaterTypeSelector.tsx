import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface WaterTypeSelectorProps {
  value: 'freshwater' | 'saltwater';
  onChange: (value: 'freshwater' | 'saltwater') => void;
  label?: string;
  disabled?: boolean;
}

const WaterTypeSelector: React.FC<WaterTypeSelectorProps> = ({
  value,
  onChange,
  label,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation('addSpot');
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.selectorContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            variant={value === 'freshwater' ? 'primary' : 'secondary'}
            onPress={() => onChange('freshwater')}
            disabled={disabled}
            fullWidth
            icon="droplets"
          >
            {t('sections.freshwater')}
          </Button>
        </View>
        
        <View style={styles.buttonWrapper}>
          <Button
            variant={value === 'saltwater' ? 'primary' : 'secondary'}
            onPress={() => onChange('saltwater')}
            disabled={disabled}
            fullWidth
            icon="waves"
          >
            {t('sections.saltwater')}
          </Button>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default WaterTypeSelector;