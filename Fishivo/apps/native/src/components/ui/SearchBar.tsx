import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps, Platform } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  containerStyle?: any;
  inputStyle?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
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
        <Icon name="search" size={18} color={theme.colors.textSecondary} />
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
    paddingBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'android' ? 2 : theme.spacing.sm,
    gap: theme.spacing.sm,
    minHeight: Platform.OS === 'android' ? 36 : undefined, // Android'de minHeight kullan
  },
  input: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    paddingTop: Platform.OS === 'android' ? 4 : 0, // Android için üst padding
    paddingBottom: Platform.OS === 'android' ? 4 : 0, // Android için alt padding
    paddingHorizontal: 0,
    margin: 0,
    textAlignVertical: 'center', // Android'de dikey ortalama
    includeFontPadding: false, // Android'de font padding'i kaldır
    lineHeight: Platform.OS === 'android' ? 20 : undefined, // Android için lineHeight
  },
});

export default SearchBar;