"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/ui/page-header'
import { TypographyH1, TypographyH2, TypographyP, TypographyLead, TypographyLarge } from '@/lib/typography'
import { Download, Play, Fish, MapPin, Users, Camera, Trophy, Smartphone, Shield, Star, Zap } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default function Home() {
  const { t } = useTranslation()

  return (
    <PageContainer className="min-h-screen">
      {/* Hero Section */}
      <PageHeader>
        <div className="text-center">
          <PageHeaderHeading className="text-4xl md:text-5xl lg:text-6xl">
            Fishivo
          </PageHeaderHeading>
          <PageHeaderDescription className="text-xl max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </PageHeaderDescription>
        </div>
      </PageHeader>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <TypographyH2 className="text-3xl md:text-4xl mb-4">{t('home.features.title')}</TypographyH2>
          <TypographyP className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('home.features.subtitle')}
          </TypographyP>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Fish className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{t('home.features.catchSharing.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP>
                {t('home.features.catchSharing.description')}
              </TypographyP>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{t('home.features.locationDiscovery.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP>
                {t('home.features.locationDiscovery.description')}
              </TypographyP>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{t('home.features.socialNetwork.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP>
                {t('home.features.socialNetwork.description')}
              </TypographyP>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{t('home.features.photoGallery.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP>
                {t('home.features.photoGallery.description')}
              </TypographyP>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Trophy className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{t('home.features.achievements.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP>
                {t('home.features.achievements.description')}
              </TypographyP>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{t('home.features.weather.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP>
                {t('home.features.weather.description')}
              </TypographyP>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/30 rounded-lg">
        <div className="text-center">
          <TypographyH2 className="text-3xl md:text-4xl mb-4">
            {t('home.stats.title')}
          </TypographyH2>
          <TypographyP className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
            {t('home.stats.subtitle')}
          </TypographyP>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <TypographyH1 className="text-4xl md:text-6xl text-primary">
                75K+
              </TypographyH1>
              <TypographyLarge>{t('home.stats.activeUsers')}</TypographyLarge>
              <TypographyP className="text-sm">{t('home.stats.activeUsersDesc')}</TypographyP>
            </div>
            
            <div className="space-y-4">
              <TypographyH1 className="text-4xl md:text-6xl text-primary">
                350K+
              </TypographyH1>
              <TypographyLarge>{t('home.stats.sharedCatches')}</TypographyLarge>
              <TypographyP className="text-sm">{t('home.stats.sharedCatchesDesc')}</TypographyP>
            </div>
            
            <div className="space-y-4">
              <TypographyH1 className="text-4xl md:text-6xl text-primary">
                2.5K+
              </TypographyH1>
              <TypographyLarge>{t('home.stats.locations')}</TypographyLarge>
              <TypographyP className="text-sm">{t('home.stats.locationsDesc')}</TypographyP>
            </div>
            
        <div className="space-y-4">
              <TypographyH1 className="text-4xl md:text-6xl text-primary">
                81
              </TypographyH1>
              <TypographyLarge>{t('home.stats.cities')}</TypographyLarge>
              <TypographyP className="text-sm">{t('home.stats.citiesDesc')}</TypographyP>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Experience Section */}
      <section className="py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <TypographyH2 className="text-3xl md:text-4xl">{t('home.mobile.title')}</TypographyH2>
            <TypographyP className="text-lg text-muted-foreground">
              {t('home.mobile.subtitle')}
            </TypographyP>
            <TypographyP className="text-muted-foreground">
              {t('home.mobile.description')}
            </TypographyP>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <Smartphone className="h-8 w-8 mb-3 text-primary" />
                  <TypographyP className="font-semibold">{t('home.mobile.crossPlatform')}</TypographyP>
                  <TypographyP className="text-sm">{t('home.mobile.crossPlatformDesc')}</TypographyP>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <Zap className="h-8 w-8 mb-3 text-primary" />
                  <TypographyP className="font-semibold">{t('home.mobile.fastSecure')}</TypographyP>
                  <TypographyP className="text-sm">{t('home.mobile.fastSecureDesc')}</TypographyP>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 mb-3 text-primary" />
                  <TypographyP className="font-semibold">{t('home.mobile.privacy')}</TypographyP>
                  <TypographyP className="text-sm">{t('home.mobile.privacyDesc')}</TypographyP>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <Star className="h-8 w-8 mb-3 text-primary" />
                  <TypographyP className="font-semibold">{t('home.mobile.rating')}</TypographyP>
                  <TypographyP className="text-sm">{t('home.mobile.ratingDesc')}</TypographyP>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card className="h-[500px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="text-center">
              <Smartphone className="h-32 w-32 mx-auto mb-6 text-primary" />
              <TypographyLarge className="mb-2">
                {t('home.mobile.appInterface')}
              </TypographyLarge>
              <TypographyP className="text-sm">
                {t('home.mobile.appInterfaceDesc')}
              </TypographyP>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 mt-8">
        <Card className="bg-primary/5 border-0">
          <CardContent className="p-12 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <TypographyH2 className="text-3xl md:text-4xl mb-4">
              {t('home.cta.title')}
            </TypographyH2>
            <TypographyP className="text-lg text-muted-foreground">
              {t('home.cta.subtitle')}
            </TypographyP>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                <Download className="mr-2 h-5 w-5" />
                {t('home.cta.downloadAppStore')}
              </Button>
              <Button size="lg" className="text-lg px-8 py-6">
                <Download className="mr-2 h-5 w-5" />
                {t('home.cta.downloadGooglePlay')}
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Badge variant="outline" className="text-sm">{t('home.cta.iosCompatible')}</Badge>
              <Badge variant="outline" className="text-sm">{t('home.cta.androidCompatible')}</Badge>
              <Badge variant="outline" className="text-sm">{t('home.cta.completelyFree')}</Badge>
              <Badge variant="outline" className="text-sm">{t('home.cta.adFree')}</Badge>
              <Badge variant="outline" className="text-sm">{t('home.cta.turkishSupport')}</Badge>
            </div>
          </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  )
}
