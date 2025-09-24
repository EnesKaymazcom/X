import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server'
import { uploadToCloudflare } from '@/lib/cloudflare-upload'
import { createSeoFriendlyFilename, sanitizeFishSpeciesArrays } from '@/lib/utils'

// Varsayılan balık türü bilgileri
const defaultSpeciesData = {
  common_names_tr: [],
  description_tr: '',
  description_en: ''
}

// Helper function to create URL-friendly slug
function createSlug(scientificName: string): string {
  return scientificName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
}

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı kontrolü için normal client
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin işlemleri için admin client (RLS bypass)
    const supabase = createSupabaseAdminClient()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const habitat = searchParams.get('habitat') || ''
    const conservation_status = searchParams.get('conservation_status') || ''
    const offset = (page - 1) * limit

    // Önce tüm veriyi çek (filtreler için)
    let baseQuery = supabase
      .from('fish_species')
      .select('*')
      .order('created_at', { ascending: false })

    // Habitat filtresi
    if (habitat) {
      baseQuery = baseQuery.contains('habitats', [habitat])
    }

    // Koruma durumu filtresi
    if (conservation_status) {
      baseQuery = baseQuery.eq('conservation_status', conservation_status)
    }

    // Tüm veriyi çek
    const { data: allData, error } = await baseQuery

    if (error) {
      console.error('Error fetching species:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let filteredData = allData || []
    
    // Arama filtresi - client-side
    if (search) {
      const searchLower = search.toLowerCase()
      
      filteredData = filteredData.filter(fish => {
        // İngilizce isimde ara
        if (fish.common_name?.toLowerCase().includes(searchLower)) return true
        
        // Bilimsel isimde ara
        if (fish.scientific_name?.toLowerCase().includes(searchLower)) return true
        
        // Familyada ara
        if (fish.family?.toLowerCase().includes(searchLower)) return true
        
        // Order'da ara
        if (fish.order?.toLowerCase().includes(searchLower)) return true
        
        // Türkçe isimlerde ara
        if (fish.common_names_tr && Array.isArray(fish.common_names_tr)) {
          return fish.common_names_tr.some(name => 
            name.toLowerCase().includes(searchLower)
          )
        }
        
        return false
      })
    }

    // Toplam sayı
    const count = filteredData.length

    // Pagination
    const paginatedData = filteredData.slice(offset, offset + limit)

    // Array alanlarını temizle
    const cleanedData = paginatedData.map(species => ({
      ...species,
      ...sanitizeFishSpeciesArrays({
        common_names_tr: species.common_names_tr,
        habitats: species.habitats,
        feeding_types: species.feeding_types
      })
    }))

    return NextResponse.json({
      data: cleanedData,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/admin/species:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı kontrolü için normal client
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin işlemleri için admin client (RLS bypass)
    const supabase = createSupabaseAdminClient()

    const formData = await request.formData()
    
    // Form verilerini al
    const common_name = formData.get('common_name') as string
    const scientific_name = formData.get('scientific_name') as string
    const family = formData.get('family') as string
    const order = formData.get('order') as string
    const conservation_status = formData.get('conservation_status') as string
    const max_length = parseFloat(formData.get('max_length') as string || '0')
    const max_weight = parseFloat(formData.get('max_weight') as string || '0')
    const min_depth = parseInt(formData.get('min_depth') as string || '0')
    const max_depth = parseInt(formData.get('max_depth') as string || '0')
    
    // Açıklama alanları
    const description_tr = formData.get('description_tr') as string || ''
    const description_en = formData.get('description_en') as string || ''
    
    // Array alanlarını temizle - string'leri parse et
    const arrayData = sanitizeFishSpeciesArrays({
      common_names_tr: JSON.parse(formData.get('common_names_tr') as string || '[]'),
      common_names_en: JSON.parse(formData.get('common_names_en') as string || '[]'),
      habitats: JSON.parse(formData.get('habitats') as string || '[]'),
      feeding_types: JSON.parse(formData.get('feeding_types') as string || '[]')
    })

    // Resim yükleme
    let image_url = null
    const imageFile = formData.get('image') as File | null
    
    if (imageFile && imageFile.size > 0) {
      try {
        console.log('Uploading image:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        })
        
        // SEO uyumlu dosya adı oluştur
        const filename = createSeoFriendlyFilename(
          common_name || '',
          scientific_name || '',
          imageFile.name
        )
        image_url = await uploadToCloudflare(imageFile, filename)
        
        console.log('Image uploaded successfully:', image_url)
      } catch (uploadError) {
        console.error('Error uploading image:', {
          error: uploadError,
          message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          stack: uploadError instanceof Error ? uploadError.stack : undefined
        })
        // Resim yükleme hatası olsa bile devam et
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 400 }
        )
      }
    }

    // Veritabanına kaydet
    const { data, error } = await supabase
      .from('fish_species')
      .insert({
        common_name,
        scientific_name,
        slug: createSlug(scientific_name),
        family,
        order,
        conservation_status,
        habitats: arrayData.habitats,
        max_length,
        max_weight,
        min_depth,
        max_depth,
        image_url,
        common_names_tr: arrayData.common_names_tr,
        common_names_en: arrayData.common_names_en,
        description_tr,
        description_en,
        feeding_types: arrayData.feeding_types
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating species:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/admin/species:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}