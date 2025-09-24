import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { ReferralServiceWeb } from '@fishivo/api/services/referral/referral.web'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const stats = await ReferralServiceWeb.getReferralStats(user.id)
    
    if (!stats) {
      return NextResponse.json(
        { success: false, error: 'STATS_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error('Referral stats error:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}