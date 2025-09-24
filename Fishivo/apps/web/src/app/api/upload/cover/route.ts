import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { uploadToCloudflare, deleteFromCloudflare, deleteFromCloudflareByPrefix } from '@/lib/cloudflare-upload'
import { getR2Path, generateSizeVariants, validateFileSize, validateFileType } from '@fishivo/utils'
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
    // 1. Auth kontrolü
    const supabase = await createSupabaseServerClient()
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // If no cookie session, try Bearer token (mobile)
    if (!user) {
      const authHeader = request.headers.get('authorization')
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        
        // Create a new client with the Bearer token
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
        
        // Get user with the token
        const tokenResult = await supabaseWithToken.auth.getUser()
        user = tokenResult.data.user
        authError = tokenResult.error
      }
    }
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    // 2. FormData'dan dosyayı al
    const formData = await request.formData()
    const file = formData.get('cover') as File
    
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // 3. Validasyonlar
    // Dosya tipi kontrolü
    const typeValidation = validateFileType(file.type)
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error }, 
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Boyut kontrolü
    const sizeValidation = validateFileSize(file.size, 'cover')
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // 4. Dosyayı buffer'a çevir
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 5. Sharp ile işle ve farklı boyutlar oluştur
    const sharpInstance = sharp(buffer)
    const metadata = await sharpInstance.metadata()
    
    const optimized = await sharpInstance
      .rotate()
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toBuffer()
    
    const key = getR2Path({
      userId: user.id,
      type: 'cover',
      filename: `cover_${Date.now()}.webp`,
      includeTimestamp: false
    })
    
    const coverUrl = await uploadToCloudflare(optimized, key)
    
    // 7. Eski cover'ları temizle (timestamp kullandığımız için gerekli)
    // Prefix bazlı silme kullan - tüm cover dosyalarını sil
    try {
      const coverPrefix = `users/${user.id}/profile/cover/`
      await deleteFromCloudflareByPrefix(coverPrefix)
    } catch (err) {
      console.error('Failed to delete old cover images:', err)
    }
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cover_image_url: coverUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      throw updateError
    }
    
    return NextResponse.json({
      success: true,
      cover_url: coverUrl,
      message: 'Cover image updated successfully'
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('Cover upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload cover image' },
      { status: 500, headers: corsHeaders }
    )
  }
}