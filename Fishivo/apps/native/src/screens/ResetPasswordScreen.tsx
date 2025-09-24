import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { FishivoSvgLogo } from '@/components/ui/FishivoSvgLogo';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { useTheme } from '@/contexts/ThemeContext';
import EyeIcon from '@/components/ui/EyeIcon';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { useTranslation } from '@/contexts/LanguageContext';

const DARK_COLORS = {
  background: '#0A0A0A',
  surface: '#171717',
  border: '#262626',
  text: '#FAFAFA',
  textSecondary: '#A3A3A3',
  primary: '#3B82F6',
};

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  const styles = createStyles(theme);

  const showError = (message: string) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const showSuccess = (message: string) => {
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  const validatePasswords = () => {
    if (!password || !confirmPassword) {
      showError(t('auth.resetPassword.errors.allFieldsRequired'));
      return false;
    }
    
    if (password.length < 8) {
      showError(t('auth.resetPassword.errors.passwordTooShort'));
      return false;
    }
    
    if (password !== confirmPassword) {
      showError(t('auth.resetPassword.errors.passwordsDontMatch'));
      return false;
    }
    
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    
    setLoading(true);
    try {
      const supabase = getNativeSupabaseClient();
      
      // Deep link'ten gelen access_token ile oturum oluştur
      const accessToken = (route.params as any)?.access_token;
      const refreshToken = (route.params as any)?.refresh_token;
      
      if (!accessToken) {
        showError(t('auth.resetPassword.errors.invalidSession'));
        navigation.dispatch(
          CommonActions.reset({ 
            index: 0, 
            routes: [{ name: 'Auth' }] 
          })
        );
        return;
      }

      // Önce oturumu ayarla
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        showError(t('auth.resetPassword.errors.invalidSession'));
        navigation.dispatch(
          CommonActions.reset({ 
            index: 0, 
            routes: [{ name: 'Auth' }] 
          })
        );
        return;
      }

      // Şifreyi güncelle
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        showError(t('auth.resetPassword.errors.updateFailed'));
      } else {
        showSuccess(t('auth.resetPassword.success'));
      }
    } catch (error) {
      showError(t('auth.resetPassword.errors.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.headerSection}>
              <FishivoSvgLogo size="xl" color="#FAFAFA" />
              <Text style={styles.title}>{t('common.appName')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.resetPassword.title')}
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{t('auth.resetPassword.newPassword')}</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                    placeholderTextColor={DARK_COLORS.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <EyeIcon size={20} isOpen={showPassword} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{t('auth.resetPassword.confirmPassword')}</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    placeholderTextColor={DARK_COLORS.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <EyeIcon size={20} isOpen={showConfirmPassword} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t('auth.resetPassword.updatePassword')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.dispatch(
                  CommonActions.reset({ 
                    index: 0, 
                    routes: [{ name: 'Auth' }] 
                  })
                )}
                disabled={loading}
              >
                <Text style={styles.linkButtonText}>
                  {t('auth.resetPassword.backToLogin')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('auth.common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />

      {/* Success Modal */}
      <FishivoModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('MainTabs' as never);
        }}
        preset="success"
        title={t('auth.common.success')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => {
            setShowSuccessModal(false);
            navigation.navigate('MainTabs' as never);
          }
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: DARK_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: DARK_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.surface,
    height: 44,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: DARK_COLORS.text,
  },
  eyeButton: {
    height: 44,
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: DARK_COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    height: 44,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: DARK_COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ResetPasswordScreen;