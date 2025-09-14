"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Bell,
  BellOff,
  RefreshCw
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/lib/mock-data"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const data = await db.alerts.findAll()
      setAlerts(data)
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (id: number) => {
    try {
      await db.alerts.resolve(id)
      await fetchAlerts()
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Kritik</Badge>
      case "high":
        return <Badge>Yüksek</Badge>
      case "medium":
        return <Badge variant="secondary">Orta</Badge>
      default:
        return <Badge variant="outline">Düşük</Badge>
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "active" && alert.resolved) return false
    if (filter === "resolved" && !alert.resolved) return false
    if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !alert.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const activeAlerts = alerts.filter(a => !a.resolved)
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical")
  const highAlerts = activeAlerts.filter(a => a.severity === "high")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Uyarı Merkezi</h1>
          <p className="text-muted-foreground">Sistem uyarıları ve bildirimleri yönetin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Bildirim Ayarları
          </Button>
          <Button variant="outline" onClick={fetchAlerts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Uyarılar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Çözüm bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritik</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Acil müdahale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yüksek Öncelik</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Dikkat gerektiriyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çözümlenen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.resolved).length}</div>
            <p className="text-xs text-muted-foreground">Bugün</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Uyarı Listesi</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Uyarı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="resolved">Çözümlenen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Tüm Uyarılar</TabsTrigger>
              <TabsTrigger value="critical">Kritik</TabsTrigger>
              <TabsTrigger value="warnings">Uyarılar</TabsTrigger>
              <TabsTrigger value="info">Bilgilendirme</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-4">
              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Gösterilecek uyarı bulunamadı
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.resolved ? "opacity-60 bg-muted/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                              {alert.resolved && (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Çözümlendi
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {alert.time}
                              </span>
                              {alert.vehicleId && (
                                <span>Araç ID: {alert.vehicleId}</span>
                              )}
                              {alert.driverId && (
                                <span>Sürücü ID: {alert.driverId}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Çözümlendi
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="critical" className="space-y-2 mt-4">
              {filteredAlerts.filter(a => a.severity === "critical").map((alert) => (
                <div key={alert.id} className="p-4 border border-destructive rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Çözümle
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="warnings" className="space-y-2 mt-4">
              {filteredAlerts.filter(a => a.type === "warning").map((alert) => (
                <div key={alert.id} className="p-4 border border-yellow-500/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Çözümle
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="info" className="space-y-2 mt-4">
              {filteredAlerts.filter(a => a.type === "info").map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}