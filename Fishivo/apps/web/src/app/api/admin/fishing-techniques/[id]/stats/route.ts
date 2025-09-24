import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@fishivo/api/client/supabase.server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();

    // Get stats from the view
    const { data: stats, error } = await adminSupabase
      .from('fishing_technique_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching technique stats:', error);
      return NextResponse.json({
        total_uses: 0,
        success_rate: 0,
        popular_species: [],
        popular_equipment: []
      });
    }

    // Format the response
    const formattedStats = {
      total_uses: stats?.total_uses || 0,
      success_rate: Math.round((stats?.total_uses || 0) * 0.75), // Simulated success rate
      popular_species: stats?.caught_species || [],
      popular_equipment: stats?.used_equipment || []
    };

    return NextResponse.json(formattedStats);
  } catch (error: any) {
    console.error('Error in technique stats:', error);
    return NextResponse.json({
      total_uses: 0,
      success_rate: 0,
      popular_species: [],
      popular_equipment: []
    });
  }
}