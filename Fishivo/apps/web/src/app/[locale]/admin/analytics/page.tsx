'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { 
  BarChart3,
  Users,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  AlertTriangle,
  Fish,
  MapPin,
  MessageCircle,
  Heart,
  Share2,
  Filter
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { TypographyH2, TypographyH3, TypographyLarge, TypographySmall, TypographyMuted } from '@/lib/typography';

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number; activeUsers: number }>;
  postActivity: Array<{ date: string; posts: number; comments: number; likes: number }>;
  userTypes: Array<{ type: string; count: number; color: string }>;
  topSpecies: Array<{ species: string; posts: number; likes: number }>;
  engagement: Array<{ week: string; posts: number; comments: number; likes: number; shares: number }>;
  demographics: Array<{ age: string; users: number }>;
}

export default function AnalyticsPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  const chartConfig = {
    users: { label: t('admin.users'), color: 'hsl(var(--chart-1))' },
    activeUsers: { label: t('admin.analytics.metrics.activeUsers'), color: 'hsl(var(--chart-2))' },
    posts: { label: t('admin.posts'), color: 'hsl(var(--chart-3))' },
    comments: { label: t('admin.comments'), color: 'hsl(var(--chart-4))' },
    likes: { label: t('admin.likes'), color: 'hsl(var(--chart-5))' },
    shares: { label: t('profile.shareBtn'), color: 'hsl(var(--chart-1))' },
  };


  useEffect(() => { fetchAnalytics(); }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - replace with real API
      // Localized month names
      const months = [
        t('admin.analytics.months.january'),
        t('admin.analytics.months.february'),
        t('admin.analytics.months.march'),
        t('admin.analytics.months.april'),
        t('admin.analytics.months.may'),
        t('admin.analytics.months.june')
      ];
        
      const mockData: AnalyticsData = {
        userGrowth: [
          { month: months[0], users: 1200, activeUsers: 980 },
          { month: months[1], users: 1450, activeUsers: 1180 },
          { month: months[2], users: 1680, activeUsers: 1320 },
          { month: months[3], users: 1920, activeUsers: 1580 },
          { month: months[4], users: 2180, activeUsers: 1820 },
          { month: months[5], users: 2450, activeUsers: 2100 },
        ],
        postActivity: [
          { date: t('admin.analytics.dateFormat', { day: '1', month: months[5] }), posts: 45, comments: 180, likes: 520 },
          { date: t('admin.analytics.dateFormat', { day: '2', month: months[5] }), posts: 52, comments: 210, likes: 680 },
          { date: t('admin.analytics.dateFormat', { day: '3', month: months[5] }), posts: 38, comments: 165, likes: 420 },
          { date: t('admin.analytics.dateFormat', { day: '4', month: months[5] }), posts: 61, comments: 245, likes: 780 },
          { date: t('admin.analytics.dateFormat', { day: '5', month: months[5] }), posts: 48, comments: 192, likes: 610 },
          { date: t('admin.analytics.dateFormat', { day: '6', month: months[5] }), posts: 55, comments: 220, likes: 720 },
          { date: t('admin.analytics.dateFormat', { day: '7', month: months[5] }), posts: 42, comments: 168, likes: 580 },
        ],
        userTypes: [
          { type: t('admin.analytics.userTypes.free'), count: 1850, color: '#8884d8' },
          { type: t('admin.pro'), count: 420, color: '#82ca9d' },
          { type: t('admin.admin'), count: 25, color: '#ffc658' },
        ],
        topSpecies: [
          { species: t('fish.seabass'), posts: 285, likes: 1240 },
          { species: t('fish.seabream'), posts: 198, likes: 890 },
          { species: t('fish.mullet'), posts: 156, likes: 720 },
          { species: t('fish.bluefish'), posts: 134, likes: 610 },
          { species: t('fish.redmullet'), posts: 98, likes: 450 },
        ],
        engagement: [
          { week: t('admin.analytics.week', { number: '1' }), posts: 320, comments: 1280, likes: 3200, shares: 160 },
          { week: t('admin.analytics.week', { number: '2' }), posts: 385, comments: 1540, likes: 3850, shares: 192 },
          { week: t('admin.analytics.week', { number: '3' }), posts: 290, comments: 1160, likes: 2900, shares: 145 },
          { week: t('admin.analytics.week', { number: '4' }), posts: 425, comments: 1700, likes: 4250, shares: 212 },
        ],
        demographics: [
          { age: '18-25', users: 680 },
          { age: '26-35', users: 920 },
          { age: '36-45', users: 540 },
          { age: '46-55', users: 280 },
          { age: '55+', users: 125 },
        ],
      };
      setData(mockData);
      setError(null);
    } catch (err: any) {
      setError(err.message || t('admin.analytics.error'));
    } finally {
      setLoading(false);
    }
  };

  const summaryStats = [
    { title: t('admin.analytics.metrics.totalUsers'), value: '2,450', change: '+12.5%', trend: 'up', icon: Users, description: t('admin.analytics.last30Days') },
    { title: t('admin.analytics.metrics.activeUsers'), value: '2,100', change: '+8.2%', trend: 'up', icon: Eye, description: t('admin.analytics.thisMonth') },
    { title: t('admin.analytics.metrics.totalPosts'), value: '8,542', change: '+15.3%', trend: 'up', icon: FileText, description: t('admin.analytics.allTime') },
    { title: t('admin.analytics.metrics.averageEngagement'), value: '68.4%', change: '-2.1%', trend: 'down', icon: Heart, description: t('admin.analytics.average') },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminPageHeader
          title={t('admin.analytics.title')}
          description={t('admin.analytics.description')}
          actions={
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="7d">{t('admin.analytics.last7Days')}</option>
                <option value="30d">{t('admin.analytics.last30Days')}</option>
                <option value="90d">{t('admin.analytics.last90Days')}</option>
                <option value="1y">{t('admin.analytics.lastYear')}</option>
              </select>
              <LoadingButton variant="outline" onClick={fetchAnalytics} loading={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />{t('admin.logs.actions.refresh')}
              </LoadingButton>
              <LoadingButton variant="outline">
                <Download className="h-4 w-4 mr-2" />{t('admin.analytics.export')}
              </LoadingButton>
            </div>
          }
        />
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">{t('admin.analytics.loadingData')}</div>
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <TypographyLarge>{stat.value}</TypographyLarge>
                          <TypographySmall className="text-muted-foreground">{stat.title}</TypographySmall>
                          <div className="flex items-center gap-1 mt-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
                            <TypographySmall>{stat.description}</TypographySmall>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{t('admin.analytics.charts.userGrowth')}</CardTitle>
                  <CardDescription>{t('admin.analytics.userGrowthDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={data.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="var(--color-users)" fill="var(--color-users)" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="activeUsers" stackId="2" stroke="var(--color-activeUsers)" fill="var(--color-activeUsers)" fillOpacity={0.6} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />{t('admin.analytics.charts.userTypes')}</CardTitle>
                  <CardDescription>{t('admin.analytics.userTypesDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie data={data.userTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="count">
                        {data.userTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{t('admin.analytics.charts.postActivity')}</CardTitle>
                <CardDescription>{t('admin.analytics.postActivityDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <LineChart data={data.postActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Line type="monotone" dataKey="posts" stroke="var(--color-posts)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="comments" stroke="var(--color-comments)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="likes" stroke="var(--color-likes)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Fish className="h-5 w-5" />{t('admin.analytics.charts.topSpecies')}</CardTitle>
                  <CardDescription>{t('admin.analytics.topSpeciesDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={data.topSpecies} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="species" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="posts" fill="var(--color-posts)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" />{t('admin.analytics.charts.engagement')}</CardTitle>
                  <CardDescription>{t('admin.analytics.engagementDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={data.engagement}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="posts" fill="var(--color-posts)" />
                      <Bar dataKey="comments" fill="var(--color-comments)" />
                      <Bar dataKey="likes" fill="var(--color-likes)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{t('admin.analytics.charts.ageDemographics')}</CardTitle>
                <CardDescription>{t('admin.analytics.ageDemographicsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data.demographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <TypographyLarge>12,847</TypographyLarge>
                      <TypographySmall className="text-muted-foreground">{t('admin.analytics.metrics.totalComments')}</TypographySmall>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />+18.2% {t('admin.analytics.thisMonth')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <TypographyLarge>342</TypographyLarge>
                      <TypographySmall className="text-muted-foreground">{t('admin.analytics.activeSpots')}</TypographySmall>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />+5.8% {t('admin.analytics.thisMonth')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Share2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <TypographyLarge>2,156</TypographyLarge>
                      <TypographySmall className="text-muted-foreground">{t('admin.analytics.shares')}</TypographySmall>
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />-3.2% {t('admin.analytics.thisMonth')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}