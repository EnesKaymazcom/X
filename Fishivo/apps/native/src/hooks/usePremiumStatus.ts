import { useMemo, useState, useEffect } from 'react';
import { useSupabaseUser } from './useSupabaseUser';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: Date | null;
  premiumFeatures: Record<string, boolean>;
  isLoading: boolean;
}

export const usePremiumStatus = (): PremiumStatus => {
  const { user, isLoading: authLoading } = useSupabaseUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Fetch user profile data from users table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      setIsLoadingProfile(true);
      try {
        const supabase = getNativeSupabaseClient();
        const { data, error } = await supabase
          .from('users')
          .select('is_pro, premium_until')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUserProfile(data);
        }
      } catch (err) {
        // Silent fail
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [user?.id]);
  
  const premiumStatus = useMemo(() => {
    if (!user || !userProfile) {
      return {
        isPremium: false,
        premiumUntil: null,
        premiumFeatures: {},
      };
    }
    
    // Get premium status from users table
    const isPro = userProfile.is_pro === true;
    const premiumUntilStr = userProfile.premium_until;
    
    // Parse premium expiry date
    let premiumUntil: Date | null = null;
    let isPremium = isPro;
    
    if (premiumUntilStr) {
      premiumUntil = new Date(premiumUntilStr);
      // Check if premium is still valid
      if (premiumUntil > new Date()) {
        isPremium = true;
      } else {
        // Premium expired
        isPremium = false;
        premiumUntil = null;
      }
    }
    
    // Premium features for pro users
    const premiumFeatures: Record<string, boolean> = {};
    
    // Add 3D maps feature for premium users
    if (isPremium) {
      premiumFeatures.maps_3d = true;
      premiumFeatures.mapbox_terrain = true;
      premiumFeatures.mapbox_satellite_3d = true;
    }
    
    return {
      isPremium,
      premiumUntil,
      premiumFeatures,
    };
  }, [user, userProfile]);
  
  return {
    ...premiumStatus,
    isLoading: authLoading || isLoadingProfile,
  };
};

export default usePremiumStatus;