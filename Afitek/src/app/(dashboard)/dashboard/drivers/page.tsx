"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { User, Search, Plus, Eye, Edit, Trash2, Phone, Mail, Car, Star } from "lucide-react"
import { db } from "@/lib/mock-data"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const data = await db.drivers.findAll()
      setDrivers(data)
    } catch (error) {
      console.error("Error fetching drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Aktif</Badge>
      case "on_trip":
        return <Badge>Seferde</Badge>
      case "resting":
        return <Badge variant="secondary">Dinleniyor</Badge>
      case "off_duty":
        return <Badge variant="outline">Görev Dışı</Badge>
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sürücü Yönetimi</h1>
          <p className="text-muted-foreground">Tüm sürücüleri görüntüle ve yönet</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sürücü Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sürücü Ekle</DialogTitle>
              <DialogDescription>
                Sisteme yeni sürücü kaydedin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" placeholder="Örn: Ahmet Yılmaz" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Ehliyet No</Label>
                <Input id="license" placeholder="Örn: 34ABC12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" placeholder="Örn: +90 532 123 4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="Örn: surucu@afitek.com" />
              </div>
              <Button className="w-full">Kaydet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sürücü</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı sürücü</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Sürücü</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.filter(d => d.status === "active" || d.status === "on_trip").length}
            </div>
            <p className="text-xs text-muted-foreground">Şu an görevde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">Performans puanı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sefer</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,999</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sürücü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sürücü</TableHead>
                  <TableHead>Ehliyet No</TableHead>
                  <TableHead>Araç</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Deneyim</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Toplam Mesafe</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-muted-foreground">{driver.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>
                      {driver.vehicleName !== "-" ? (
                        <div>
                          <div className="text-sm">{driver.vehicleName}</div>
                          <div className="text-xs text-muted-foreground">{driver.vehiclePlate}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Atanmamış</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(driver.status)}</TableCell>
                    <TableCell>{driver.experience}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{driver.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{driver.totalDistance}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDriver(driver)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Driver Detail Dialog */}
      {selectedDriver && (
        <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedDriver.name}</DialogTitle>
              <DialogDescription>Sürücü Detayları</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ehliyet No</Label>
                  <p className="font-medium">{selectedDriver.licenseNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Deneyim</Label>
                  <p className="font-medium">{selectedDriver.experience}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefon</Label>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">E-posta</Label>
                  <p className="font-medium">{selectedDriver.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Araç</Label>
                  <p className="font-medium">
                    {selectedDriver.vehicleName !== "-"
                      ? `${selectedDriver.vehicleName} (${selectedDriver.vehiclePlate})`
                      : "Atanmamış"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Durum</Label>
                  <div className="mt-1">{getStatusBadge(selectedDriver.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Performans Puanı</Label>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{selectedDriver.rating} / 5.0</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Son Aktiflik</Label>
                  <p className="font-medium">{selectedDriver.lastActive}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">İstatistikler</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Toplam Sefer</Label>
                    <p className="font-medium text-lg">{selectedDriver.totalTrips}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Toplam Mesafe</Label>
                    <p className="font-medium text-lg">{selectedDriver.totalDistance}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Katılım Tarihi</Label>
                    <p className="font-medium text-lg">
                      {new Date(selectedDriver.joinDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}