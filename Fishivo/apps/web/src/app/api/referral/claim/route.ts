import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { ReferralServiceWeb } from '@fishivo/api/services/referral/referral.web'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { referral_code } = body
    
    if (!referral_code) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REFERRAL_CODE' },
        { status: 400 }
      )
    }
    
    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''
    
    const result = await ReferralServiceWeb.claimReferral(user.id, {
      referral_code,
      ip_address: ip,
      user_agent: userAgent
    })
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Referral claim error:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}