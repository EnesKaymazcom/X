import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server';

// GET single spot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('spots')
      .select(`
        *,
        user:profiles!spots_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching spot:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform data
    const transformedData = {
      ...data,
      location: data.location || { lat: 0, lng: 0, name: '' },
      fish_species: data.fish_species || [],
      facilities: data.facilities || [],
      bottom_type: data.bottom_type || [],
      rating: data.rating || 0,
      rating_count: data.rating_count || 0,
      catches_count: data.catches_count || 0,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in GET /api/admin/spots/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update spot status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If approving, set approval data
    if (status === 'approved') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('spots')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:profiles!spots_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating spot status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/admin/spots/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE spot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    // Soft delete - update status to deleted
    const { error } = await supabase
      .from('spots')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'Deleted by admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting spot:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/spots/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}