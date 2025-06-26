import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProBadge, Icon, AppHeader, ScreenContainer, SuccessModal, LocationCard } from '@fishivo/ui';
import { theme } from '@fishivo/shared';

interface ProDemoScreenProps {
  navigation: any;
}

const ProDemoScreen: React.FC<ProDemoScreenProps> = ({ navigation }) => {
  const [showProModal, setShowProModal] = useState(false);

  const handleProPress = () => {
    setShowProModal(true);
  };

  // Mock data kaldırıldı - gerçek PRO location API'den gelecek
  const [demoLocation, setDemoLocation] = useState({
    id: '1',
    name: 'PRO Özellik Örneği',
    type: 'private-spot' as const,
    coordinates: { latitude: 41.0856, longitude: 28.9875 },
    address: 'Premium Lokasyon, İstanbul',
    isFavorite: true,
    isPrivate: true,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="PRO Badge Demo"
        canGoBack
        onBackPress={() => navigation.goBack()}
      />

      <ScreenContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Icon Variants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Icon Variants</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Small Icon:</Text>
              <ProBadge variant="icon" size="sm" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Medium Icon:</Text>
              <ProBadge variant="icon" size="md" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Large Icon:</Text>
              <ProBadge variant="icon" size="lg" onPress={handleProPress} />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Icon Only:</Text>
              <ProBadge variant="icon" size="md" showText={false} onPress={handleProPress} />
            </View>
          </View>

          {/* Badge Variants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎖️ Badge Variants</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Small Badge:</Text>
              <ProBadge variant="badge" size="sm" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Medium Badge:</Text>
              <ProBadge variant="badge" size="md" onPress={handleProPress} />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Large Badge:</Text>
              <ProBadge variant="badge" size="lg" onPress={handleProPress} />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Custom Text:</Text>
              <ProBadge variant="badge" size="md" text="PREMIUM" onPress={handleProPress} />
            </View>
          </View>

          {/* Banner Variant */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Banner Variant</Text>
            <ProBadge variant="banner" onPress={handleProPress} />
          </View>

          {/* Button Variant */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Button Variant</Text>
            <ProBadge variant="button" onPress={handleProPress} />
          </View>

          {/* Real Usage Examples */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Gerçek Kullanım Örnekleri</Text>
            
            {/* In Card Headers */}
            <View style={styles.usageCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Premium Özellik</Text>
                <ProBadge variant="badge" size="sm" />
              </View>
              <Text style={styles.cardDescription}>
                Bu özellik sadece PRO kullanıcılar için mevcut
              </Text>
            </View>

            {/* In Location Cards */}
            <View style={styles.locationExample}>
              <Text style={styles.exampleTitle}>LocationCard ile Entegrasyon:</Text>
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
              <Text style={styles.exampleTitle}>Liste Öğelerinde:</Text>
              
              <View style={styles.listItem}>
                <Icon name="zap" size={20} color={theme.colors.primary} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>Gelişmiş Balık Tanıma</Text>
                  <Text style={styles.listItemSubtitle}>AI ile otomatik balık türü tespiti</Text>
                </View>
                <ProBadge variant="icon" size="sm" onPress={handleProPress} />
              </View>

              <View style={styles.listItem}>
                <Icon name="bar-chart" size={20} color={theme.colors.primary} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>Detaylı İstatistikler</Text>
                  <Text style={styles.listItemSubtitle}>Aylık ve yıllık av raporları</Text>
                </View>
                <ProBadge variant="icon" size="sm" onPress={handleProPress} />
              </View>

              <View style={styles.listItem}>
                <Icon name="cloud" size={20} color={theme.colors.primary} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>Sınırsız Bulut Depolama</Text>
                  <Text style={styles.listItemSubtitle}>Tüm fotoğraflarınızı güvenle saklayın</Text>
                </View>
                <ProBadge variant="badge" size="sm" onPress={handleProPress} />
              </View>
            </View>
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>

      <SuccessModal
        visible={showProModal}
        title="PRO Özellik"
        message="PRO sürümüne geçmek için kayıt olun!"
        onClose={() => setShowProModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  section: {
    paddingHorizontal: theme.spacing.sm,
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