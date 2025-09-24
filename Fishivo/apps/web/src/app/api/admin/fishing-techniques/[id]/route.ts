import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server';
import { deleteFromCloudflare } from '@/lib/cloudflare-upload';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from('fishing_techniques')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Technique not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const body = await request.json();

    const {
      name,
      name_en,
      description,
      description_en,
      detailed_description,
      detailed_description_en,
      difficulty,
      icon,
      image_url,
      seasons,
      tips_detailed,
      old_image_url
    } = body;

    // Duplicate kontrolü - Türkçe isim için (kendisi hariç)
    const { data: existingTechnique } = await adminSupabase
      .from('fishing_techniques')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single();
    
    if (existingTechnique) {
      return NextResponse.json({ 
        error: 'Bu isimde bir teknik zaten mevcut' 
      }, { status: 400 });
    }

    // Duplicate kontrolü - İngilizce isim için (kendisi hariç)
    if (name_en) {
      const { data: existingTechniqueEn } = await adminSupabase
        .from('fishing_techniques')
        .select('id')
        .eq('name_en', name_en)
        .neq('id', id)
        .single();
      
      if (existingTechniqueEn) {
        return NextResponse.json({ 
          error: 'Bu İngilizce isimde bir teknik zaten mevcut' 
        }, { status: 400 });
      }
    }

    // If image URL changed, delete old image from R2
    if (old_image_url && old_image_url !== image_url) {
      try {
        await deleteFromCloudflare(old_image_url);
      } catch (error) {
        // Log error but don't fail the update
        console.error('Failed to delete old image:', error);
      }
    }

    const { data, error } = await adminSupabase
      .from('fishing_techniques')
      .update({
        name,
        name_en: name_en || null,
        description: description || null,
        description_en: description_en || null,
        detailed_description: detailed_description || null,
        detailed_description_en: detailed_description_en || null,
        difficulty,
        icon: icon || null,
        image_url: image_url || null,
        seasons: seasons || [],
        tips_detailed: tips_detailed || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Technique not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();

    // First get the technique to get the image URL
    const { data: technique } = await adminSupabase
      .from('fishing_techniques')
      .select('image_url')
      .eq('id', id)
      .single();

    // Delete the technique from database
    const { error } = await adminSupabase
      .from('fishing_techniques')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If deletion successful and there was an image, delete it from R2
    if (technique?.image_url) {
      try {
        await deleteFromCloudflare(technique.image_url);
      } catch (error) {
        // Log error but don't fail the deletion
        console.error('Failed to delete image from R2:', error);
      }
    }

    return NextResponse.json({ message: 'Technique deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}