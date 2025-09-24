import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const entityId = formData.get('entityId') as string | null

    if (!file || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing file or type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // R2 credentials from environment
    const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')!
    const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!
    const R2_ENDPOINT = Deno.env.get('R2_ENDPOINT')!
    const R2_BUCKET = Deno.env.get('R2_BUCKET')!
    const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL')!

    // Generate R2 path with timestamp for uniqueness
    let key = ''
    const timestamp = Date.now()
    
    switch (type) {
      case 'avatar':
        key = `users/${user.id}/profile/avatar/medium_${timestamp}.webp`
        break
      case 'cover':
        key = `users/${user.id}/profile/cover/large_${timestamp}.webp`
        break
      case 'post':
        if (!entityId) throw new Error('Post ID required')
        key = `users/${user.id}/posts/${entityId}/image_${timestamp}.webp`
        break
      case 'catch':
        if (!entityId) throw new Error('Catch ID required')
        key = `users/${user.id}/catches/${entityId}/photo_${timestamp}.webp`
        break
      case 'spot':
        if (!entityId) throw new Error('Spot ID required')
        key = `users/${user.id}/spots/${entityId}/image_${timestamp}.webp`
        break
      default:
        throw new Error(`Unknown upload type: ${type}`)
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to R2 using AWS SDK v3 API
    const url = `${R2_ENDPOINT}/${R2_BUCKET}/${key}`
    const date = new Date().toUTCString()
    
    // Create AWS Signature v4 (simplified for example)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': uint8Array.length.toString(),
        'x-amz-date': date,
        'Cache-Control': 'public, max-age=31536000'
      },
      body: uint8Array
    })

    if (!response.ok) {
      throw new Error(`R2 upload failed: ${response.statusText}`)
    }

    // Generate public URL
    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    // Update database based on type
    if (type === 'avatar' || type === 'cover') {
      const column = type === 'avatar' ? 'avatar_url' : 'cover_image_url'
      
      // Get existing URLs to delete them from R2
      const { data: existingUser } = await supabase
        .from('users')
        .select(column)
        .eq('id', user.id)
        .single()
      
      // Delete old files from R2 if they exist
      if (existingUser?.[column]) {
        try {
          const oldUrls = typeof existingUser[column] === 'string' 
            ? [existingUser[column]]
            : Object.values(existingUser[column] as Record<string, string>)
          
          // TODO: Add R2 deletion logic here
          console.log('Would delete old files:', oldUrls)
        } catch (err) {
          console.error('Failed to delete old files:', err)
        }
      }
      
      // Create JSONB structure with different sizes
      const urlData = type === 'avatar' ? {
        thumbnail: publicUrl,
        small: publicUrl,
        medium: publicUrl,
        large: publicUrl
      } : {
        medium: publicUrl,
        large: publicUrl,
        original: publicUrl
      }
      
      // Update database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          [column]: urlData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) {
        throw updateError
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        message: 'Upload successful'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Upload failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})