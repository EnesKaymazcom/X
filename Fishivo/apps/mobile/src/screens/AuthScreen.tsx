import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  ScreenContainer, 
  SuccessModal 
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';

const { width, height } = Dimensions.get('window');

interface AuthScreenProps {
  navigation: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Mock login for now
      setTimeout(() => {
        setModalMessage('Google ile giriş başarılı!');
        setShowSuccessModal(true);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Google login error:', error);
      setModalMessage('Giriş yapılırken bir hata oluştu.');
      setShowErrorModal(true);
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
          {/* Logo ve Branding */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Icon name="fish" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.appName}>Fishivo</Text>
            <Text style={styles.tagline}>Balıkçılık Deneyimini Paylaş</Text>
          </View>

          {/* Ana İçerik */}
          <View style={styles.contentSection}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Hoş Geldin!</Text>
              <Text style={styles.welcomeSubtitle}>
                Fishivo topluluğuna katılmak için giriş yap
              </Text>
            </View>

            {/* Giriş Butonları */}
            <View style={styles.loginButtonsContainer}>
              {/* Mock Google Button */}
              <View style={styles.googleButton}>
                <Icon name="mail" size={20} color={theme.colors.surface} />
                <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
              </View>
            </View>

            {/* Özellikler */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon name="map-pin" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.featureText}>Balık noktalarını keşfet</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon name="activity" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.featureText}>Avlarını kaydet</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon name="user" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.featureText}>Topluluğa katıl</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Icon name="sun" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.featureText}>Hava durumu</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Giriş yaparak{' '}
              <Text style={styles.linkText}>Kullanım Koşulları</Text>
              {' '}ve{' '}
              <Text style={styles.linkText}>Gizlilik Politikası</Text>
              'nı kabul etmiş olursunuz
            </Text>
          </View>
        </ScreenContainer>

        <SuccessModal
          visible={showSuccessModal}
          message={modalMessage}
          onClose={handleSuccessModalClose}
        />

        <SuccessModal
          visible={showErrorModal}
          message={modalMessage}
          onClose={handleErrorModalClose}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: theme.typography['4xl'],
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  welcomeTitle: {
    fontSize: theme.typography['3xl'],
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButtonsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  googleButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
  },
  featuresContainer: {
    gap: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
});

export default AuthScreen;