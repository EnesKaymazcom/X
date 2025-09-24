import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { uploadToCloudflare, deleteFromCloudflare, deleteFromCloudflareByPrefix } from '@/lib/cloudflare-upload'
import { getR2Path } from '@fishivo/utils'
import sharp from 'sharp'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) {
      const authHeader = request.headers.get('authorization')
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseWithToken = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        )
        const tokenResult = await supabaseWithToken.auth.getUser()
        user = tokenResult.data.user
        authError = tokenResult.error
      }
    }
    
    if (authError) {
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message }, 
        { status: 401, headers: corsHeaders }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - No user session' }, 
        { status: 401, headers: corsHeaders }
      )
    }
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400, headers: corsHeaders }
      )
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' }, 
        { status: 400, headers: corsHeaders }
      )
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' }, 
        { status: 400, headers: corsHeaders }
      )
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sharpInstance = sharp(buffer)
    const metadata = await sharpInstance.metadata()
    const optimized = await sharpInstance
      .rotate()
      .resize(512, 512, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .webp({ quality: 85 })
      .toBuffer()
    const key = getR2Path({
      userId: user.id,
      type: 'avatar', 
      filename: `avatar_${Date.now()}.webp`,
      includeTimestamp: false
    })
    
    const avatarUrl = await uploadToCloudflare(optimized, key)
    try {
      const avatarPrefix = `users/${user.id}/profile/avatar/`
      await deleteFromCloudflareByPrefix(avatarPrefix)
    } catch (err) {
      console.error('Failed to delete old avatars:', err)
    }
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      throw updateError
    }
    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
      message: 'Profile photo updated successfully'
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Profile upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile photo' },
      { status: 500, headers: corsHeaders }
    )
  }
}