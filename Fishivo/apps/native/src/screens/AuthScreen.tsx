import React, { useState, useEffect } from 'react';
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
  Linking,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Icon from '@/components/ui/Icon';
import { FishivoSvgLogo } from '@/components/ui/FishivoSvgLogo';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { isUsernameValid } from '@fishivo/utils';
import type { Theme } from '@/theme';

const DARK_COLORS = {
  background: '#0A0A0A',
  surface: '#171717',
  border: '#262626',
  text: '#FAFAFA',
  textSecondary: '#A3A3A3',
  primary: '#3B82F6',
};

const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Geri tuşunu handle et
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Auth ekranında geri tuşu = uygulamadan çık
        BackHandler.exitApp();
        return true;
      };
      
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => subscription.remove();
    }, [])
  );

  const validateForm = () => {
    if (!email || !password) {
      setModalMessage(t('auth.signIn.errors.allFieldsRequired'));
      setShowErrorModal(true);
      return false;
    }
    
    if (isSignup) {
      if (!username || !firstName || !lastName) {
        setModalMessage(t('auth.signUp.errors.allFieldsRequired'));
        setShowErrorModal(true);
        return false;
      }
      if (username.length < 3) {
        setModalMessage(t('auth.signUp.errors.usernameMinLength'));
        setShowErrorModal(true);
        return false;
      }
      if (password.length < 8) {
        setModalMessage(t('auth.signUp.errors.weakPassword'));
        setShowErrorModal(true);
        return false;
      }
      if (usernameError) {
        setModalMessage(usernameError);
        setShowErrorModal(true);
        return false;
      }
      if (emailError) {
        setModalMessage(emailError);
        setShowErrorModal(true);
        return false;
      }
    }
    
    return true;
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameError('');
      return;
    }

    setCheckingUsername(true);
    setUsernameError('');

    try {
      // Client-side validation first
      const validation = isUsernameValid(usernameToCheck);
      if (!validation.isValid) {
        let errorMessage = t('auth.signUp.errors.usernameInvalid');
        
        // Map validation messages to translations
        if (validation.message === 'USERNAME_RESERVED') {
          errorMessage = t('auth.signUp.errors.usernameReserved');
        } else if (validation.message === 'USERNAME_INAPPROPRIATE') {
          errorMessage = t('auth.signUp.errors.usernameInvalid');
        } else if (validation.message === 'USERNAME_TOO_SHORT') {
          errorMessage = t('auth.signUp.errors.usernameMinLength');
        }
        
        setUsernameError(errorMessage);
        setCheckingUsername(false);
        return;
      }

      // Check database availability
      const supabase = getNativeSupabaseClient();
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', usernameToCheck.toLowerCase())
        .single();

      if (existingUser) {
        setUsernameError(t('auth.signUp.errors.usernameTaken'));
      }
    } catch (error) {
      // No user found - username is available
      setUsernameError('');
    } finally {
      setCheckingUsername(false);
    }
  };

  const checkEmailAvailability = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    setEmailError('');

    try {
      const supabase = getNativeSupabaseClient();
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailToCheck.toLowerCase())
        .single();

      if (existingUser) {
        setEmailError(t('auth.signUp.errors.emailTaken'));
      }
    } catch (error) {
      // No user found - email is available
      setEmailError('');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const supabase = getNativeSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = t('common.errors.loginFailed');
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = t('common.errors.invalidCredentials');
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = t('common.errors.emailNotVerified');
        }
        setModalMessage(errorMessage);
        setShowErrorModal(true);
      } else {
        // Başarılı giriş - MainTabs'e yönlendir
        navigation.dispatch(
          CommonActions.reset({ 
            index: 0, 
            routes: [{ name: 'MainTabs' }] 
          })
        );
      }
    } catch (error) {
      setModalMessage(t('auth.signIn.errors.signInFailed'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const supabase = getNativeSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        let errorMessage = t('common.errors.signupFailed');
        if (error.message.includes('User already registered')) {
          errorMessage = t('common.errors.emailAlreadyRegistered');
        }
        setModalMessage(errorMessage);
        setShowErrorModal(true);
      } else {
        // Başarılı kayıt - email doğrulaması gerekebilir
        setModalMessage(t('auth.signUp.verificationEmailSent'));
        setShowSuccessModal(true);
      }
    } catch (error) {
      setModalMessage(t('auth.signIn.errors.signInFailed'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignup) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  const createSessionFromUrl = async (url: string) => {
    try {
      const supabase = getNativeSupabaseClient();
      
      const urlObj = new URL(url.replace('fishivo://', 'https://fishivo.com/'));

      // PKCE akışı: code parametresi mevcutsa önce onu kullan
      const code = urlObj.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setModalMessage(t('auth.signIn.errors.signInFailed'));
          setShowErrorModal(true);
        } else {
          navigation.dispatch(
            CommonActions.reset({ 
              index: 0, 
              routes: [{ name: 'MainTabs' }] 
            })
          );
        }
        return;
      }
      
      // Implicit akış: URL hash veya query içinde access_token/refresh_token olabilir
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      
      if (urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
      }
      
      // Query param fallback
      if (!accessToken) {
        accessToken = urlObj.searchParams.get('access_token');
        refreshToken = urlObj.searchParams.get('refresh_token');
      }
      
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          setModalMessage(t('auth.signIn.errors.signInFailed'));
          setShowErrorModal(true);
        } else {
          // Session başarılı, MainTabs'e yönlendir
          navigation.dispatch(
            CommonActions.reset({ 
              index: 0, 
              routes: [{ name: 'MainTabs' }] 
            })
          );
        }
      }
    } catch (error) {
      setModalMessage(t('auth.signIn.errors.signInFailed'));
      setShowErrorModal(true);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setModalMessage(t('auth.forgotPassword.errors.emailRequired'));
      setShowErrorModal(true);
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const supabase = getNativeSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'fishivo://auth/reset-password',
      });

      if (error) {
        let errorMessage = t('auth.forgotPassword.errors.sendFailed');
        if (error.message.includes('rate limit')) {
          errorMessage = t('auth.forgotPassword.errors.tooManyRequests');
        } else if (error.message.includes('not found')) {
          errorMessage = t('auth.forgotPassword.errors.userNotFound');
        }
        setModalMessage(errorMessage);
        setShowErrorModal(true);
      } else {
        setForgotPasswordSuccess(true);
        setModalMessage(t('auth.forgotPassword.emailSent'));
        setShowSuccessModal(true);
      }
    } catch (error) {
      setModalMessage(t('auth.forgotPassword.errors.unexpected'));
      setShowErrorModal(true);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const supabase = getNativeSupabaseClient();
      
      const redirectUrl = 'fishivo://auth/callback';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setModalMessage(t('auth.signIn.errors.signInFailed') + ': ' + error.message);
        setShowErrorModal(true);
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        const isAvailable = await InAppBrowser.isAvailable();
        if (!isAvailable) {
          await Linking.openURL(data.url);
          setGoogleLoading(false);
          return;
        }
        
        const result = await InAppBrowser.openAuth(
          data.url,
          redirectUrl,
          {
            ephemeralWebSession: false,
            preferredBarTintColor: '#0891b2',
            preferredControlTintColor: 'white',
            dismissButtonStyle: 'close',
            modalPresentationStyle: 'fullScreen',
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            forceCloseOnRedirection: true,
          }
        );
        
        if (result.type === 'success' && result.url) {
          await createSessionFromUrl(result.url);
        }
      } else {
        setModalMessage(t('auth.signIn.errors.signInFailed'));
        setShowErrorModal(true);
      }
    } catch (error) {
      setModalMessage(t('auth.signIn.errors.signInFailed'));
      setShowErrorModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderContent = () => {
    if (showForgotPassword) {
      return (
        <>
          <View style={styles.headerSection}>
            <FishivoSvgLogo size="lg" color="#FAFAFA" />
            <Text style={styles.title}>{t('common.appName')}</Text>
            <Text style={styles.subtitle}>
              {forgotPasswordSuccess ? t('auth.forgotPassword.checkEmail') : t('auth.forgotPassword.title')}
            </Text>
          </View>

          <View style={styles.formSection}>
            {forgotPasswordSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{t('auth.forgotPassword.emailSentDescription')}</Text>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordSuccess(false);
                  }}
                >
                  <Text style={styles.submitButtonText}>{t('auth.forgotPassword.backToLogin')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.label}>{t('auth.signIn.email')}</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.placeholders.email')}
                    placeholderTextColor={DARK_COLORS.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, forgotPasswordLoading && styles.disabledButton]}
                  onPress={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t('auth.forgotPassword.sendResetEmail')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setShowForgotPassword(false)}
                  disabled={forgotPasswordLoading}
                >
                  <Text style={styles.linkButtonText}>{t('auth.forgotPassword.backToLogin')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.headerSection}>
          <FishivoSvgLogo size="xl" color="#FAFAFA" />
          <Text style={styles.title}>{t('common.appName')}</Text>
          <Text style={styles.subtitle}>
            {isSignup ? t('auth.signUp.title') : t('auth.signIn.title')}
          </Text>
        </View>

            <View style={styles.formSection}>
              {isSignup && (
                <>
                  <TouchableOpacity
                    style={[styles.googleButton, (loading || googleLoading) && styles.disabledButton]}
                    onPress={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color={DARK_COLORS.text} />
                    ) : (
                      <>
                        <Icon name="google" size={20} />
                        <Text style={styles.googleButtonText}>
                          {t('auth.signIn.signInWithGoogle')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>{t('auth.signIn.orContinueWith')}</Text>
                    <View style={styles.divider} />
                  </View>

                  <View style={[styles.row, styles.rowMarginTop]}>
                    <View style={styles.halfInput}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>{t('auth.signUp.firstName')}</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder={t('auth.placeholders.firstName')}
                        placeholderTextColor={DARK_COLORS.textSecondary}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>{t('auth.signUp.lastName')}</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder={t('auth.placeholders.lastName')}
                        placeholderTextColor={DARK_COLORS.textSecondary}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.label}>{t('auth.signUp.username')}</Text>
                      {checkingUsername && (
                        <ActivityIndicator size="small" color={DARK_COLORS.primary} />
                      )}
                    </View>
                    <TextInput
                      style={[styles.input, usernameError && styles.inputError]}
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        checkUsernameAvailability(text);
                      }}
                      placeholder={t('auth.placeholders.username')}
                      placeholderTextColor={DARK_COLORS.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {usernameError ? (
                      <Text style={styles.errorText}>{usernameError}</Text>
                    ) : null}
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>E-posta</Text>
                  {checkingEmail && isSignup && (
                    <ActivityIndicator size="small" color={DARK_COLORS.primary} />
                  )}
                </View>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (isSignup) {
                      checkEmailAvailability(text);
                    }
                  }}
                  placeholder={t('auth.placeholders.email')}
                  placeholderTextColor={DARK_COLORS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailError && isSignup ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{t('auth.signIn.password')}</Text>
                  {!isSignup && (
                    <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
                      <Text style={styles.forgotPasswordLink}>{t('auth.signIn.forgotPassword')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.placeholders.password')}
                    placeholderTextColor={DARK_COLORS.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isSignup ? t('auth.signUp.signUpButton') : t('auth.signIn.signInButton')}
                  </Text>
                )}
              </TouchableOpacity>

              {!isSignup && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>{t('auth.signIn.orContinueWith')}</Text>
                    <View style={styles.divider} />
                  </View>

                  <TouchableOpacity
                    style={[styles.googleButton, (loading || googleLoading) && styles.disabledButton, styles.googleButtonMarginTop]}
                    onPress={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color={DARK_COLORS.text} />
                    ) : (
                      <>
                        <Icon name="google" size={20} />
                        <Text style={styles.googleButtonText}>
                          {t('auth.signIn.signInWithGoogle')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isSignup ? t('auth.signUp.haveAccount') : t('auth.signIn.noAccount')}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setIsSignup(!isSignup);
                    setEmail('');
                    setPassword('');
                    setUsername('');
                    setFirstName('');
                    setLastName('');
                  }}
                  disabled={loading || googleLoading}
                >
                  <Text style={[styles.switchLink, (loading || googleLoading) && styles.disabledText]}>
                    {isSignup ? t('auth.signUp.signIn') : t('auth.signIn.signUp')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </>
      );
    }

  const styles = createStyles(theme);
  
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
            {renderContent()}
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
          // Sign up success durumunda isSignup'ı false yap
          if (modalMessage === t('auth.signUp.verificationEmailSent')) {
            setIsSignup(false);
          }
          // Forgot password success durumunda forgot password ekranını kapat
          if (modalMessage === t('auth.forgotPassword.emailSent')) {
            setShowForgotPassword(false);
            setForgotPasswordSuccess(false);
          }
        }}
        preset="success" 
        title={t('common.success')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => {
            setShowSuccessModal(false);
            // Sign up success durumunda isSignup'ı false yap
            if (modalMessage === t('auth.signUp.verificationEmailSent')) {
              setIsSignup(false);
            }
            // Forgot password success durumunda forgot password ekranını kapat
            if (modalMessage === t('auth.forgotPassword.emailSent')) {
              setShowForgotPassword(false);
              setForgotPasswordSuccess(false);
            }
          }
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
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
    paddingHorizontal: theme.spacing.lg,
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
    marginTop: 8,
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
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: DARK_COLORS.text,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPasswordLink: {
    fontSize: 15,
    color: DARK_COLORS.primary,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    color: DARK_COLORS.text,
    backgroundColor: DARK_COLORS.surface,
    height: 44,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 12,
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
    paddingHorizontal: 10,
    fontSize: 15,
    color: DARK_COLORS.text,
  },
  eyeButton: {
    paddingHorizontal: 10,
    height: 44,
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: DARK_COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 0,
  },
  switchText: {
    color: DARK_COLORS.textSecondary,
    fontSize: 15,
    marginRight: 4,
  },
  switchLink: {
    color: DARK_COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: DARK_COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: DARK_COLORS.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: DARK_COLORS.surface,
    height: 44,
  },
  googleButtonText: {
    color: DARK_COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successText: {
    fontSize: 15,
    color: DARK_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  linkButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: DARK_COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  rowMarginTop: {
    marginTop: 12,
  },
  googleButtonMarginTop: {
    marginTop: 6,
  },
  disabledText: {
    opacity: 0.5,
  },
  inputError: {
    borderColor: '#FF4B4B',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4B4B',
    marginTop: 4,
  },
});

export default AuthScreen;