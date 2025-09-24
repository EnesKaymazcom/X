import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Platform, Linking } from 'react-native';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { FishivoModal } from '@/components/ui/FishivoModal';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Supabase OAuth - Resmi yöntem
      const redirectTo = Platform.OS === 'web' 
        ? `${(global as any).window?.location?.origin || 'http://localhost:3000'}/auth/callback` 
        : 'fishivo://google-auth';
        
      const supabase = getNativeSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Her platform için true
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        onError?.(error);
        setLoading(false);
        return;
      }

      if (!data.url) {
        setModalMessage(t('auth.signIn.errors.signInFailed'));
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // System browser ile aç (Supabase resmi yöntemi)
      const supported = await Linking.canOpenURL(data.url);
      if (supported) {
        await Linking.openURL(data.url);
      } else {
        setModalMessage(t('common.errors.browserError'));
        setShowErrorModal(true);
      }
      
      // Deep link listener App.tsx'te handle edilecek
    } catch (error) {
      console.error('Google OAuth error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={signInWithGoogle}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.text}>🔐 Google ile Giriş Yap</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />
    </>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default GoogleSignInButton;
