"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Car,
  Map,
  Bell,
  FileText,
  Settings,
  Users,
  Activity,
  Camera,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Araçlar",
    href: "/dashboard/vehicles",
    icon: Car,
  },
  {
    title: "Canlı İzleme",
    href: "/dashboard/live",
    icon: Map,
  },
  {
    title: "Kameralar",
    href: "/dashboard/cameras",
    icon: Camera,
  },
  {
    title: "Sürücüler",
    href: "/dashboard/drivers",
    icon: Users,
  },
  {
    title: "Uyarılar",
    href: "/dashboard/alerts",
    icon: Bell,
  },
  {
    title: "Raporlar",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Aktiviteler",
    href: "/dashboard/activity",
    icon: Activity,
  },
  {
    title: "Ayarlar",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold">Afitek Fleet</h2>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}