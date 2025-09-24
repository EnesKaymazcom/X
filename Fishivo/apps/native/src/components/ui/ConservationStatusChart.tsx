import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getConservationStatusInfo } from '@/utils/conservation-status';

interface ConservationStatusChartProps {
  currentStatus: string;
  locale: 'tr' | 'en';
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

const CONSERVATION_CATEGORIES = [
  { code: 'EX', group: 'extinct' },
  { code: 'EW', group: 'extinct' },
  { code: 'CR', group: 'threatened' },
  { code: 'EN', group: 'threatened' },
  { code: 'VU', group: 'threatened' },
  { code: 'NT', group: 'threatened' },
  { code: 'LC', group: 'leastConcern' }
];

const GROUP_LABELS = {
  extinct: {
    en: 'Extinct',
    tr: 'Tükenmiş'
  },
  threatened: {
    en: 'Threatened',
    tr: 'Tehdit Altında'
  },
  leastConcern: {
    en: 'Least Concern',
    tr: 'Düşük Risk'
  }
};

// Tailwind colors converted to hex
const COLORS = {
  // Status colors
  gray900: '#111827',
  purple900: '#6B21A8',
  red700: '#B91C1C',
  orange600: '#EA580C',
  yellow500: '#EAB308',
  lime600: '#65A30D',
  green600: '#16A34A',
  
  // UI colors
  white: '#FFFFFF',
  gray300: '#D1D5DB',
  gray700: '#374151',
  gray800: '#1F2937',
  gray600: '#4B5563',
  gray500: '#6B7280',
  gray400: '#9CA3AF'
};

const ConservationStatusChart: React.FC<ConservationStatusChartProps> = ({
  currentStatus,
  locale = 'en',
  showLabels = true,
  size = 'medium',
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const sizeConfig = {
    small: {
      circleSize: 32,
      fontSize: 10,
      gap: 8,
      lineGap: 8,
      padding: 8
    },
    medium: {
      circleSize: 40,
      fontSize: 12,
      gap: 12,
      lineGap: 12,
      padding: 16
    },
    large: {
      circleSize: 48,
      fontSize: 14,
      gap: 16,
      lineGap: 16,
      padding: 20
    }
  };

  const config = sizeConfig[size];
  const currentStatusUpper = currentStatus?.toUpperCase();

  const getActiveColor = (code: string): string => {
    switch (code) {
      case 'EX': return COLORS.gray900;
      case 'EW': return COLORS.purple900;
      case 'CR': return COLORS.red700;
      case 'EN': return COLORS.orange600;
      case 'VU': return COLORS.yellow500;
      case 'NT': return COLORS.lime600;
      case 'LC': return COLORS.green600;
      default: return COLORS.gray600;
    }
  };

  const getTextColor = (code: string, isActive: boolean): string => {
    if (!isActive) {
      return isDark ? COLORS.gray300 : COLORS.gray700;
    }
    // All active states use white text
    return COLORS.white;
  };

  const groups = CONSERVATION_CATEGORIES.reduce((acc, cat) => {
    if (!acc[cat.group]) {
      acc[cat.group] = [];
    }
    acc[cat.group].push(cat);
    return acc;
  }, {} as Record<string, typeof CONSERVATION_CATEGORIES>);

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { padding: config.padding }]}>
        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {/* Extinct Group */}
          <View style={[styles.groupContainer, styles.extinctGroupContainer]}>
            {showLabels && (
              <Text style={[styles.groupLabel, { fontSize: config.fontSize + 2, marginBottom: 12 }]}>
                {GROUP_LABELS.extinct[locale]}
              </Text>
            )}
            <View style={styles.categoriesInGroup}>
              {groups.extinct?.map((category, index) => {
                const isActive = category.code === currentStatusUpper;
                const isHighlighted = isActive;
                
                return (
                  <View key={category.code} style={[styles.categoryItem, { marginHorizontal: config.gap / 2 }]}>
                    {index > 0 && (
                      <View style={[styles.connectionLine, { width: config.gap + 2, left: -config.gap - 1 }]} />
                    )}
                    <View style={[
                      styles.statusCircle,
                      {
                        width: config.circleSize,
                        height: config.circleSize,
                        backgroundColor: isHighlighted ? getActiveColor(category.code) : (isDark ? COLORS.gray800 : COLORS.white),
                        borderColor: isHighlighted ? getActiveColor(category.code) : (isDark ? COLORS.gray600 : COLORS.gray300),
                        transform: [{ scale: isHighlighted ? 1.1 : 1 }],
                      }
                    ]}>
                      <Text style={[
                        styles.statusCode,
                        {
                          fontSize: config.fontSize,
                          color: getTextColor(category.code, isHighlighted),
                          fontWeight: isHighlighted ? 'bold' : '600',
                        }
                      ]}>
                        {category.code}
                      </Text>
                      {isHighlighted && (
                        <View style={[styles.ringIndicator, { backgroundColor: getActiveColor(category.code) + '33' }]} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Threatened Group */}
          <View style={[styles.groupContainer, styles.threatenedGroupContainer]}>
            {showLabels && (
              <Text style={[styles.groupLabel, { fontSize: config.fontSize + 2, marginBottom: 12 }]}>
                {GROUP_LABELS.threatened[locale]}
              </Text>
            )}
            <View style={styles.categoriesInGroup}>
              {groups.threatened?.map((category, index) => {
                const isActive = category.code === currentStatusUpper;
                const isHighlighted = isActive;
                
                return (
                  <View key={category.code} style={[styles.categoryItem, { marginHorizontal: config.gap / 2 }]}>
                    {index > 0 && (
                      <View style={[styles.connectionLine, { width: config.gap + 2, left: -config.gap - 1 }]} />
                    )}
                    <View style={[
                      styles.statusCircle,
                      {
                        width: config.circleSize,
                        height: config.circleSize,
                        backgroundColor: isHighlighted ? getActiveColor(category.code) : (isDark ? COLORS.gray800 : COLORS.white),
                        borderColor: isHighlighted ? getActiveColor(category.code) : (isDark ? COLORS.gray600 : COLORS.gray300),
                        transform: [{ scale: isHighlighted ? 1.1 : 1 }],
                      }
                    ]}>
                      <Text style={[
                        styles.statusCode,
                        {
                          fontSize: config.fontSize,
                          color: getTextColor(category.code, isHighlighted),
                          fontWeight: isHighlighted ? 'bold' : '600',
                        }
                      ]}>
                        {category.code}
                      </Text>
                      {isHighlighted && (
                        <View style={[styles.ringIndicator, { backgroundColor: getActiveColor(category.code) + '33' }]} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Least Concern Group */}
          <View style={[styles.groupContainer, styles.leastConcernGroupContainer]}>
            {showLabels && (
              <Text style={[styles.groupLabel, { fontSize: config.fontSize + 2, marginBottom: 12, marginLeft: -15 }]}>
                {GROUP_LABELS.leastConcern[locale]}
              </Text>
            )}
            <View style={styles.categoriesInGroup}>
              {groups.leastConcern?.map((category, index) => {
                const isActive = category.code === currentStatusUpper;
                const isHighlighted = isActive;
                
                return (
                  <View key={category.code} style={[styles.categoryItem, { marginHorizontal: config.gap / 2 }]}>
                    {index > 0 && (
                      <View style={[styles.connectionLine, { width: config.gap + 2, left: -config.gap - 1 }]} />
                    )}
                    <View style={[
                      styles.statusCircle,
                      {
                        width: config.circleSize,
                        height: config.circleSize,
                        backgroundColor: isHighlighted ? getActiveColor(category.code) : (isDark ? COLORS.gray800 : COLORS.white),
                        borderColor: isHighlighted ? getActiveColor(category.code) : (isDark ? COLORS.gray600 : COLORS.gray300),
                        transform: [{ scale: isHighlighted ? 1.1 : 1 }],
                      }
                    ]}>
                      <Text style={[
                        styles.statusCode,
                        {
                          fontSize: config.fontSize,
                          color: getTextColor(category.code, isHighlighted),
                          fontWeight: isHighlighted ? 'bold' : '600',
                        }
                      ]}>
                        {category.code}
                      </Text>
                      {isHighlighted && (
                        <View style={[styles.ringIndicator, { backgroundColor: getActiveColor(category.code) + '33' }]} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Attribution */}
        <Text style={[styles.attribution, { fontSize: config.fontSize }]}>
          *{locale === 'tr' ? 'IUCN Kırmızı Liste verilerine dayalıdır' : 'Sourced from IUCN Red List'}
        </Text>
      </View>

      {/* Current Status Info */}
      {currentStatusUpper && getConservationStatusInfo(currentStatusUpper) && (() => {
        const info = getConservationStatusInfo(currentStatusUpper)!;
        const activeColor = getActiveColor(currentStatusUpper);
        
        return (
          <View style={[
            styles.statusInfoContainer,
            {
              backgroundColor: isDark 
                ? activeColor + '1A' // 10% opacity
                : activeColor + '0D', // 5% opacity
              borderColor: isDark
                ? activeColor + '66' // 40% opacity
                : activeColor + '33', // 20% opacity
            }
          ]}>
            <Text style={[
              styles.statusInfoTitle,
              { color: isDark ? COLORS.gray300 : activeColor }
            ]}>
              {locale === 'tr' ? 'Mevcut Durum: ' : 'Current Status: '}
              <Text style={[
                styles.statusInfoContent,
                { color: isDark ? COLORS.gray400 : activeColor }
              ]}>
                {info.code} - {info.label[locale]}
              </Text>
            </Text>
            <Text style={[
              styles.statusInfoDescription,
              { color: isDark ? COLORS.gray400 : activeColor + 'CC' }
            ]} numberOfLines={0}>
              {info.description[locale]}
            </Text>
          </View>
        );
      })()}
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    borderRadius: theme.borderRadius.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  groupContainer: {
    flex: 0,
    alignItems: 'center',
  },
  extinctGroupContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  threatenedGroupContainer: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  leastConcernGroupContainer: {
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
    marginRight: -theme.spacing.xs,
  },
  groupLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  categoriesInGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    top: '50%',
    height: 1,
    backgroundColor: isDark ? COLORS.gray600 : COLORS.gray300,
    transform: [{ translateY: -0.5 }],
    zIndex: 0,
  },
  statusCircle: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  statusCode: {
    textAlign: 'center',
  },
  ringIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 9999,
    zIndex: 2,
  },
  attribution: {
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  statusInfoContainer: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginHorizontal: -theme.spacing.sm,
    borderWidth: 1,
  },
  statusInfoTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    lineHeight: 20,
  },
  statusInfoContent: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  statusInfoDescription: {
    fontSize: theme.typography.sm,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
});

export default ConservationStatusChart;