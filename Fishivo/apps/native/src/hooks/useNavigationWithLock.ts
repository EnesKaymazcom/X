import { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

export const useNavigationWithLock = () => {
  const navigation = useNavigation();
  const isNavigatingRef = useRef(false);
  
  const goBack = useCallback(() => {
    if (isNavigatingRef.current) {
      return false;
    }
    isNavigatingRef.current = true;
    navigation.goBack();
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
    return true;
  }, [navigation]);
  
  const safeGoBack = useCallback(() => {
    return goBack();
  }, [goBack]);
  
  const navigate = useCallback((screen: string, params?: any) => {
    if (isNavigatingRef.current) {
      return false;
    }
    isNavigatingRef.current = true;
    navigation.navigate(screen as never, params);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
    return true;
  }, [navigation]);
  
  const push = useCallback((screen: string, params?: any) => {
    if (isNavigatingRef.current) {
      return false;
    }
    isNavigatingRef.current = true;
    (navigation as any).push(screen, params);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
    return true;
  }, [navigation]);
  
  const replace = useCallback((screen: string, params?: any) => {
    if (isNavigatingRef.current) {
      return false;
    }
    isNavigatingRef.current = true;
    (navigation as any).replace(screen, params);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
    return true;
  }, [navigation]);
  
  return {
    ...navigation,
    goBack,
    safeGoBack,
    navigate,
    push,
    replace,
    unsafeGoBack: navigation.goBack,
    unsafeNavigate: navigation.navigate,
  };
};

export default useNavigationWithLock;