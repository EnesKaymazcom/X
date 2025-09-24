import { useState, useRef, useCallback } from 'react';
import { ScrollView, Animated } from 'react-native';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
}

export interface UseStickyTabsConfig {
  tabs: TabConfig[];
  initialTab?: string;
  stickyPoint?: number;
  animationDuration?: number;
}

export interface UseStickyTabsReturn {
  // Scroll refs and handlers
  scrollViewRef: React.RefObject<ScrollView | null>;
  handleScroll: (event: any) => void;
  
  // State
  isTabSticky: boolean;
  activeTab: string;
  scrollY: number;
  
  // Tab management
  setActiveTab: (tabId: string) => void;
  
  // Animation values
  tabTransition: Animated.Value;
  
  // Utils
  scrollToTop: () => void;
}

export const useStickyTabs = ({
  tabs,
  initialTab,
  stickyPoint = 350,
  animationDuration = 300
}: UseStickyTabsConfig): UseStickyTabsReturn => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [isTabSticky, setIsTabSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTabState] = useState(initialTab || tabs[0]?.id || '');
  
  // Animation values
  const tabTransition = useRef(new Animated.Value(1)).current;
  
  // Handle scroll events for sticky behavior
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);
    
    const shouldBeSticky = currentScrollY >= stickyPoint;
    
    if (shouldBeSticky !== isTabSticky) {
      setIsTabSticky(shouldBeSticky);
    }
  }, [isTabSticky, stickyPoint]);
  
  // Handle tab changes with animation
  const setActiveTab = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    
    // Start fade out animation
    Animated.timing(tabTransition, {
      toValue: 0,
      duration: animationDuration / 2,
      useNativeDriver: true,
    }).start(() => {
      // Change tab in the middle of animation
      setActiveTabState(tabId);
      
      // Fade back in
      Animated.timing(tabTransition, {
        toValue: 1,
        duration: animationDuration / 2,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab, animationDuration, tabTransition]);
  
  // Utility to scroll to top
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);
  
  return {
    // Scroll refs and handlers
    scrollViewRef,
    handleScroll,
    
    // State
    isTabSticky,
    activeTab,
    scrollY,
    
    // Tab management
    setActiveTab,
    
    // Animation values
    tabTransition,
    
    // Utils
    scrollToTop,
  };
};