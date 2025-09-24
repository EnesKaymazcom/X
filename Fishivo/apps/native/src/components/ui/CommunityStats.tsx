import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
// import * as Progress from 'react-native-progress'; // Removed due to animation issues

interface CommunityStatsData {
  good_eating_yes: number;
  good_eating_no: number;
  good_eating_total: number;
  good_fight_yes: number;
  good_fight_no: number;
  good_fight_total: number;
  hard_to_catch_yes: number;
  hard_to_catch_no: number;
  hard_to_catch_total: number;
  total_contributors: number;
}

interface CommunityStatsProps {
  stats: CommunityStatsData | null;
  locale: string;
}

interface StatCardProps {
  icon: string;
  title: string;
  yesCount: number;
  noCount: number;
  totalCount: number;
  locale: string;
  theme: Theme;
  isDark: boolean;
  getPercentage: (yes: number, total: number) => number;
  getResultBadge: (yesCount: number, noCount: number) => React.ReactElement;
  t: (key: string) => string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  yesCount, 
  noCount, 
  totalCount,
  locale,
  theme,
  isDark,
  getPercentage,
  getResultBadge,
  t
}) => {
  const styles = createStyles(theme, isDark);
  const yesPercent = getPercentage(yesCount, totalCount);
  
  return (
    <View style={styles.statCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Icon name={icon} size={14} color={theme.colors.textSecondary} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {getResultBadge(yesCount, noCount)}
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.progressRow}>
          <View style={styles.progressInfo}>
            <View style={styles.progressLabel}>
              <Icon name="check" size={10} color="#10B981" />
              <Text style={styles.progressLabelText}>
                {t('common.yes')} ({yesPercent}%)
              </Text>
            </View>
            <Text style={styles.progressCount}>{yesCount}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFillYes, 
                  { 
                    width: `${yesPercent}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.progressRow}>
          <View style={styles.progressInfo}>
            <View style={styles.progressLabel}>
              <Icon name="x" size={10} color="#DC2626" />
              <Text style={styles.progressLabelText}>
                {t('common.no')} ({100 - yesPercent}%)
              </Text>
            </View>
            <Text style={styles.progressCount}>{noCount}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackgroundNo}>
              <View 
                style={[
                  styles.progressBarFillNo, 
                  { 
                    width: `${100 - yesPercent}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.responseDivider} />
        <Text style={styles.responseCount}>
          {totalCount} {t('fishSpecies.communityStats.responses')}
        </Text>
      </View>
    </View>
  );
};

const CommunityStats: React.FC<CommunityStatsProps> = ({ stats, locale }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  if (!stats || stats.total_contributors === 0) {
    return null;
  }

  const getPercentage = (yes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((yes / total) * 100);
  };

  const getResultBadge = (yesCount: number, noCount: number) => {
    if (yesCount > noCount) {
      return (
        <View style={styles.resultBadgeYes}>
          <Icon name="check" size={10} color="#FFFFFF" />
          <Text style={styles.resultBadgeTextWhite}>
            {t('common.yes')}
          </Text>
        </View>
      );
    } else if (noCount > yesCount) {
      return (
        <View style={styles.resultBadgeNo}>
          <Icon name="x" size={10} color="#FFFFFF" />
          <Text style={styles.resultBadgeTextWhite}>
            {t('common.no')}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.resultBadgeMixed}>
          <Icon name="help-circle" size={10} color={theme.colors.textSecondary} />
          <Text style={styles.resultBadgeText}>
            {t('fishSpecies.communityStats.mixed')}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader 
          title={t('fishSpecies.communityStats.title')}
          subtitle={t('fishSpecies.communityStats.subtitle')}
          style={styles.sectionHeaderFlex}
        />
        <View style={styles.contributorsBadge}>
          <Icon name="users" size={10} color={theme.colors.primary} />
          <Text style={styles.contributorsText}>
            {stats.total_contributors} {t('fishSpecies.communityStats.contributors')}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsGrid}>
        <StatCard
          icon="utensils"
          title={t('fishSpecies.communityStats.questions.goodEating')}
          yesCount={stats.good_eating_yes}
          noCount={stats.good_eating_no}
          totalCount={stats.good_eating_total}
          locale={locale}
          theme={theme}
          isDark={isDark}
          getPercentage={getPercentage}
          getResultBadge={getResultBadge}
          t={t}
        />
        
        <StatCard
          icon="zap"
          title={t('fishSpecies.communityStats.questions.goodFight')}
          yesCount={stats.good_fight_yes}
          noCount={stats.good_fight_no}
          totalCount={stats.good_fight_total}
          locale={locale}
          theme={theme}
          isDark={isDark}
          getPercentage={getPercentage}
          getResultBadge={getResultBadge}
          t={t}
        />
        
        <StatCard
          icon="target"
          title={t('fishSpecies.communityStats.questions.hardToCatch')}
          yesCount={stats.hard_to_catch_yes}
          noCount={stats.hard_to_catch_no}
          totalCount={stats.hard_to_catch_total}
          locale={locale}
          theme={theme}
          isDark={isDark}
          getPercentage={getPercentage}
          getResultBadge={getResultBadge}
          t={t}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  sectionHeaderFlex: {
    flex: 1,
  },
  contributorsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
  },
  contributorsText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    gap: theme.spacing.sm,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  resultBadgeYes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#10B981',
  },
  resultBadgeNo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#DC2626',
  },
  resultBadgeMixed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text,
  },
  resultBadgeTextWhite: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressRow: {
    gap: theme.spacing.xs,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressLabelText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  progressCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarBackgroundNo: {
    height: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressBarFillYes: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  progressBarFillNo: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  responseDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  responseCount: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default CommunityStats;