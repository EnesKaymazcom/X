import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface SearchBoxProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  containerStyle?: any;
  inputStyle?: any;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChangeText,
  placeholder,
  onClear,
  containerStyle,
  inputStyle,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.searchBar}>
        <Icon name="search" size={18} color={theme.colors.primary} />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          {...textInputProps}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Icon name="x" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'android' ? theme.spacing.sm : theme.spacing.sm + 2,
    gap: theme.spacing.sm,
    height: Platform.OS === 'android' ? 42 : 44,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

export default SearchBox;