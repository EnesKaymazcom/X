import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server'
import { uploadToCloudflare, deleteFromCloudflare } from '@/lib/cloudflare-upload'
import { createSeoFriendlyFilename, sanitizeFishSpeciesArrays } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Kullanıcı kontrolü için normal client
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin işlemleri için admin client (RLS bypass)
    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('fish_species')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching species:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/admin/species/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // Güncellenecek veri
    let updateData: any = {
      common_name,
      scientific_name,
      family,
      order,
      conservation_status,
      habitats: arrayData.habitats,
      max_length,
      max_weight,
      min_depth,
      max_depth,
      common_names_tr: arrayData.common_names_tr,
      common_names_en: arrayData.common_names_en,
      description_tr,
      description_en,
      feeding_types: arrayData.feeding_types,
      updated_at: new Date().toISOString()
    }

    // Resim yükleme
    const imageFile = formData.get('image') as File | null
    const removeImage = formData.get('removeImage') === 'true'
    
    // Mevcut veriyi al (eski resmi silmek için)
    const { data: existingSpecies } = await supabase
      .from('fish_species')
      .select('image_url')
      .eq('id', id)
      .single()

    if (removeImage) {
      // Resmi kaldır
      if (existingSpecies?.image_url) {
        try {
          await deleteFromCloudflare(existingSpecies.image_url)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }
      updateData.image_url = null
    } else if (imageFile && imageFile.size > 0) {
      // Yeni resim yükle
      try {
        // Eski resmi sil
        if (existingSpecies?.image_url) {
          try {
            await deleteFromCloudflare(existingSpecies.image_url)
          } catch (error) {
            console.error('Error deleting old image:', error)
          }
        }

        // SEO uyumlu dosya adı oluştur
        const filename = createSeoFriendlyFilename(
          common_name || '',
          scientific_name || '',
          imageFile.name
        )
        updateData.image_url = await uploadToCloudflare(imageFile, filename)
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError)
        // Resim yükleme hatası olsa bile devam et
      }
    }

    // Veritabanını güncelle
    const { data, error } = await supabase
      .from('fish_species')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating species:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/admin/species/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Kullanıcı kontrolü için normal client
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Admin işlemleri için admin client (RLS bypass)
    const supabase = createSupabaseAdminClient()

    // Silinecek türün resmini al
    const { data: species } = await supabase
      .from('fish_species')
      .select('image_url')
      .eq('id', id)
      .single()

    // Resmi sil
    if (species?.image_url) {
      try {
        await deleteFromCloudflare(species.image_url)
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    // Veritabanından sil
    const { error } = await supabase
      .from('fish_species')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting species:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/species/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}