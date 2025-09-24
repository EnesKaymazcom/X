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
    
    const newCode = await ReferralServiceWeb.generateNewReferralCode(user.id)
    
    if (!newCode) {
      return NextResponse.json(
        { success: false, error: 'CODE_GENERATION_FAILED' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        referral_code: newCode
      }
    })
    
  } catch (error) {
    console.error('Referral code generation error:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}