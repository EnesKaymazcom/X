import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IconButton from './IconButton';
import { theme } from '@fishivo/shared';

interface HeaderButton {
  icon: string;
  onPress: () => void;
}

interface AppHeaderProps {
  title: string;
  leftButtons?: HeaderButton[];
  rightButtons?: HeaderButton[];
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  canGoBack?: boolean;
  onBackPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  leftButtons = [], 
  rightButtons = [],
  leftComponent,
  rightComponent,
  canGoBack,
  onBackPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {canGoBack && !leftButtons.length && !leftComponent && (
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
        <Text style={styles.pageTitle}>{title}</Text>
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
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.screen.paddingHorizontal,
    paddingVertical: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pageTitle: {
    fontSize: theme.typography.fontSizes['2xl'],
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.bold,
  },
});

export default AppHeader;