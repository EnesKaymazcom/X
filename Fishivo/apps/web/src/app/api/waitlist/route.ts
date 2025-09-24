import { NextRequest, NextResponse } from 'next/server'
import { waitlistService } from '@fishivo/api/services/waitlist/waitlist.web'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, referrer } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email adresi gerekli', error: 'MISSING_EMAIL' },
        { status: 400 }
      )
    }

    // Get user agent and IP address
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || undefined
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || request.ip || undefined

    const result = await waitlistService.addToWaitlist(
      { email, referrer },
      userAgent,
      ipAddress
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Sunucu hatası',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await waitlistService.getWaitlistStats()
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Waitlist stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'İstatistikler alınamadı',
        error: 'STATS_ERROR'
      },
      { status: 500 }
    )
  }
}