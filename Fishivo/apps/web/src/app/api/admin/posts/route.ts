import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server';

interface PostData {
  id: number;
  title: string;
  content: string;
  images?: string[];
  image_url?: string;
  user_id: string;
  created_at: string;
  status: string;
  location?: {
    name?: string;
    city?: string;
    district?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  catch_details?: {
    species_name?: string;
    weight?: number;
    length?: number;
    weather?: {
      temperature?: number;
      description?: string;
      wind_speed?: number;
      wind_direction?: string;
      humidity?: number;
      pressure?: number;
    };
    catch_time?: string;
  };
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  likes?: { count: number }[];
  comments?: { count: number }[];
}

interface PostResponse {
  id: number;
  title: string;
  content: string;
  images?: string[];
  image_url?: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  status: string;
  location?: {
    name?: string;
    city?: string;
    district?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  fish_species?: string;
  fish_weight?: number;
  fish_length?: number;
  weather?: {
    temperature?: number;
    description?: string;
    wind_speed?: number;
    wind_direction?: string;
    humidity?: number;
    pressure?: number;
  };
  catch_time?: string;
  report_count: number;
  likes_count: number;
  comments_count: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const reported = searchParams.get('reported') === 'true';
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    
    // First, let's get the posts with basic info
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        images,
        image_url,
        user_id,
        created_at,
        status,
        location,
        catch_details,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        ),
        likes:likes(count),
        comments:comments(count)
      `, { count: 'exact' });

    // Status filtresi
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Arama filtresi
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,profiles.username.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
    }

    // Sıralama ve pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch admin posts', message: error.message },
        { status: 500 }
      );
    }

    // Get report counts for each post
    let posts: PostResponse[] = [];
    if (data && data.length > 0) {
      const postIds = data.map((post: PostData) => post.id);
      
      // Fetch report counts for these posts
      const { data: reportCounts, error: reportError } = await supabase
        .from('reports')
        .select('target_id')
        .eq('target_type', 'post')
        .in('target_id', postIds);

      if (reportError) {
        console.error('Error fetching report counts:', reportError);
      }

      // Count reports per post
      const reportCountMap: Record<number, number> = {};
      if (reportCounts) {
        reportCounts.forEach((report: { target_id: number }) => {
          reportCountMap[report.target_id] = (reportCountMap[report.target_id] || 0) + 1;
        });
      }

      // Map posts with report counts
      posts = data.map((item: PostData) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        images: item.images,
        image_url: item.image_url,
        user_id: item.user_id,
        username: item.profiles?.username || '',
        full_name: item.profiles?.full_name || '',
        avatar_url: item.profiles?.avatar_url,
        created_at: item.created_at,
        status: item.status,
        location: item.location,
        fish_species: item.catch_details?.species_name,
        fish_weight: item.catch_details?.weight,
        fish_length: item.catch_details?.length,
        weather: item.catch_details?.weather,
        catch_time: item.catch_details?.catch_time,
        report_count: reportCountMap[item.id] || 0,
        likes_count: item.likes?.[0]?.count || 0,
        comments_count: item.comments?.[0]?.count || 0,
      }));

      // Filter by reported if needed
      if (reported) {
        posts = posts.filter((post) => post.report_count > 0);
      }
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      items: posts,
      total,
      page,
      limit,
      hasMore,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}