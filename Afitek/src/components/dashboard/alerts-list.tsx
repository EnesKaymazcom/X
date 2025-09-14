"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import { db } from "@/lib/mock-data"

const getAlertIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-4 w-4" />
    case "error":
      return <AlertCircle className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "destructive"
    case "high":
      return "default"
    case "medium":
      return "secondary"
    default:
      return "outline"
  }
}

export function AlertsList() {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    db.alerts.findUnresolved().then(setAlerts)
  }, [])

  return (
    <ScrollArea className="h-[180px]">
      <div className="space-y-2">
        {alerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <div className="mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium truncate">
                      {alert.title}
                    </h4>
                    <Badge
                      variant={getSeverityColor(alert.severity) as "default" | "secondary" | "outline" | "destructive"}
                      className="text-xs shrink-0"
                    >
                      {alert.severity === "critical"
                        ? "Kritik"
                        : alert.severity === "high"
                        ? "Yüksek"
                        : alert.severity === "medium"
                        ? "Orta"
                        : "Düşük"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}