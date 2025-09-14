// Mock data store - simulating database
export const mockDatabase = {
  drivers: [
    {
      id: "1",
      name: "Ahmet Yılmaz",
      licenseNumber: "34ABC12345",
      phone: "+90 532 123 4567",
      email: "ahmet.yilmaz@afitek.com",
      vehicleId: "1",
      vehicleName: "Mercedes Actros",
      vehiclePlate: "34 ABC 123",
      status: "active",
      experience: "8 yıl",
      rating: 4.8,
      totalTrips: 342,
      totalDistance: "125,430 km",
      joinDate: "2020-03-15",
      lastActive: "2 saat önce"
    },
    {
      id: "2",
      name: "Mehmet Demir",
      licenseNumber: "06DEF67890",
      phone: "+90 533 234 5678",
      email: "mehmet.demir@afitek.com",
      vehicleId: "2",
      vehicleName: "Volvo FH16",
      vehiclePlate: "06 DEF 456",
      status: "on_trip",
      experience: "12 yıl",
      rating: 4.9,
      totalTrips: 567,
      totalDistance: "234,560 km",
      joinDate: "2018-07-22",
      lastActive: "Şu an aktif"
    },
    {
      id: "3",
      name: "Can Özkan",
      licenseNumber: "35GHI11223",
      phone: "+90 534 345 6789",
      email: "can.ozkan@afitek.com",
      vehicleId: "3",
      vehicleName: "Scania R450",
      vehiclePlate: "35 GHI 789",
      status: "resting",
      experience: "5 yıl",
      rating: 4.5,
      totalTrips: 198,
      totalDistance: "87,230 km",
      joinDate: "2021-11-08",
      lastActive: "1 gün önce"
    },
    {
      id: "4",
      name: "Ali Kaya",
      licenseNumber: "16JKL44556",
      phone: "+90 535 456 7890",
      email: "ali.kaya@afitek.com",
      vehicleId: null,
      vehicleName: "-",
      vehiclePlate: "-",
      status: "off_duty",
      experience: "15 yıl",
      rating: 4.7,
      totalTrips: 892,
      totalDistance: "456,780 km",
      joinDate: "2015-02-10",
      lastActive: "3 gün önce"
    }
  ],

  vehicles: [
    {
      id: "1",
      name: "Mercedes Actros",
      plate: "34 ABC 123",
      deviceId: "888811118888",
      status: "online",
      location: { lat: 41.0082, lng: 28.9784, speed: 65 },
      driver: "Ahmet Yılmaz",
      fuel: 75,
      temperature: 22,
      engineHours: 12450,
      odometer: 234567,
      lastMaintenance: "2024-11-15"
    },
    {
      id: "2",
      name: "Volvo FH16",
      plate: "06 DEF 456",
      deviceId: "888811118889",
      status: "idle",
      location: { lat: 39.9334, lng: 32.8597, speed: 0 },
      driver: "Mehmet Demir",
      fuel: 45,
      temperature: 18,
      engineHours: 8920,
      odometer: 156789,
      lastMaintenance: "2024-12-01"
    },
    {
      id: "3",
      name: "Scania R450",
      plate: "35 GHI 789",
      deviceId: "888811118890",
      status: "offline",
      location: { lat: 38.4237, lng: 27.1428, speed: 0 },
      driver: "Can Özkan",
      fuel: 60,
      temperature: 20,
      engineHours: 5670,
      odometer: 98765,
      lastMaintenance: "2024-10-20"
    }
  ],

  alerts: [
    {
      id: 1,
      type: "warning",
      severity: "high",
      title: "Hız Limiti Aşıldı",
      description: "34 ABC 123 - 95 km/h (Limit: 90 km/h)",
      time: "5 dakika önce",
      vehicleId: "1",
      driverId: "1",
      resolved: false
    },
    {
      id: 2,
      type: "info",
      severity: "low",
      title: "Araç Durdu",
      description: "06 DEF 456 - Ankara Lojistik Merkezi",
      time: "15 dakika önce",
      vehicleId: "2",
      driverId: "2",
      resolved: false
    },
    {
      id: 3,
      type: "error",
      severity: "critical",
      title: "Bağlantı Kesildi",
      description: "35 GHI 789 - GPS sinyali kayıp",
      time: "1 saat önce",
      vehicleId: "3",
      driverId: "3",
      resolved: false
    },
    {
      id: 4,
      type: "warning",
      severity: "medium",
      title: "Yakıt Seviyesi Düşük",
      description: "06 DEF 456 - %15 yakıt kaldı",
      time: "30 dakika önce",
      vehicleId: "2",
      driverId: "2",
      resolved: true
    },
    {
      id: 5,
      type: "error",
      severity: "high",
      title: "Motor Sıcaklığı Yüksek",
      description: "34 ABC 123 - 105°C",
      time: "2 saat önce",
      vehicleId: "1",
      driverId: "1",
      resolved: true
    }
  ],

  trips: [
    {
      id: "1",
      vehicleId: "1",
      driverId: "1",
      startLocation: "İstanbul",
      endLocation: "Ankara",
      startTime: "2025-01-14 08:00",
      endTime: "2025-01-14 14:30",
      distance: 453,
      avgSpeed: 75,
      maxSpeed: 95,
      fuelConsumed: 120,
      status: "completed"
    },
    {
      id: "2",
      vehicleId: "2",
      driverId: "2",
      startLocation: "Ankara",
      endLocation: "İzmir",
      startTime: "2025-01-14 10:00",
      endTime: null,
      distance: 234,
      avgSpeed: 68,
      maxSpeed: 85,
      fuelConsumed: 78,
      status: "in_progress"
    }
  ],

  cameras: [
    {
      id: "1",
      vehicleId: "1",
      type: "front",
      name: "Ön Kamera",
      status: "online",
      quality: "1080p",
      recordingEnabled: true
    },
    {
      id: "2",
      vehicleId: "1",
      type: "driver",
      name: "Sürücü Kamerası",
      status: "online",
      quality: "1080p",
      recordingEnabled: true
    },
    {
      id: "3",
      vehicleId: "1",
      type: "back",
      name: "Arka Kamera",
      status: "online",
      quality: "720p",
      recordingEnabled: false
    }
  ],

  aiDetections: [
    { id: 1, type: "Yorgun Sürüş", count: 15, percentage: 35, date: "2025-01-14" },
    { id: 2, type: "Telefon Kullanımı", count: 8, percentage: 20, date: "2025-01-14" },
    { id: 3, type: "Şerit İhlali", count: 12, percentage: 28, date: "2025-01-14" },
    { id: 4, type: "Hız İhlali", count: 7, percentage: 17, date: "2025-01-14" }
  ]
}

// Helper functions to simulate database operations
export const db = {
  drivers: {
    findAll: () => Promise.resolve(mockDatabase.drivers),
    findById: (id: string) => Promise.resolve(mockDatabase.drivers.find(d => d.id === id)),
    create: (data: any) => {
      const newDriver = { id: Date.now().toString(), ...data }
      mockDatabase.drivers.push(newDriver)
      return Promise.resolve(newDriver)
    },
    update: (id: string, data: any) => {
      const index = mockDatabase.drivers.findIndex(d => d.id === id)
      if (index !== -1) {
        mockDatabase.drivers[index] = { ...mockDatabase.drivers[index], ...data }
        return Promise.resolve(mockDatabase.drivers[index])
      }
      return Promise.reject(new Error("Driver not found"))
    },
    delete: (id: string) => {
      const index = mockDatabase.drivers.findIndex(d => d.id === id)
      if (index !== -1) {
        mockDatabase.drivers.splice(index, 1)
        return Promise.resolve(true)
      }
      return Promise.reject(new Error("Driver not found"))
    }
  },

  vehicles: {
    findAll: () => Promise.resolve(mockDatabase.vehicles),
    findById: (id: string) => Promise.resolve(mockDatabase.vehicles.find(v => v.id === id)),
    findByDriverId: (driverId: string) =>
      Promise.resolve(mockDatabase.vehicles.find(v => v.driver === mockDatabase.drivers.find(d => d.id === driverId)?.name))
  },

  alerts: {
    findAll: () => Promise.resolve(mockDatabase.alerts),
    findUnresolved: () => Promise.resolve(mockDatabase.alerts.filter(a => !a.resolved)),
    findByVehicleId: (vehicleId: string) =>
      Promise.resolve(mockDatabase.alerts.filter(a => a.vehicleId === vehicleId)),
    resolve: (id: number) => {
      const alert = mockDatabase.alerts.find(a => a.id === id)
      if (alert) {
        alert.resolved = true
        return Promise.resolve(alert)
      }
      return Promise.reject(new Error("Alert not found"))
    }
  },

  trips: {
    findAll: () => Promise.resolve(mockDatabase.trips),
    findByDriverId: (driverId: string) =>
      Promise.resolve(mockDatabase.trips.filter(t => t.driverId === driverId)),
    findByVehicleId: (vehicleId: string) =>
      Promise.resolve(mockDatabase.trips.filter(t => t.vehicleId === vehicleId))
  }
}