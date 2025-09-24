import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProBadge, ScreenContainer, FishivoModal, LocationCard, Icon, AppHeader } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface ProDemoScreenProps {
  navigation: any;
}

const ProDemoScreen: React.FC<ProDemoScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showProModal, setShowProModal] = useState(false);
  const styles = createStyles(theme);

  const handleProPress = () => {
    setShowProModal(true);
  };

  // Mock data kaldırıldı - gerçek PRO location API'den gelecek
  const [demoLocation, setDemoLocation] = useState({
    id: '1',
    name: t('premium.proExampleLocation'),
    type: 'private-spot' as const,
    coordinates: { latitude: 41.0856, longitude: 28.9875 },
    address: t('premium.premiumLocation'),
    isFavorite: true,
    isPrivate: true,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('premium.title')}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          
          {/* Icon Variants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ {t('premium.iconVariants')}</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.smallIcon')}</Text>
              <ProBadge variant="icon" size="sm" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.mediumIcon')}</Text>
              <ProBadge variant="icon" size="md" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.largeIcon')}</Text>
              <ProBadge variant="icon" size="lg" onPress={handleProPress} />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.iconOnly')}</Text>
              <ProBadge variant="icon" size="md" showText={false} onPress={handleProPress} />
            </View>
          </View>

          {/* Badge Variants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎖️ {t('premium.badgeVariants')}</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.smallBadge')}</Text>
              <ProBadge variant="badge" size="sm" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.mediumBadge')}</Text>
              <ProBadge variant="badge" size="md" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.largeBadge')}</Text>
              <ProBadge variant="badge" size="lg" onPress={handleProPress} />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{t('premium.customText')}</Text>
              <ProBadge variant="badge" size="md" text={t('premium.premium')} onPress={handleProPress} />
            </View>
          </View>

          {/* Banner Variant */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 {t('premium.bannerVariant')}</Text>
            <ProBadge variant="banner" onPress={handleProPress} />
          </View>

          {/* Button Variant */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 {t('premium.buttonVariant')}</Text>
            <ProBadge variant="button" onPress={handleProPress} />
          </View>

          {/* Real Usage Examples */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 {t('premium.realUsageExamples')}</Text>
            
            {/* In Card Headers */}
            <View style={styles.usageCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{t('premium.premiumFeature')}</Text>
                <ProBadge variant="badge" size="sm" />
              </View>
              <Text style={styles.cardDescription}>
                {t('premium.onlyForPro')}
              </Text>
            </View>

            {/* In Location Cards */}
            <View style={styles.locationExample}>
              <Text style={styles.exampleTitle}>{t('premium.locationCardIntegration')}</Text>
              <LocationCard
                location={demoLocation}
                variant="grid"
                onPress={() => setShowProModal(true)}
                showActions={false}
                style={{ width: '100%' }}
              />
              <View style={styles.proOverlay}>
                <ProBadge variant="badge" size="sm" onPress={handleProPress} />
              </View>
            </View>

            {/* In Lists */}
            <View style={styles.listExample}>
              <Text style={styles.exampleTitle}>{t('premium.inListItems')}</Text>
              
              <View style={styles.listItem}>
                <Icon name="zap" size={20} color={theme.colors.primary} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{t('premium.advancedFishRecognition')}</Text>
                  <Text style={styles.listItemSubtitle}>{t('premium.autoFishDetectionAI')}</Text>
                </View>
                <ProBadge variant="icon" size="sm" onPress={handleProPress} />
              </View>

              <View style={styles.listItem}>
                <Icon name="bar-chart" size={20} color={theme.colors.primary} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{t('premium.detailedStatistics')}</Text>
                  <Text style={styles.listItemSubtitle}>{t('premium.monthlyYearlyReports')}</Text>
                </View>
                <ProBadge variant="icon" size="sm" onPress={handleProPress} />
              </View>

              <View style={styles.listItem}>
                <Icon name="cloud" size={20} color={theme.colors.primary} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{t('premium.unlimitedCloudStorage')}</Text>
                  <Text style={styles.listItemSubtitle}>{t('premium.saveAllPhotosSecurely')}</Text>
                </View>
                <ProBadge variant="badge" size="sm" onPress={handleProPress} />
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>

      <FishivoModal
        visible={showProModal}
        title={t('premium.proFeature')}
        preset="info"
        description={t('premium.upgradeToProMessage')}
        onClose={() => setShowProModal(false)}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowProModal(false)
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  usageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  cardDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  locationExample: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  exampleTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  proOverlay: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  listExample: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default ProDemoScreen; 