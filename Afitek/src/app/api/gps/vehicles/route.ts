import { NextResponse } from "next/server"
import { getGPSClient } from "@/lib/gps-client"

export async function GET() {
  try {
    const gpsClient = getGPSClient()

    // Login to 808GPS
    await gpsClient.login()

    // Get vehicles
    const vehiclesData = await gpsClient.getVehicles()

    // Get status for all vehicles
    const deviceIds = vehiclesData.vehicles?.map(v => v.dl?.[0]?.id).filter(Boolean) || []

    let statusData = null
    if (deviceIds.length > 0) {
      statusData = await gpsClient.getVehicleStatusBatch(deviceIds)
    }

    // Combine data
    const vehicles = vehiclesData.vehicles?.map(vehicle => {
      const deviceId = vehicle.dl?.[0]?.id
      const status = statusData?.status?.find(s => s.id === deviceId)

      return {
        id: vehicle.id,
        name: vehicle.nm,
        deviceId: deviceId,
        channels: vehicle.dl?.[0]?.cn,
        status: status?.ol === 1 ? "online" : "offline",
        location: status ? {
          lat: parseFloat(status.mlat),
          lng: parseFloat(status.mlng),
          speed: status.sp,
          time: status.gt,
        } : null,
      }
    }) || []

    return NextResponse.json({
      success: true,
      vehicles,
      count: vehicles.length,
    })
  } catch (error) {
    console.error("GPS API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "GPS verisi alınamadı",
        demo: true,
        vehicles: [
          {
            id: 1,
            name: "Demo Araç 1",
            deviceId: "888811118888",
            status: "online",
            location: { lat: 41.0082, lng: 28.9784, speed: 65 },
          },
          {
            id: 2,
            name: "Demo Araç 2",
            deviceId: "888811118889",
            status: "offline",
            location: { lat: 39.9334, lng: 32.8597, speed: 0 },
          },
        ],
      },
      { status: 200 } // Demo mode'da da 200 döndür
    )
  }
}