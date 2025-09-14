"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapView } from "@/components/dashboard/map-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MapPin,
  Navigation,
  Gauge,
  Clock,
  Battery,
  Signal,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Maximize2
} from "lucide-react"

export default function LiveTrackingPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("5")

  // Demo data
  const vehicles = [
    {
      id: "1",
      name: "Mercedes Actros",
      plate: "34 ABC 123",
      status: "online",
      speed: 65,
      driver: "Ahmet Yılmaz",
      route: "İstanbul - Ankara",
      battery: 85,
      signal: 4,
      lastUpdate: "2 saniye önce",
      location: { lat: 41.0082, lng: 28.9784 }
    },
    {
      id: "2",
      name: "Volvo FH16",
      plate: "06 DEF 456",
      status: "idle",
      speed: 0,
      driver: "Mehmet Demir",
      route: "Ankara - İzmir",
      battery: 92,
      signal: 5,
      lastUpdate: "15 saniye önce",
      location: { lat: 39.9334, lng: 32.8597 }
    },
    {
      id: "3",
      name: "Scania R450",
      plate: "35 GHI 789",
      status: "offline",
      speed: 0,
      driver: "Can Özkan",
      route: "İzmir - Antalya",
      battery: 45,
      signal: 2,
      lastUpdate: "5 dakika önce",
      location: { lat: 38.4237, lng: 27.1428 }
    }
  ]

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        console.log("Updating vehicle positions...")
      }, parseInt(refreshInterval) * 1000)

      return () => clearInterval(interval)
    }
  }, [isTracking, refreshInterval])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Canlı İzleme</h1>
          <p className="text-muted-foreground">Araçları gerçek zamanlı takip edin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 saniye</SelectItem>
              <SelectItem value="5">5 saniye</SelectItem>
              <SelectItem value="10">10 saniye</SelectItem>
              <SelectItem value="30">30 saniye</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={isTracking ? "default" : "outline"}
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Durdur
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Başlat
              </>
            )}
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Yenile
          </Button>
          <Button variant="outline">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full h-[calc(100vh-12rem)]">
        <MapView />
      </div>
    </div>
  )
}