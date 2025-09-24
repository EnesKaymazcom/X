import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { isUsernameValid } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json()
    
    if (!email && !username) {
      return NextResponse.json(
        { error: 'Email or username required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const result: any = {}

    // Check email availability
    if (email) {
      const { data: emailData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      result.email = {
        available: !emailData,
        email: email.toLowerCase(),
        message: !emailData ? 'EMAIL_AVAILABLE' : 'EMAIL_TAKEN'
      }
    }

    // Check username availability
    if (username) {
      // Server-side validation
      const usernameStr = username.toString().trim()
      
      // Check for email format (contains @)
      if (usernameStr.includes('@')) {
        result.username = {
          available: false,
          username: usernameStr,
          message: 'USERNAME_NO_EMAIL'
        }
      }
      // Check for invalid format (dots at start/end or consecutive dots)
      else if (/\.\.|^\.|\.$/.test(usernameStr)) {
        result.username = {
          available: false,
          username: usernameStr,
          message: 'USERNAME_INVALID_DOTS'
        }
      }
      // Check for invalid characters
      else if (!/^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/.test(usernameStr)) {
        result.username = {
          available: false,
          username: usernameStr,
          message: 'USERNAME_INVALID_FORMAT'
        }
      }
      // Check length
      else if (usernameStr.length < 4 || usernameStr.length > 15) {
        result.username = {
          available: false,
          username: usernameStr,
          message: usernameStr.length < 4 ? 'USERNAME_TOO_SHORT' : 'USERNAME_TOO_LONG'
        }
      }
      // Check if starts with letter (Instagram rule)
      else if (!/^[a-zA-Z]/.test(usernameStr)) {
        result.username = {
          available: false,
          username: usernameStr,
          message: 'USERNAME_MUST_START_WITH_LETTER'
        }
      }
      // Check if only numbers (Instagram rule)
      else if (/^[0-9]+$/.test(usernameStr)) {
        result.username = {
          available: false,
          username: usernameStr,
          message: 'USERNAME_NOT_ONLY_NUMBERS'
        }
      }
      // Check banned words and inappropriate content
      else {
        const validation = isUsernameValid(usernameStr)
        
        if (!validation.isValid) {
          result.username = {
            available: false,
            username: usernameStr,
            message: validation.message || 'USERNAME_INAPPROPRIATE'
          }
        }
        // Check database availability
        else {
          const { data: usernameData } = await supabase
            .from('users')
            .select('id')
            .eq('username', usernameStr.toLowerCase())
            .single()

          result.username = {
            available: !usernameData,
            username: usernameStr.toLowerCase(),
            message: !usernameData ? 'USERNAME_AVAILABLE' : 'USERNAME_TAKEN'
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      data: result 
    })
  } catch (error) {
    console.error('Check availability error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}