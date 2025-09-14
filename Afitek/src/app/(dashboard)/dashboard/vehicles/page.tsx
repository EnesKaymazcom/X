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
import { Car, Search, Plus, Eye, Edit, Trash2, MapPin, Gauge, Clock } from "lucide-react"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/gps/vehicles")
      const data = await response.json()
      setVehicles(data.vehicles || data.demo || [])
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Araç Yönetimi</h1>
          <p className="text-muted-foreground">Tüm araçları görüntüle ve yönet</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Araç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Araç Ekle</DialogTitle>
              <DialogDescription>
                808GPS cihazı ile yeni araç kaydedin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Araç Adı" />
              <Input placeholder="Plaka" />
              <Input placeholder="Cihaz ID (IMEI)" />
              <Button className="w-full">Kaydet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Araç ara..."
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
                  <TableHead>Araç</TableHead>
                  <TableHead>Cihaz ID</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Hız</TableHead>
                  <TableHead>Son Güncelleme</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicle.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.deviceId}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === "online" ? "default" : "secondary"}>
                        {vehicle.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vehicle.location ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
                          </span>
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {vehicle.location?.speed ? (
                        <div className="flex items-center space-x-1">
                          <Gauge className="h-3 w-3" />
                          <span>{vehicle.location.speed} km/h</span>
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">2 dk önce</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
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
    </div>
  )
}