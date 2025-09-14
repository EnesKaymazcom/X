"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import {
  Settings,
  User,
  Building,
  Shield,
  Bell,
  Wifi,
  Database,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
  Save,
  Key,
  Mail,
  Phone,
  MapPin,
  Globe
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    criticalAlerts: true,
    dailyReports: false,
    weeklyReports: true
  })

  const [gpsSettings, setGpsSettings] = useState({
    server: "http://120.79.58.1:8088",
    account: "ULVschool",
    password: "••••••••",
    updateInterval: "5"
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ve kullanıcı ayarlarını yönetin</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="company">Şirket</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="gps">GPS Ayarları</TabsTrigger>
          <TabsTrigger value="billing">Faturalama</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" defaultValue="admin@afitek.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" defaultValue="+90 555 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Pozisyon</Label>
                  <Input id="position" defaultValue="Filo Yöneticisi" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label>Tema Tercihi</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Açık
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Koyu
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Dil</Label>
                  <Select defaultValue="tr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Şirket Bilgileri</CardTitle>
              <CardDescription>Şirket ve organizasyon ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Şirket Adı</Label>
                  <Input id="company-name" defaultValue="Afitek Teknoloji A.Ş." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-number">Vergi No</Label>
                  <Input id="tax-number" defaultValue="1234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Şirket E-posta</Label>
                  <Input id="company-email" type="email" defaultValue="info@afitek.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Şirket Telefon</Label>
                  <Input id="company-phone" defaultValue="+90 212 123 4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input id="address" defaultValue="Maslak, Sarıyer, İstanbul" />
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Plan Bilgileri</h3>
                  <div className="mt-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Enterprise Plan</div>
                        <div className="text-sm text-muted-foreground">Sınırsız araç ve kullanıcı</div>
                      </div>
                      <Badge>Aktif</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-posta Bildirimleri</Label>
                    <div className="text-sm text-muted-foreground">
                      Önemli güncellemeler için e-posta alın
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, email: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Bildirimleri</Label>
                    <div className="text-sm text-muted-foreground">
                      Kritik uyarılar için SMS alın
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, sms: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Bildirimleri</Label>
                    <div className="text-sm text-muted-foreground">
                      Tarayıcı bildirimleri alın
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, push: checked})
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bildirim Türleri</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Kritik Uyarılar</Label>
                    <div className="text-sm text-muted-foreground">
                      Acil müdahale gerektiren durumlar
                    </div>
                  </div>
                  <Switch
                    checked={notifications.criticalAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, criticalAlerts: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Günlük Raporlar</Label>
                    <div className="text-sm text-muted-foreground">
                      Her gün özet rapor alın
                    </div>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, dailyReports: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Haftalık Raporlar</Label>
                    <div className="text-sm text-muted-foreground">
                      Haftalık performans özeti
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, weeklyReports: checked})
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPS Bağlantı Ayarları</CardTitle>
              <CardDescription>808GPS sunucu bağlantı ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gps-server">Sunucu Adresi</Label>
                  <Input
                    id="gps-server"
                    value={gpsSettings.server}
                    onChange={(e) => setGpsSettings({...gpsSettings, server: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps-account">Hesap Adı</Label>
                  <Input
                    id="gps-account"
                    value={gpsSettings.account}
                    onChange={(e) => setGpsSettings({...gpsSettings, account: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps-password">Şifre</Label>
                  <Input
                    id="gps-password"
                    type="password"
                    value={gpsSettings.password}
                    onChange={(e) => setGpsSettings({...gpsSettings, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-interval">Güncelleme Sıklığı (saniye)</Label>
                  <Select
                    value={gpsSettings.updateInterval}
                    onValueChange={(v) => setGpsSettings({...gpsSettings, updateInterval: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 saniye</SelectItem>
                      <SelectItem value="5">5 saniye</SelectItem>
                      <SelectItem value="10">10 saniye</SelectItem>
                      <SelectItem value="30">30 saniye</SelectItem>
                      <SelectItem value="60">1 dakika</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Bağlantı Durumu</div>
                    <div className="text-sm text-muted-foreground">Son kontrol: 2 dakika önce</div>
                  </div>
                  <Badge variant="default">Bağlı</Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <Wifi className="mr-2 h-4 w-4" />
                  Bağlantıyı Test Et
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faturalama ve Abonelik</CardTitle>
              <CardDescription>Ödeme ve abonelik yönetimi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium">Mevcut Plan</h3>
                    <p className="text-sm text-muted-foreground">Enterprise - Yıllık</p>
                  </div>
                  <Badge>Aktif</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Araç Limiti</div>
                    <div className="font-medium">Sınırsız</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kullanıcı Limiti</div>
                    <div className="font-medium">Sınırsız</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Yenileme Tarihi</div>
                    <div className="font-medium">15 Ocak 2026</div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Ödeme Yöntemi</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-muted-foreground">Son kullanma: 12/25</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline">Ödeme Yöntemi Değiştir</Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fatura Geçmişi</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Ocak 2025 Faturası</div>
                        <div className="text-sm text-muted-foreground">15 Ocak 2025</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-3 w-3" />
                        İndir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>Hesap güvenliği ve erişim kontrolü</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Şifre Değiştir</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mevcut Şifre</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Yeni Şifre</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Şifreyi Güncelle
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">İki Faktörlü Doğrulama</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">2FA Durumu</div>
                    <div className="text-sm text-muted-foreground">
                      Hesabınızı daha güvenli hale getirin
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Aktif Oturumlar</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Chrome - Windows</div>
                      <div className="text-sm text-muted-foreground">
                        İstanbul, Türkiye • Şu an aktif
                      </div>
                    </div>
                    <Badge variant="default">Mevcut</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Mobile App - iOS</div>
                      <div className="text-sm text-muted-foreground">
                        Ankara, Türkiye • 2 saat önce
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Sonlandır</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add missing import
import { Download } from "lucide-react"