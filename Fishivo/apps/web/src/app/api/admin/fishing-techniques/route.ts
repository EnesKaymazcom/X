import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server';
import { uploadToCloudflare } from '@/lib/cloudflare-upload';
import { createSeoFriendlyFilename } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from('fishing_techniques')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      const searchLower = search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchLower}%,name_en.ilike.%${searchLower}%,description.ilike.%${searchLower}%,description_en.ilike.%${searchLower}%`
      );
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (status) {
      query = query.eq('status', status);
    }

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
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    
    // Check if it's FormData (with image) or JSON
    const contentType = request.headers.get('content-type');
    let body: {
      name?: string;
      name_en?: string;
      description?: string;
      description_en?: string;
      difficulty?: string;
      icon?: string;
      image_url?: string;
      seasons?: string[];
    };
    let imageUrl: string | null = null;
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract form fields
      body = {
        name: formData.get('name') as string,
        name_en: formData.get('name_en') as string,
        description: formData.get('description') as string,
        description_en: formData.get('description_en') as string,
        difficulty: formData.get('difficulty') as string,
        icon: formData.get('icon') as string,
        seasons: JSON.parse(formData.get('seasons') as string || '[]')
      };
      
      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        const filename = createSeoFriendlyFilename(
          body.name || '',
          undefined,
          imageFile.name
        );
        imageUrl = await uploadToCloudflare(imageFile, `fishing-techniques/${filename}`);
      }
    } else {
      body = await request.json();
    }

    const {
      name,
      name_en,
      description,
      description_en,
      detailed_description,
      detailed_description_en,
      difficulty,
      icon,
      seasons,
      tips_detailed
    } = body;

    // Duplicate kontrolü - Türkçe isim için
    const { data: existingTechnique } = await adminSupabase
      .from('fishing_techniques')
      .select('id')
      .eq('name', name)
      .single();
    
    if (existingTechnique) {
      return NextResponse.json({ 
        error: 'Bu isimde bir teknik zaten mevcut' 
      }, { status: 400 });
    }

    // Duplicate kontrolü - İngilizce isim için (eğer verilmişse)
    if (name_en) {
      const { data: existingTechniqueEn } = await adminSupabase
        .from('fishing_techniques')
        .select('id')
        .eq('name_en', name_en)
        .single();
      
      if (existingTechniqueEn) {
        return NextResponse.json({ 
          error: 'Bu İngilizce isimde bir teknik zaten mevcut' 
        }, { status: 400 });
      }
    }

    const { data, error } = await adminSupabase
      .from('fishing_techniques')
      .insert({
        name,
        name_en: name_en || null,
        description: description || null,
        description_en: description_en || null,
        detailed_description: detailed_description || null,
        detailed_description_en: detailed_description_en || null,
        difficulty,
        icon: icon || null,
        image_url: imageUrl || body.image_url || null,
        seasons: seasons || [],
        tips_detailed: tips_detailed || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    
    // Check if it's FormData (with image) or JSON
    const contentType = request.headers.get('content-type');
    let body: {
      id?: string;
      name?: string;
      name_en?: string;
      description?: string;
      description_en?: string;
      difficulty?: string;
      icon?: string;
      image_url?: string;
      season?: string;
      removeImage?: string;
    };
    let imageUrl: string | null = null;
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract form fields
      body = {
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        name_en: formData.get('name_en') as string,
        description: formData.get('description') as string,
        description_en: formData.get('description_en') as string,
        difficulty: formData.get('difficulty') as string,
        icon: formData.get('icon') as string,
        season: formData.get('season') as string,
        removeImage: formData.get('removeImage') as string
      };
      
      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        const filename = createSeoFriendlyFilename(
          body.name || '',
          undefined,
          imageFile.name
        );
        imageUrl = await uploadToCloudflare(imageFile, `fishing-techniques/${filename}`);
      }
    } else {
      body = await request.json();
    }

    const {
      id,
      name,
      name_en,
      description,
      description_en,
      difficulty,
      icon,
      season,
      removeImage
    } = body;

    const updateData: Record<string, string | null> = {
      name,
      name_en: name_en || null,
      description: description || null,
      description_en: description_en || null,
      difficulty,
      icon: icon || null,
      season: season || null,
      updated_at: new Date().toISOString()
    };

    // Handle image
    if (imageUrl) {
      updateData.image_url = imageUrl;
    } else if (removeImage === 'true') {
      updateData.image_url = null;
    }

    const { data, error } = await adminSupabase
      .from('fishing_techniques')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}