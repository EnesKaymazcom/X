import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  scrollable?: boolean;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  activeTab,
  onTabPress,
  scrollable = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, scrollable);

  const TabContent = () => (
    <>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          {tab.icon && (
            <Icon 
              name={tab.icon}
              size={18} 
              color={activeTab === tab.id ? theme.colors.primary : theme.colors.textSecondary} 
            />
          )}
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );

  return (
    <View style={styles.tabContainer}>
      {scrollable ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TabContent />
        </ScrollView>
      ) : (
        <View style={styles.tabsWrapper}>
          <TabContent />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, scrollable: boolean) => StyleSheet.create({
  tabContainer: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: theme.spacing.xs / 2,
  },
  scrollContent: {
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs,
  },
  tab: {
    flex: scrollable ? 0 : 1, // Scrollable ise flex: 0, değilse flex: 1
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: scrollable ? 80 : undefined, // Scrollable ise min genişlik
  },
  activeTab: {
    backgroundColor: theme.colors.background,
  },
  tabText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
});

export default TabSelector; 