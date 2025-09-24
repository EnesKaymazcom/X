import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server';
import { uploadToCloudflare } from '@/lib/cloudflare-upload';
import { createEquipmentFilename } from '@/lib/utils';

// GET /api/admin/equipment - List equipment with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if user is authenticated and is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin işlemleri için admin client (RLS bypass)
    const adminSupabase = createSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const is_featured = searchParams.get('is_featured');
    const is_active = searchParams.get('is_active');
    const offset = (page - 1) * limit;

    // Base query
    let query = adminSupabase
      .from('equipment')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchLower}%,brand.ilike.%${searchLower}%,model.ilike.%${searchLower}%,category.ilike.%${searchLower}%`
      );
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    if (is_featured !== null && is_featured !== undefined) {
      query = query.eq('is_featured', is_featured === 'true');
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/equipment:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/admin/equipment - Create new equipment
// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if user is authenticated
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

    // Resim yükleme
    let image_url = null;
    const imageFile = formData.get('image') as File | null;
    
    if (imageFile && imageFile.size > 0) {
      try {
        // SEO uyumlu dosya adı oluştur
        const filename = createEquipmentFilename(
          `${name || ''}-${brand || ''}`,
          imageFile.name
        );
        image_url = await uploadToCloudflare(imageFile, filename);
      } catch (uploadError) {
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    // Veritabanına kaydet
    const { data, error } = await adminSupabase
      .from('equipment')
      .insert({
        name,
        category,
        brand,
        model,
        slug: createSlug(name),
        image_url,
        description_tr,
        description_en,
        features,
        specifications,
        price_min,
        price_max,
        is_featured,
        is_active,
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}