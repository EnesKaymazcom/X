import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface CommunityQuestionCardProps {
  question: string;
  value: boolean | null;
  onValueChange: (value: boolean | null) => void;
  icon: string;
}

export const CommunityQuestionCard: React.FC<CommunityQuestionCardProps> = ({
  question,
  value,
  onValueChange,
  icon
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Icon name={icon} size={20} color={theme.colors.primary} />
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            value === true && styles.buttonActive
          ]}
          onPress={() => onValueChange(value === true ? null : true)}
        >
          <Icon 
            name="check" 
            size={18} 
            color={value === true ? '#FFFFFF' : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            value === false && styles.buttonActive
          ]}
          onPress={() => onValueChange(value === false ? null : false)}
        >
          <Icon 
            name="x" 
            size={18} 
            color={value === false ? '#FFFFFF' : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm
  },
  questionText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  buttonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  }
});

export default CommunityQuestionCard;