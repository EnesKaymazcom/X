"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Car, MapPin, Gauge, Clock } from "lucide-react"

const vehicles = [
  {
    id: 1,
    deviceId: "888811118888",
    name: "Mercedes Actros",
    plate: "34 ABC 123",
    status: "online",
    speed: 65,
    location: "E-5 Karayolu, İstanbul",
    driver: "Ahmet Yılmaz",
    lastUpdate: "2 dakika önce",
  },
  {
    id: 2,
    deviceId: "888811118889",
    name: "Volvo FH16",
    plate: "06 DEF 456",
    status: "offline",
    speed: 0,
    location: "Ankara Lojistik Merkezi",
    driver: "Mehmet Öz",
    lastUpdate: "1 saat önce",
  },
  {
    id: 3,
    deviceId: "888811118890",
    name: "Scania R450",
    plate: "35 GHI 789",
    status: "idle",
    speed: 0,
    location: "İzmir Limanı",
    driver: "Ali Demir",
    lastUpdate: "5 dakika önce",
  },
]

interface VehicleListProps {
  detailed?: boolean
}

export function VehicleList({ detailed = false }: VehicleListProps) {
  if (detailed) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Araç</TableHead>
              <TableHead>Plaka</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Hız</TableHead>
              <TableHead>Konum</TableHead>
              <TableHead>Sürücü</TableHead>
              <TableHead>Son Güncelleme</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.name}</TableCell>
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vehicle.status === "online"
                        ? "default"
                        : vehicle.status === "idle"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {vehicle.status === "online"
                      ? "Çevrimiçi"
                      : vehicle.status === "idle"
                      ? "Beklemede"
                      : "Çevrimdışı"}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.speed} km/h</TableCell>
                <TableCell>{vehicle.location}</TableCell>
                <TableCell>{vehicle.driver}</TableCell>
                <TableCell>{vehicle.lastUpdate}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    Detay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[180px]">
      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{vehicle.name}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{vehicle.plate}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {vehicle.location}
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant={
                vehicle.status === "online"
                  ? "default"
                  : vehicle.status === "idle"
                  ? "secondary"
                  : "destructive"
              }
            >
              {vehicle.status === "online"
                ? "Çevrimiçi"
                : vehicle.status === "idle"
                ? "Beklemede"
                : "Çevrimdışı"}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}