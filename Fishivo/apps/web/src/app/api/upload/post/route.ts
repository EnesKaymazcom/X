import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { uploadToCloudflare, deleteFromCloudflare } from '@/lib/cloudflare-upload'
import { getR2Path } from '@fishivo/utils'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth kontrolü
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. FormData'dan dosyaları al
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const postId = formData.get('postId') as string | null
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Maximum 10 görsel
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
    }

    // 3. Tarih bazlı klasör yapısı
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const timestamp = Date.now()

    // Post ID yoksa geçici bir ID oluştur
    const actualPostId = postId || `temp-${timestamp}`

    // 4. Her dosyayı işle
    const uploadPromises = files.map(async (file, index) => {
      // Validasyonlar
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`)
      }
      
      // Boyut kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large (max 10MB)')
      }

      // Dosyayı buffer'a çevir
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Sharp ile işle
      const sharpInstance = sharp(buffer)
      const metadata = await sharpInstance.metadata()
      
      // EXIF data temizle ve auto-rotate
      const baseImage = sharpInstance.rotate()
      
      // Farklı boyutlar için optimize et
      const sizes = [
        { name: 'original', width: 2000, height: 2000, quality: 90 },  // Orijinal (max 2000px)
        { name: 'large', size: 1200, quality: 85 },     // Feed ve detay sayfası
        { name: 'medium', size: 600, quality: 85 },     // Grid view
        { name: 'thumbnail', size: 200, quality: 90 }   // Thumbnail
      ]
      
      const imageSizes: Record<string, string> = {}
      
      for (const sizeConfig of sizes) {
        let optimized: Buffer
        
        if (sizeConfig.name === 'original') {
          // Orijinal için sadece max boyut sınırlaması
          optimized = await baseImage
            .clone()
            .resize(sizeConfig.width, sizeConfig.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: sizeConfig.quality })
            .toBuffer()
        } else {
          // Diğer boyutlar için kare crop
          optimized = await baseImage
            .clone()
            .resize(sizeConfig.size, sizeConfig.size, {
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: sizeConfig.quality })
            .toBuffer()
        }
        
        const key = getR2Path({
          userId: user.id,
          type: 'post',
          entityId: actualPostId,
          filename: `${index}/${sizeConfig.name}.webp`,
          includeTimestamp: false
        })
        const url = await uploadToCloudflare(optimized, key)
        
        imageSizes[sizeConfig.name] = url
      }
      
      return {
        index,
        urls: imageSizes,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width && metadata.height ? metadata.width / metadata.height : 1
      }
    })
    
    const uploadedImages = await Promise.all(uploadPromises)
    
    // 5. Başarılı yanıt
    return NextResponse.json({
      success: true,
      images: uploadedImages,
      message: 'Images uploaded successfully'
    })
    
  } catch (error) {
    console.error('Post upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    )
  }
}

// DELETE endpoint - Görselleri sil
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrls } = await request.json()
    
    if (!Array.isArray(imageUrls)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Her URL'i kontrol et ve sil
    const deletePromises = imageUrls.map(async (urls) => {
      // URL'ler obje olarak geliyorsa tüm boyutları sil
      if (typeof urls === 'object') {
        return Promise.all(Object.values(urls).map(url => deleteFromCloudflare(url as string)))
      }
      // Tek URL ise direkt sil
      return deleteFromCloudflare(urls)
    })

    await Promise.all(deletePromises)

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    )
  }
}