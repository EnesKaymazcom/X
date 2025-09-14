"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Clock,
  Users,
  Truck,
  Route,
  Fuel
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Legend } from "recharts"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [selectedVehicle, setSelectedVehicle] = useState("all")

  // Chart data
  const weeklyPerformanceData = [
    { day: "Pzt", mesafe: 450, yakıt: 120, sefer: 8 },
    { day: "Sal", mesafe: 380, yakıt: 95, sefer: 6 },
    { day: "Çar", mesafe: 520, yakıt: 140, sefer: 9 },
    { day: "Per", mesafe: 480, yakıt: 125, sefer: 8 },
    { day: "Cum", mesafe: 390, yakıt: 100, sefer: 7 },
    { day: "Cmt", mesafe: 280, yakıt: 75, sefer: 5 },
    { day: "Paz", mesafe: 150, yakıt: 40, sefer: 3 },
  ]

  const fuelEfficiencyData = [
    { name: "Mercedes Actros", value: 35, fill: "#3b82f6" },
    { name: "Volvo FH16", value: 30, fill: "#22c55e" },
    { name: "Scania R450", value: 35, fill: "#f59e0b" },
  ]

  const dailyActivityData = [
    { hour: "00:00", aktivite: 20 },
    { hour: "03:00", aktivite: 15 },
    { hour: "06:00", aktivite: 45 },
    { hour: "09:00", aktivite: 85 },
    { hour: "12:00", aktivite: 70 },
    { hour: "15:00", aktivite: 90 },
    { hour: "18:00", aktivite: 75 },
    { hour: "21:00", aktivite: 40 },
  ]

  // Demo data
  const summaryStats = [
    {
      title: "Toplam Mesafe",
      value: "45,234 km",
      change: "+12%",
      trend: "up",
      icon: Route
    },
    {
      title: "Yakıt Tüketimi",
      value: "3,456 L",
      change: "-5%",
      trend: "down",
      icon: Fuel
    },
    {
      title: "Aktif Sürücüler",
      value: "24",
      change: "+2",
      trend: "up",
      icon: Users
    },
    {
      title: "Güvenlik Skoru",
      value: "87%",
      change: "+3%",
      trend: "up",
      icon: AlertTriangle
    }
  ]

  const vehicleReports = [
    {
      id: 1,
      vehicle: "Mercedes Actros",
      plate: "34 ABC 123",
      driver: "Ahmet Yılmaz",
      distance: "2,345 km",
      fuel: "345 L",
      violations: 3,
      score: 92
    },
    {
      id: 2,
      vehicle: "Volvo FH16",
      plate: "06 DEF 456",
      driver: "Mehmet Demir",
      distance: "1,890 km",
      fuel: "280 L",
      violations: 1,
      score: 95
    },
    {
      id: 3,
      vehicle: "Scania R450",
      plate: "35 GHI 789",
      driver: "Can Özkan",
      distance: "3,120 km",
      fuel: "420 L",
      violations: 5,
      score: 78
    }
  ]

  const aiReports = [
    { type: "Yorgun Sürüş", count: 15, percentage: 35 },
    { type: "Telefon Kullanımı", count: 8, percentage: 20 },
    { type: "Şerit İhlali", count: 12, percentage: 28 },
    { type: "Hız İhlali", count: 7, percentage: 17 }
  ]

  const scheduledReports = [
    { id: 1, name: "Haftalık Performans Raporu", frequency: "Haftalık", nextRun: "Pazartesi 09:00", recipients: 3 },
    { id: 2, name: "Aylık Yakıt Raporu", frequency: "Aylık", nextRun: "1 Ocak 2025", recipients: 5 },
    { id: 3, name: "Güvenlik Özeti", frequency: "Günlük", nextRun: "Yarın 08:00", recipients: 8 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">Detaylı analiz ve raporlar</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
              <SelectItem value="year">Bu Yıl</SelectItem>
              <SelectItem value="custom">Özel</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrele
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                {" "}önceki döneme göre
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="vehicles">Araç Raporları</TabsTrigger>
          <TabsTrigger value="ai">AI Analizleri</TabsTrigger>
          <TabsTrigger value="scheduled">Zamanlanmış</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Haftalık Performans</CardTitle>
                <CardDescription>Son 7 günlük performans grafiği</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    mesafe: {
                      label: "Mesafe (km)",
                      color: "hsl(var(--chart-1))",
                    },
                    yakıt: {
                      label: "Yakıt (L)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="mesafe"
                        fill="hsl(var(--chart-1))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="yakıt"
                        fill="hsl(var(--chart-2))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yakıt Verimliliği</CardTitle>
                <CardDescription>Araç başına yakıt tüketimi</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Yakıt Tüketimi",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={fuelEfficiencyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fuelEfficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Günlük Aktivite</CardTitle>
                <CardDescription>24 saatlik hareket özeti</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    aktivite: {
                      label: "Aktivite",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="hour"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="aktivite"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sürücü Performansı</CardTitle>
                <CardDescription>En iyi performans gösteren sürücüler</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    puan: {
                      label: "Performans Puanı",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Ahmet Y.", puan: 92 },
                        { name: "Mehmet D.", puan: 88 },
                        { name: "Can Ö.", puan: 85 },
                        { name: "Ali K.", puan: 90 },
                        { name: "Veli A.", puan: 87 },
                      ]}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="puan"
                        fill="hsl(var(--chart-4))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Araç Performans Raporu</CardTitle>
                  <CardDescription>Detaylı araç bazlı analiz</CardDescription>
                </div>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Araçlar</SelectItem>
                    <SelectItem value="1">Mercedes Actros</SelectItem>
                    <SelectItem value="2">Volvo FH16</SelectItem>
                    <SelectItem value="3">Scania R450</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Araç</TableHead>
                    <TableHead>Sürücü</TableHead>
                    <TableHead>Mesafe</TableHead>
                    <TableHead>Yakıt</TableHead>
                    <TableHead>İhlaller</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.vehicle}</div>
                          <div className="text-sm text-muted-foreground">{report.plate}</div>
                        </div>
                      </TableCell>
                      <TableCell>{report.driver}</TableCell>
                      <TableCell>{report.distance}</TableCell>
                      <TableCell>{report.fuel}</TableCell>
                      <TableCell>
                        <Badge variant={report.violations > 3 ? "destructive" : "secondary"}>
                          {report.violations}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.score > 90 ? "default" : report.score > 80 ? "secondary" : "destructive"}>
                          {report.score}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          Detay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Tespit Dağılımı</CardTitle>
                <CardDescription>Kategori bazında tespit oranları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiReports.map((report, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{report.type}</span>
                        <span className="font-medium">{report.count} tespit</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${report.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Trendleri</CardTitle>
                <CardDescription>Son 30 günlük güvenlik analizi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Genel Güvenlik Skoru</span>
                    <Badge>87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kritik Olaylar</span>
                    <Badge variant="destructive">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">İyileşme Oranı</span>
                    <Badge variant="secondary">+15%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Seviyesi</span>
                    <Badge variant="secondary">Orta</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Zamanlanmış Raporlar</CardTitle>
                  <CardDescription>Otomatik rapor gönderimleri</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Rapor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.frequency} • Sonraki: {report.nextRun} • {report.recipients} alıcı
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">Düzenle</Button>
                      <Button size="sm" variant="outline">Durdur</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add missing import for Plus icon
import { Plus } from "lucide-react"