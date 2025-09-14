"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Activity, AlertTriangle, Users } from "lucide-react"

const stats = [
  {
    title: "Toplam Araç",
    value: "24",
    description: "Kayıtlı araç sayısı",
    icon: Car,
    color: "text-blue-600",
  },
  {
    title: "Aktif Araç",
    value: "18",
    description: "Çevrimiçi ve hareket halinde",
    icon: Activity,
    color: "text-green-600",
  },
  {
    title: "Aktif Uyarı",
    value: "3",
    description: "Çözülmemiş alarmlar",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  {
    title: "Sürücüler",
    value: "32",
    description: "Kayıtlı sürücü sayısı",
    icon: Users,
    color: "text-purple-600",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}