import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { FishivoModal } from '@/components/ui/FishivoModal';
import ProBadge from '@/components/ui/ProBadge';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { 
  baseMapLayers, 
  marineLayers
} from '@/components/ui/maps/layers/layerDefinitions';
import type { MapLayer, MapLayerSelection } from '@/components/ui/maps/layers/types';

interface MapLayerModalProps {
  visible: boolean;
  onClose: () => void;
  selection: MapLayerSelection;
  onSelectionChange: (selection: MapLayerSelection) => void;
}

const MapLayerModal: React.FC<MapLayerModalProps> = ({
  visible,
  onClose,
  selection,
  onSelectionChange,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const { isPremium } = usePremiumStatus();

  const handleBaseMapSelect = (mapId: string) => {
    // Get the layer to check if it's premium
    const layer = baseMapLayers.find(l => l.id === mapId);
    
    // Check if it's a premium layer and user doesn't have premium
    if (layer?.isPremium && !isPremium) {
      // Show premium lock modal instead of selecting
      return;
    }
    
    onSelectionChange({
      ...selection,
      baseMapId: mapId,
    });
  };

  const handleOverlayToggle = (overlayId: string) => {
    const overlayIds = [...(selection.overlayIds || [])];
    const index = overlayIds.indexOf(overlayId);
    
    if (index > -1) {
      overlayIds.splice(index, 1);
    } else {
      overlayIds.push(overlayId);
    }
    
    onSelectionChange({
      ...selection,
      overlayIds,
    });
  };



  // Professional badge rendering helper
  const renderBadges = (item: { isNew?: boolean; isPro?: boolean; isPremium?: boolean }) => (
    <>
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>{t('common.new', { defaultValue: 'YENİ' })}</Text>
        </View>
      )}
      {(item.isPro || item.isPremium) && <ProBadge variant="badge" size="sm" />}
    </>
  );

  // Professional layer item renderer with strict typing
  const renderLayerItem = (
    layer: MapLayer | { id?: string; name?: string; description?: string; previewImage?: number; isNew?: boolean; isPro?: boolean; isPremium?: boolean },
    type: 'base' | 'overlay' | 'terrain',
    isActive: boolean,
    onToggle: () => void,
    disabled = false
  ) => {
    const layerName = layer.id 
      ? t(`map.layers.${layer.id}.name`, { defaultValue: layer.name || '' })
      : layer.name || '';
    const layerDescription = layer.id
      ? t(`map.layers.${layer.id}.description`, { defaultValue: layer.description || '' })
      : layer.description || '';

    return (
      <TouchableOpacity
        key={layer.id || 'terrain'}
        style={[
          styles.item, 
          isActive && (type === 'base' ? styles.itemSelected : styles.itemActive)
        ]}
        onPress={() => !disabled && onToggle()}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <View style={styles.itemLeft}>
          {type === 'base' && (
            <View style={[styles.radio, isActive && styles.radioSelected]}>
              {isActive && <View style={styles.radioInner} />}
            </View>
          )}
          
          <View style={[
            styles.iconBox, 
            isActive && (type === 'base' ? styles.iconBoxSelected : styles.iconBoxActive)
          ]}>
            <Image
              source={layer.previewImage || require('@/assets/images/map-layers/special/3d-terrain.png')}
              style={styles.layerPreview}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.itemContent}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.itemTitle, 
                isActive && (type === 'base' ? styles.itemTitleSelected : styles.itemTitleActive)
              ]}>
                {layerName}
              </Text>
              {renderBadges(layer)}
            </View>
            {layerDescription && (
              <Text style={styles.itemDescription}>{layerDescription}</Text>
            )}
          </View>
        </View>
        
        {type !== 'base' && (
          <Switch
            value={isActive}
            onValueChange={disabled ? undefined : onToggle}
            disabled={disabled}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.success + '50',
            }}
            thumbColor={isActive ? theme.colors.success : '#f4f3f4'}
            ios_backgroundColor={theme.colors.border}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Professional base map renderer with premium support
  const renderBaseMapItem = (map: MapLayer) => 
    renderLayerItem(
      map,
      'base',
      selection.baseMapId === map.id,
      () => handleBaseMapSelect(map.id),
      Boolean(map.isPremium && !isPremium) // Disable if premium and user not premium
    );

  // Professional overlay renderer with pro badge support
  const renderOverlayItem = (overlay: MapLayer) => 
    renderLayerItem(
      overlay,
      'overlay',
      Boolean(selection.overlayIds?.includes(overlay.id)),
      () => handleOverlayToggle(overlay.id),
      Boolean(overlay.isPro)
    );

  return (
    <FishivoModal
      visible={visible}
      onClose={onClose}
      title={t('map.layers.title', { defaultValue: 'Harita Katmanları' })}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Professional Base Maps Section - Exclusive Selection Guaranteed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'Base Maps'}</Text>
          <Text style={styles.sectionSubtitle}>{'Sadece bir harita seçilebilir'}</Text>
          {baseMapLayers.map((layer, index) => (
            <View key={layer.id} style={index === baseMapLayers.length - 1 ? styles.lastItem : undefined}>
              {renderBaseMapItem(layer)}
            </View>
          ))}
        </View>


        {/* EMODnet Bathymetry Section */}
        {/* EMODnet is now a base map - removed bathymetry section */}

        {/* Marine Overlay Section */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>{t('map.layers.marineTitle', { defaultValue: 'Denizcilik Katmanı' })}</Text>
          {marineLayers.map(renderOverlayItem)}
        </View>
      </ScrollView>
    </FishivoModal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  lastItem: {
    marginBottom: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  itemActive: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  iconBox: {
    width: 70,
    height: 50,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  iconBoxSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  iconBoxActive: {
    backgroundColor: theme.colors.success + '20',
  },
  itemContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginRight: 8,
  },
  itemTitleSelected: {
    color: theme.colors.primary,
  },
  itemTitleActive: {
    color: theme.colors.success,
  },
  itemDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  newBadgeText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
  },
  layerPreview: {
    width: 70,
    height: 50,
    borderRadius: 8,
  },
});

export default MapLayerModal;