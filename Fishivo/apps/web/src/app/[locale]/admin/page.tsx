'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AdminQuickAction } from '@/components/admin/admin-quick-action';
import { AdminActivityItem } from '@/components/admin/admin-activity-item';
import { AdminStatusItem } from '@/components/admin/admin-status-item';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Crown, 
  TrendingUp, 
  Calendar,
  Activity,
  BarChart3,
  UserCheck,
  MessageSquare,
  Fish,
  MapPin,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  pendingReports: number;
  proUsers: number;
  newUsersToday: number;
  postsToday: number;
  reportsToday: number;
}

export default function AdminPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  
  // Statik örnek veriler
  const stats: DashboardStats = {
    totalUsers: 1234,
    activeUsers: 876,
    totalPosts: 5678,
    pendingReports: 12,
    proUsers: 234,
    newUsersToday: 45,
    postsToday: 123,
    reportsToday: 5,
  };
  
  const loading = false;
  const error = null;

  const handleLogout = () => {
    router.push(`/${locale}`);
  };

  const statCards = [
    {
      title: t('admin.dashboard.totalUsers'),
      value: stats?.totalUsers || 0,
      icon: Users,
      description: t('admin.dashboard.totalUsersDesc'),
    },
    {
      title: t('admin.dashboard.activeUsers'),
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      description: t('admin.dashboard.activeUsersDesc'),
    },
    {
      title: t('admin.dashboard.totalPosts'),
      value: stats?.totalPosts || 0,
      icon: FileText,
      description: t('admin.dashboard.totalPostsDesc'),
    },
    {
      title: t('admin.dashboard.pendingReports'),
      value: stats?.pendingReports || 0,
      icon: AlertTriangle,
      description: t('admin.dashboard.pendingReportsDesc'),
    },
    {
      title: t('admin.dashboard.proMembers'),
      value: stats?.proUsers || 0,
      icon: Crown,
      description: t('admin.dashboard.proMembersDesc'),
    },
    {
      title: t('admin.dashboard.joinedToday'),
      value: stats?.newUsersToday || 0,
      icon: TrendingUp,
      description: t('admin.dashboard.joinedTodayDesc'),
    },
    {
      title: t('admin.dashboard.todaysPosts'),
      value: stats?.postsToday || 0,
      icon: Calendar,
      description: t('admin.dashboard.todaysPostsDesc'),
    },
    {
      title: t('admin.dashboard.todaysReports'),
      value: stats?.reportsToday || 0,
      icon: Activity,
      description: t('admin.dashboard.todaysReportsDesc'),
    },
  ];

  const quickActions = [
    {
      title: t('admin.dashboard.usersManagement'),
      description: t('admin.dashboard.usersDescription'),
      icon: Users,
      href: `/${locale}/admin/users`,
    },
    {
      title: t('admin.dashboard.postsManagement'),
      description: t('admin.dashboard.postsDescription'),
      icon: FileText,
      href: `/${locale}/admin/posts`,
    },
    {
      title: t('admin.dashboard.reportsManagement'),
      description: t('admin.dashboard.reportsDescription'),
      icon: AlertTriangle,
      href: `/${locale}/admin/reports`,
    },
    {
      title: t('admin.dashboard.fishSpecies'),
      description: t('admin.dashboard.speciesDescription'),
      icon: Fish,
      href: `/${locale}/admin/species`,
    },
    {
      title: t('admin.dashboard.fishingTechniques'),
      description: t('admin.dashboard.fishingTechniquesDescription'),
      icon: Fish,
      href: `/${locale}/admin/fishing-techniques`,
    },
    {
      title: t('admin.dashboard.spotsManagement'),
      description: t('admin.dashboard.spotsDescription'),
      icon: MapPin,
      href: `/${locale}/admin/spots`,
    },
    {
      title: t('admin.dashboard.systemSettings'),
      description: t('admin.dashboard.systemSettingsDescription'),
      icon: Settings,
      href: `/${locale}/admin/settings`,
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <AdminPageHeader 
          title={t('admin.dashboard.dashboard')}
          description={t('admin.dashboard.dashboardDescription')}
          actions={
            <>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('admin.dashboard.refresh')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('admin.dashboard.logout')}
              </Button>
            </>
          }
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <AdminStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              loading={loading}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('admin.dashboard.quickActions')}
            </CardTitle>
            <CardDescription>
              {t('admin.dashboard.quickActionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <AdminQuickAction
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('admin.dashboard.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AdminActivityItem
                  title={t('admin.dashboard.newUserRegistration')}
                  time={`2 ${t('admin.dashboard.minutesAgo')}`}
                  badge={{ text: t('admin.dashboard.badgeNew'), variant: "secondary" }}
                />
                <AdminActivityItem
                  title={t('admin.dashboard.newCatchShared')}
                  time={`5 ${t('admin.dashboard.minutesAgo')}`}
                  badge={{ text: t('admin.dashboard.badgePost'), variant: "outline" }}
                />
                <AdminActivityItem
                  title={t('admin.dashboard.newReportReceived')}
                  time={`10 ${t('admin.dashboard.minutesAgo')}`}
                  badge={{ text: t('admin.dashboard.badgeReport'), variant: "destructive" }}
                  dotColor="destructive"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('admin.dashboard.systemStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AdminStatusItem 
                  label={t('admin.dashboard.serverStatus')} 
                  value={t('admin.dashboard.serverOnline')} 
                />
                <AdminStatusItem 
                  label={t('admin.dashboard.databaseStatus')} 
                  value={t('admin.dashboard.databaseNormal')} 
                />
                <AdminStatusItem 
                  label={t('admin.dashboard.apiStatus')} 
                  value={t('admin.dashboard.apiActive')} 
                />
                <AdminStatusItem 
                  label={t('admin.dashboard.lastBackup')} 
                  value={`2 ${t('admin.dashboard.hoursAgo')}`} 
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}