import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabSelector from '@/components/ui/TabSelector';
import { AnimatedTabContent } from '@/components/ui/AnimatedTabContent';
import { useStickyTabs, TabConfig, UseStickyTabsConfig } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface StickyTabLayoutProps extends Omit<UseStickyTabsConfig, 'tabs'> {
  // Header content (balık görseli, vs.)
  headerContent: React.ReactNode;
  
  // Tab configuration
  tabs: TabConfig[];
  
  // Tab content renderer
  renderTabContent: (activeTab: string) => React.ReactNode;
  
  // Optional styles
  contentContainerStyle?: any;
  headerStyle?: any;
  
  // Optional scroll event handler (ek işlemler için)
  onScroll?: (event: any) => void;
  
  // Sticky özelliğini kontrol et
  enableSticky?: boolean;
}

const StickyTabLayout: React.FC<StickyTabLayoutProps> = ({
  headerContent,
  tabs,
  renderTabContent,
  contentContainerStyle,
  headerStyle,
  onScroll,
  enableSticky = true,
  ...stickyTabsConfig
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark);
  
  const {
    scrollViewRef,
    handleScroll,
    isTabSticky,
    activeTab,
    setActiveTab,
    tabTransition,
  } = useStickyTabs({
    tabs,
    ...stickyTabsConfig,
  });
  
  // Combined scroll handler
  const onScrollCombined = (event: any) => {
    handleScroll(event);
    onScroll?.(event);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={onScrollCombined}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Content */}
        <View style={[styles.headerContainer, headerStyle]}>
          {headerContent}
        </View>
        
        {/* Tab Selector - Normal position */}
        {(!isTabSticky || !enableSticky) && (
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            scrollable={tabs.length > 3}
          />
        )}
        
        {/* Animated Tab Content */}
        <AnimatedTabContent
          animationValue={tabTransition}
          style={(isTabSticky && enableSticky) ? styles.contentWithStickyTab : styles.contentNormal}
        >
          {renderTabContent(activeTab)}
        </AnimatedTabContent>
      </ScrollView>
      
      {/* Sticky Tab Selector */}
      {isTabSticky && enableSticky && (
        <View style={styles.stickyTabContainer}>
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            scrollable={tabs.length > 3}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.layout.screenHorizontalPadding,
  },
  headerContainer: {
    // Header content wrapper
  },
  stickyTabContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: theme.spacing.md,
    zIndex: 10,
  },
  contentWithStickyTab: {
    paddingTop: 20, // Sticky tab height + minimal gap
  },
  contentNormal: {
    paddingTop: 0, // Boşluk yok
  },
});

export default StickyTabLayout;