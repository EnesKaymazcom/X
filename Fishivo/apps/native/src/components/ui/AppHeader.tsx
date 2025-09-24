import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import IconButton from '@/components/ui/IconButton';
import SearchBar from '@/components/ui/SearchBar';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderButton {
  icon: string;
  onPress: () => void;
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  subtitleAlign?: 'left' | 'right';
  leftButtons?: HeaderButton[];
  rightButtons?: HeaderButton[];
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  searchBar?: SearchBarProps;
  rightIcon?: string;
  onRightPress?: () => void | Promise<void>;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  subtitleAlign = 'left',
  leftButtons = [], 
  rightButtons = [],
  leftComponent,
  rightComponent,
  onBackPress,
  searchBar,
  rightIcon,
  onRightPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBackPress && !leftButtons.length && !leftComponent && (
            <IconButton
              icon="arrow-left"
              onPress={onBackPress}
              size="sm"
            />
          )}
          {leftComponent || (
            <>
              {leftButtons.map((button, index) => (
                <IconButton
                  key={index}
                  icon={button.icon}
                  onPress={button.onPress}
                  size="sm"
                />
              ))}
            </>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { textAlign: subtitleAlign }]}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.headerRight}>
          {rightComponent || (
            <>
              {rightButtons.map((button, index) => (
                <IconButton
                  key={index}
                  icon={button.icon}
                  onPress={button.onPress}
                  size="sm"
                />
              ))}
              {rightIcon && onRightPress && (
                <IconButton
                  icon={rightIcon}
                  onPress={onRightPress}
                  size="sm"
                />
              )}
            </>
          )}
        </View>
      </View>
      
      {searchBar && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchBar.value}
            onChangeText={searchBar.onChangeText}
            placeholder={searchBar.placeholder}
            autoFocus={searchBar.autoFocus}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    paddingBottom: theme.spacing.md,
    height: Platform.OS === 'android' ? 40 + (StatusBar.currentHeight || 24) : 40,
    backgroundColor: theme.colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  titleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
});

export default AppHeader; 