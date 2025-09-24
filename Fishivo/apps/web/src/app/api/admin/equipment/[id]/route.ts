import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server';
import { uploadToCloudflare } from '@/lib/cloudflare-upload';
import { createEquipmentFilename } from '@/lib/utils';

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
}

// GET /api/admin/equipment/[id] - Get single equipment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    
    // Check if user is authenticated and is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin işlemleri için admin client (RLS bypass)
    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/admin/equipment/[id]:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// PUT /api/admin/equipment/[id] - Update equipment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    
    // Check if user is authenticated and is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin işlemleri için admin client (RLS bypass)
    const adminSupabase = createSupabaseAdminClient();

    const formData = await request.formData();
    
    // Form verilerini al
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string || null;
    const model = formData.get('model') as string || null;
    const description_tr = formData.get('description_tr') as string || '';
    const description_en = formData.get('description_en') as string || '';
    const price_min = parseFloat(formData.get('price_min') as string || '0') || null;
    const price_max = parseFloat(formData.get('price_max') as string || '0') || null;
    const is_featured = formData.get('is_featured') === 'true';
    const is_active = formData.get('is_active') === 'true';
    
    // Features ve specifications JSON olarak parse et
    let features = null;
    let specifications = null;
    
    try {
      const featuresStr = formData.get('features') as string;
      if (featuresStr) features = JSON.parse(featuresStr);
    } catch (e) {
      // Invalid JSON, ignore
    }
    
    try {
      const specsStr = formData.get('specifications') as string;
      if (specsStr) specifications = JSON.parse(specsStr);
    } catch (e) {
      // Invalid JSON, ignore
    }

    // Güncellenecek veri
    let updateData: any = {
      name,
      category,
      brand,
      model,
      slug: createSlug(name),
      description_tr,
      description_en,
      features,
      specifications,
      price_min,
      price_max,
      is_featured,
      is_active,
      updated_at: new Date().toISOString()
    };

    // Resim yükleme
    const imageFile = formData.get('image') as File | null;
    
    if (imageFile && imageFile.size > 0) {
      try {
        // SEO uyumlu dosya adı oluştur
        const filename = createEquipmentFilename(
          `${name || ''}-${brand || ''}`,
          imageFile.name
        );
        const image_url = await uploadToCloudflare(imageFile, filename);
        updateData.image_url = image_url;
      } catch (uploadError) {
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    // Veritabanını güncelle
    const { data, error } = await adminSupabase
      .from('equipment')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/equipment/[id]:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/equipment/[id] - Delete equipment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    
    // Check if user is authenticated and is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin işlemleri için admin client (RLS bypass)
    const adminSupabase = createSupabaseAdminClient();

    const { error } = await adminSupabase
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/equipment/[id]:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}