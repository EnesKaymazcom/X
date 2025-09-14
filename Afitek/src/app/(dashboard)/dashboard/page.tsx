"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapView } from "@/components/dashboard/map-view"
import { VehicleList } from "@/components/dashboard/vehicle-list"
import { AlertsList } from "@/components/dashboard/alerts-list"
import { StatsCards } from "@/components/dashboard/stats-cards"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Araç takip sistemi genel görünüm</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[670px]">
          <MapView />
        </div>

        <div className="space-y-6">
          <Card className="h-[335px]">
            <CardHeader>
              <CardTitle>Araç Durumu</CardTitle>
              <CardDescription>Çevrimiçi araçlar</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleList />
            </CardContent>
          </Card>

          <Card className="h-[335px]">
            <CardHeader>
              <CardTitle>Son Uyarılar</CardTitle>
              <CardDescription>Aktif alarm ve bildirimler</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsList />
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Araçlar</TabsTrigger>
          <TabsTrigger value="drivers">Sürücüler</TabsTrigger>
          <TabsTrigger value="routes">Rotalar</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Araç Listesi</CardTitle>
              <CardDescription>Tüm araçların detaylı listesi</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleList detailed />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Sürücü Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Sürücü bilgileri yakında eklenecek</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Rota Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rota bilgileri yakında eklenecek</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Raporlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Raporlama modülü yakında eklenecek</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}