import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  TextInputProps, 
  Platform 
} from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  characterLimit?: number;
  containerStyle?: any;
  inputStyle?: any;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines,
  characterLimit,
  containerStyle,
  inputStyle,
  disabled = false,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const inputHeight = multiline && numberOfLines ? numberOfLines * 24 + 32 : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          {leftIcon && (
            <Icon name={leftIcon} size={18} color={theme.colors.primary} />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            { height: inputHeight },
            error && styles.inputError,
            disabled && styles.inputDisabled,
            rightIcon && styles.inputWithRightIcon,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={!disabled}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Icon name={rightIcon} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {multiline && characterLimit && (
          <View style={styles.characterCountContainer}>
            <Text style={styles.characterCount}>
              {value.length}/{characterLimit}
            </Text>
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'android' ? theme.spacing.sm : theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: Platform.OS === 'android' ? 44 : 48, // Consistent height across platforms
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  multilineInput: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    minHeight: undefined, // Remove minHeight for multiline
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.border,
  },
  rightIconContainer: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  characterCountContainer: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    right: theme.spacing.sm,
  },
  characterCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.typography.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default InputField;