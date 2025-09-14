"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Video,
  Wifi,
  WifiOff,
  Download,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Settings,
  AlertCircle,
  Eye,
  Calendar,
  Clock
} from "lucide-react"

export default function CamerasPage() {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid")
  const [isMuted, setIsMuted] = useState(true)

  // Demo camera data
  const cameras = [
    {
      id: "1",
      vehicleName: "Mercedes Actros",
      vehiclePlate: "34 ABC 123",
      cameras: [
        { id: "front", name: "Ön Kamera", status: "online", quality: "1080p" },
        { id: "back", name: "Arka Kamera", status: "online", quality: "720p" },
        { id: "driver", name: "Sürücü Kamerası", status: "online", quality: "1080p" },
        { id: "cargo", name: "Kargo Kamerası", status: "offline", quality: "720p" }
      ]
    },
    {
      id: "2",
      vehicleName: "Volvo FH16",
      vehiclePlate: "06 DEF 456",
      cameras: [
        { id: "front", name: "Ön Kamera", status: "online", quality: "4K" },
        { id: "back", name: "Arka Kamera", status: "online", quality: "1080p" },
        { id: "driver", name: "Sürücü Kamerası", status: "online", quality: "1080p" },
        { id: "side", name: "Yan Kamera", status: "online", quality: "720p" }
      ]
    },
    {
      id: "3",
      vehicleName: "Scania R450",
      vehiclePlate: "35 GHI 789",
      cameras: [
        { id: "front", name: "Ön Kamera", status: "offline", quality: "1080p" },
        { id: "back", name: "Arka Kamera", status: "offline", quality: "720p" },
        { id: "driver", name: "Sürücü Kamerası", status: "offline", quality: "1080p" },
        { id: "cargo", name: "Kargo Kamerası", status: "offline", quality: "720p" }
      ]
    }
  ]

  const aiDetections = [
    { id: 1, type: "Yorgun Sürüş", time: "10:32", vehicle: "Mercedes Actros", severity: "high" },
    { id: 2, type: "Telefon Kullanımı", time: "11:15", vehicle: "Volvo FH16", severity: "medium" },
    { id: 3, type: "Şerit İhlali", time: "12:45", vehicle: "Mercedes Actros", severity: "low" },
    { id: 4, type: "Takip Mesafesi", time: "13:20", vehicle: "Scania R450", severity: "medium" },
    { id: 5, type: "Hız İhlali", time: "14:05", vehicle: "Volvo FH16", severity: "high" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kamera Yönetimi</h1>
          <p className="text-muted-foreground">3D AI kamera sistemlerini yönetin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Izgara Görünüm</SelectItem>
              <SelectItem value="single">Tekli Görünüm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Canlı Görüntü</TabsTrigger>
          <TabsTrigger value="recordings">Kayıtlar</TabsTrigger>
          <TabsTrigger value="ai-detections">AI Algılamalar</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cameras.map(vehicle => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vehicle.vehicleName}</CardTitle>
                      <CardDescription>{vehicle.vehiclePlate}</CardDescription>
                    </div>
                    <Badge variant={
                      vehicle.cameras.every(c => c.status === "online") ? "default" : "secondary"
                    }>
                      {vehicle.cameras.filter(c => c.status === "online").length}/{vehicle.cameras.length} Aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.cameras.map(camera => (
                      <div
                        key={camera.id}
                        className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => setSelectedCamera(`${vehicle.id}-${camera.id}`)}
                      >
                        {camera.status === "online" ? (
                          <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Video className="h-8 w-8 text-white/50" />
                            </div>
                            <div className="absolute top-1 left-1">
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                CANLI
                              </Badge>
                            </div>
                            <div className="absolute bottom-1 right-1">
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                {camera.quality}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                            <WifiOff className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Çevrimdışı</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1">
                          <div className="text-xs truncate">{camera.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button size="sm" variant="outline" className="flex-1 mr-1">
                      <Eye className="mr-1 h-3 w-3" />
                      İzle
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 ml-1">
                      <Download className="mr-1 h-3 w-3" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Kayıtlı Videolar</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input type="date" className="w-40" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Mercedes Actros - Ön Kamera</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString("tr-TR")} • 2 saat 15 dakika • 1.2 GB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-detections" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Algılama</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">Bugün +12% artış</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kritik Uyarılar</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Acil müdahale gerekli</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yorgun Sürüş</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Son 24 saat</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Güvenlik Skoru</CardTitle>
                <Badge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Ortalama skor</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Son AI Algılamalar</CardTitle>
              <CardDescription>Yapay zeka tarafından tespit edilen olaylar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiDetections.map(detection => (
                  <div key={detection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          detection.severity === "high" ? "destructive" :
                          detection.severity === "medium" ? "secondary" : "outline"
                        }
                      >
                        {detection.severity === "high" ? "Kritik" :
                         detection.severity === "medium" ? "Orta" : "Düşük"}
                      </Badge>
                      <div>
                        <div className="font-medium">{detection.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {detection.vehicle} • {detection.time}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Görüntüle
                    </Button>
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