import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server';
import type { PaginatedSpots } from '@fishivo/types/models/spot';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const spotType = searchParams.get('spot_type');
    const search = searchParams.get('search');
    const userId = searchParams.get('user_id');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query - First get spots
    let spotsQuery = supabase
      .from('spots')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      spotsQuery = spotsQuery.eq('status', status);
    }

    if (spotType && spotType !== 'all') {
      spotsQuery = spotsQuery.eq('spot_type', spotType);
    }

    if (search) {
      spotsQuery = spotsQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (userId) {
      spotsQuery = spotsQuery.eq('user_id', userId);
    }

    // Apply sorting and pagination
    spotsQuery = spotsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: spotsData, error: spotsError, count } = await spotsQuery;

    if (spotsError) {
      console.error('Error fetching spots:', spotsError);
      return NextResponse.json({ error: spotsError.message }, { status: 500 });
    }

    // Get unique user IDs
    const userIds = [...new Set(spotsData?.map(spot => spot.user_id) || [])];
    
    // Fetch user profiles separately
    let users: any[] = [];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      
      users = profilesData || [];
    }

    // Create a map for quick user lookup
    const userMap = new Map(users.map(user => [user.id, user]));

    // Transform data to match frontend expectations
    const transformedData = spotsData?.map(spot => ({
      ...spot,
      location: spot.location || { lat: 0, lng: 0, name: '' },
      fish_species: spot.fish_species || [],
      facilities: spot.facilities || [],
      bottom_type: spot.bottom_type || [],
      rating: spot.rating || 0,
      rating_count: spot.rating_count || 0,
      catches_count: spot.catches_count || 0,
      user: userMap.get(spot.user_id) || null,
    })) || [];

    const response: PaginatedSpots = {
      items: transformedData,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/spots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}