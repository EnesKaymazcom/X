import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const { error } = await supabase
      .from('posts')
      .update({ 
        status: 'deleted',
        deleted_reason: reason,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete post', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    const updates = await request.json();

    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update post', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}