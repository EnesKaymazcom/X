import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { uploadToCloudflare, deleteFromCloudflare } from '@/lib/cloudflare-upload'
import sharp from 'sharp'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth kontrolü
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. FormData'dan dosyaları al
    const formData = await request.formData()
    const mainImage = formData.get('mainImage') as File | null
    const galleryImages = formData.getAll('galleryImages') as File[]
    const spotId = formData.get('spotId') as string | null
    const countryCode = formData.get('countryCode') as string | null
    const city = formData.get('city') as string | null
    
    if (!mainImage && galleryImages.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Maximum 20 görsel (1 ana + 19 galeri)
    const totalImages = (mainImage ? 1 : 0) + galleryImages.length
    if (totalImages > 20) {
      return NextResponse.json({ error: 'Maximum 20 images allowed' }, { status: 400 })
    }

    // 3. Konum bazlı klasör yapısı
    const timestamp = Date.now()
    const actualSpotId = spotId || `temp-${timestamp}`
    const country = countryCode || 'unknown'
    const citySlug = city ? slugify(city) : 'unknown'

    // Helper function - görsel işleme
    const processImage = async (file: File, type: 'main' | 'gallery', index: number = 0) => {
      // Validasyonlar
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`)
      }
      
      // Boyut kontrolü (15MB)
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('File too large (max 15MB)')
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
      const sizes = type === 'main' ? [
        { name: 'hero', width: 1920, height: 1080, quality: 90 },    // Hero image
        { name: 'large', size: 1200, quality: 85 },     // Detay sayfası
        { name: 'medium', size: 600, quality: 85 },     // Liste görünümü
        { name: 'thumbnail', size: 300, quality: 90 }   // Harita pin
      ] : [
        { name: 'large', size: 1200, quality: 85 },     // Galeri lightbox
        { name: 'medium', size: 600, quality: 85 },     // Galeri grid
        { name: 'thumbnail', size: 200, quality: 90 }   // Galeri thumbnail
      ]
      
      const imageSizes: Record<string, string> = {}
      
      for (const sizeConfig of sizes) {
        let optimized: Buffer
        
        if (sizeConfig.name === 'hero') {
          // Hero image için 16:9 aspect ratio
          optimized = await baseImage
            .clone()
            .resize(sizeConfig.width, sizeConfig.height, {
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: sizeConfig.quality })
            .toBuffer()
        } else {
          // Diğer boyutlar
          optimized = await baseImage
            .clone()
            .resize(sizeConfig.size, sizeConfig.size, {
              fit: type === 'main' ? 'cover' : 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: sizeConfig.quality || 85 })
            .toBuffer()
        }
        
        const prefix = type === 'main' ? 'main' : `gallery/${index}`
        const key = `spots/${country}/${citySlug}/${actualSpotId}/${prefix}-${sizeConfig.name}-${timestamp}.webp`
        const url = await uploadToCloudflare(optimized, key)
        
        imageSizes[sizeConfig.name] = url
      }
      
      return {
        type,
        index,
        urls: imageSizes,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width && metadata.height ? metadata.width / metadata.height : 1
      }
    }

    // 4. Ana görseli işle
    let mainImageData = null
    if (mainImage) {
      mainImageData = await processImage(mainImage, 'main')
    }

    // 5. Galeri görsellerini işle
    const galleryImagesData = await Promise.all(
      galleryImages.map((file, index) => processImage(file, 'gallery', index))
    )

    // 6. Başarılı yanıt
    return NextResponse.json({
      success: true,
      mainImage: mainImageData,
      galleryImages: galleryImagesData,
      message: 'Spot images uploaded successfully'
    })
    
  } catch (error) {
    console.error('Spot upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    )
  }
}

// DELETE endpoint - Spot görsellerini sil
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mainImageUrls, galleryImageUrls } = await request.json()
    
    const deletePromises = []

    // Ana görseli sil
    if (mainImageUrls && typeof mainImageUrls === 'object') {
      deletePromises.push(
        ...Object.values(mainImageUrls).map(url => deleteFromCloudflare(url as string))
      )
    }

    // Galeri görsellerini sil
    if (Array.isArray(galleryImageUrls)) {
      galleryImageUrls.forEach(imageData => {
        if (imageData.urls && typeof imageData.urls === 'object') {
          deletePromises.push(
            ...Object.values(imageData.urls).map(url => deleteFromCloudflare(url as string))
          )
        }
      })
    }

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