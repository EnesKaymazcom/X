import { NextRequest, NextResponse } from 'next/server'
import { ReferralServiceWeb } from '@fishivo/api/services/referral/referral.web'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referral_code } = body
    
    if (!referral_code) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REFERRAL_CODE' },
        { status: 400 }
      )
    }
    
    const isValid = await ReferralServiceWeb.validateReferralCode(referral_code)
    const referrerData = isValid ? await ReferralServiceWeb.getUserByReferralCode(referral_code) : null
    
    return NextResponse.json({
      success: true,
      data: {
        is_valid: isValid,
        referrer: referrerData
      }
    })
    
  } catch (error) {
    console.error('Referral validation error:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}