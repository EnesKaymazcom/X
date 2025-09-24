import { NextRequest, NextResponse } from 'next/server'
import { ReferralServiceWeb } from '@fishivo/api/services/referral/referral.web'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 10
    
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, error: 'INVALID_LIMIT' },
        { status: 400 }
      )
    }
    
    const leaderboard = await ReferralServiceWeb.getReferralLeaderboard(limit)
    
    return NextResponse.json({
      success: true,
      data: leaderboard
    })
    
  } catch (error) {
    console.error('Referral leaderboard error:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}