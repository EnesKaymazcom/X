import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Only allow POST and DELETE
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle DELETE method
    if (req.method === 'DELETE') {
      console.log('[DELETE] Request received')
      
      const body = await req.json()
      const deleteType = body.type // 'avatar' or 'cover'
      
      console.log(`[DELETE] Type: ${deleteType}, User: ${user.id}`)
      
      if (!deleteType || !['avatar', 'cover'].includes(deleteType)) {
        return new Response(
          JSON.stringify({ error: 'Invalid delete type' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Get R2 configuration
      const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID') || Deno.env.get('CLOUDFLARE_ACCOUNT_ID') || Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID')
      const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID') || Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
      const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY') || Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
      const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') || Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME') || 'fishivo'
      
      console.log(`[DELETE] R2 Config - Account: ${R2_ACCOUNT_ID ? 'Set' : 'Missing'}, Key: ${R2_ACCESS_KEY_ID ? 'Set' : 'Missing'}, Bucket: ${R2_BUCKET_NAME}`)
      
      // Initialize AWS client for R2
      const r2Client = new AwsClient({
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
        region: 'auto',
        service: 's3',
      })
      
      // Correct prefix pattern matching the upload format
      const prefix = `users/${user.id}/${deleteType}_`
      
      const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      
      // List all files with the prefix using ListObjectsV2
      const listUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}?list-type=2&prefix=${prefix}`
        
        try {
          // List all files with the prefix
          const listResponse = await r2Client.fetch(listUrl, {
            method: 'GET'
          })
          
          console.log(`[DELETE] List response status: ${listResponse.status}`)
          
          if (listResponse.ok) {
            const listText = await listResponse.text()
            console.log(`[DELETE] XML Response (first 500 chars): ${listText.substring(0, 500)}`)
            
            // Parse XML response to get file keys
            const keyMatches = listText.match(/<Key>([^<]+)<\/Key>/g) || []
            const keys = keyMatches.map(match => match.replace(/<\/?Key>/g, ''))
            
            console.log(`[DELETE] Found ${keys.length} files with pattern ${prefix}:`, keys)
            
            // Delete each file found
            for (const key of keys) {
              const deleteUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`
              
              try {
                const deleteResp = await r2Client.fetch(deleteUrl, {
                  method: 'DELETE'
                })
                if (deleteResp.ok || deleteResp.status === 204) {
                  totalDeleted++
                  console.log(`[DELETE] Successfully deleted: ${key}`)
                } else {
                  console.error(`[DELETE] Failed to delete ${key}: ${deleteResp.status}`)
                }
              } catch (deleteError) {
                console.error(`[DELETE] Error deleting ${key}:`, deleteError)
              }
            }
          } else {
            console.error(`[DELETE] List request failed: ${listResponse.status}`)
            const errorText = await listResponse.text()
            console.error(`[DELETE] List error:`, errorText)
          }
        } catch (r2Error) {
          console.error(`[DELETE] R2 error for pattern ${prefix}:`, r2Error)
        }
      }
      
      console.log(`[DELETE] Total files deleted: ${totalDeleted}`)
      
      // Return success (database update is handled by the client)
      return new Response(
        JSON.stringify({
          success: true,
          message: `${deleteType} deleted successfully`
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse multipart form data for POST
    const formData = await req.formData()
    
    // Get file from FormData (check multiple possible field names)
    let file = null
    const fileFields = ['file', 'avatar', 'cover', 'image', 'photo']
    for (const field of fileFields) {
      const f = formData.get(field)
      if (f && f instanceof File) {
        file = f
        break
      }
    }

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get metadata
    const uploadType = formData.get('type')?.toString() || 'avatar'
    const entityId = formData.get('entityId')?.toString()

    // Read file content
    const fileBuffer = await file.arrayBuffer()
    const fileContent = new Uint8Array(fileBuffer)

    // Determine file path based on type
    let filePath
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'

    switch (uploadType) {
      case 'avatar':
        // Avatar with timestamp for unique naming (prevents cache issues)
        filePath = `users/${user.id}/avatar_${timestamp}.${ext}`
        break
      case 'cover':
        // Cover with timestamp for unique naming (prevents cache issues)
        filePath = `users/${user.id}/cover_${timestamp}.${ext}`
        break
      case 'post':
        filePath = `users/${user.id}/posts/${entityId || timestamp}/${timestamp}.${ext}`
        break
      case 'catch':
        filePath = `users/${user.id}/catches/${entityId || timestamp}/${timestamp}.${ext}`
        break
      case 'spot':
        filePath = `users/${user.id}/spots/${entityId || timestamp}/${timestamp}.${ext}`
        break
      default:
        filePath = `users/${user.id}/misc/${timestamp}.${ext}`
    }

    // Get R2 configuration
    const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID') || Deno.env.get('CLOUDFLARE_ACCOUNT_ID') || Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID')
    const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID') || Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')
    const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY') || Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') || Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME') || 'fishivo'
    const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL') || Deno.env.get('CLOUDFLARE_R2_PUBLIC_URL') || 'https://images.fishivo.com'

    // Initialize AWS client for R2
    const r2Client = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      region: 'auto',
      service: 's3',
    })

    const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    
    // Delete old files before uploading new one (for avatar and cover only)
    if (uploadType === 'avatar' || uploadType === 'cover') {
      const deletePrefix = uploadType === 'avatar' 
        ? `users/${user.id}/avatar_`
        : `users/${user.id}/cover_`
      
      // List and delete old files
      const listUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}?list-type=2&prefix=${deletePrefix}`
      
      try {
        const listResponse = await r2Client.fetch(listUrl, {
          method: 'GET'
        })
        
        if (listResponse.ok) {
          const listText = await listResponse.text()
          const keyMatches = listText.match(/<Key>([^<]+)<\/Key>/g) || []
          const keys = keyMatches.map(match => match.replace(/<\/?Key>/g, ''))
          
          // Delete each old file
          for (const key of keys) {
            const deleteUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`
            await r2Client.fetch(deleteUrl, { method: 'DELETE' })
          }
        }
      } catch (err) {
        // Continue even if deletion fails
      }
    }
    
    // Upload to R2
    const putUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${filePath}`
    
    const putResponse = await r2Client.fetch(putUrl, {
      method: 'PUT',
      body: fileContent,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
      }
    })

    if (!putResponse.ok) {
      const errorText = await putResponse.text()
      throw new Error(`R2 upload failed: ${putResponse.status} - ${errorText}`)
    }

    // Generate public URL
    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`

    // Update database based on type
    if (uploadType === 'avatar' || uploadType === 'cover') {
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      const updateField = uploadType === 'avatar' ? 'avatar_url' : 'cover_image_url'
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          [updateField]: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Database update error:', updateError)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filePath,
        message: `${uploadType} uploaded successfully`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})