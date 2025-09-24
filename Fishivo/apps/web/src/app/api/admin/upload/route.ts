import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server';
import { uploadToCloudflare } from '@/lib/cloudflare-upload';
import { createSeoFriendlyFilename } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı kontrolü
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    const name = formData.get('name') as string || '';

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Create SEO-friendly filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    let filename = '';

    switch(type) {
      case 'fishing-technique':
        filename = `fishing-techniques/${createSeoFriendlyFilename(name || 'technique', '', `${timestamp}.${extension}`)}`;
        break;
      case 'species':
        filename = `species/${createSeoFriendlyFilename(name || 'fish', '', `${timestamp}.${extension}`)}`;
        break;
      case 'equipment':
        filename = `equipment/${createSeoFriendlyFilename(name || 'gear', '', `${timestamp}.${extension}`)}`;
        break;
      default:
        filename = `uploads/${timestamp}.${extension}`;
    }

    // Upload to Cloudflare R2
    const imageUrl = await uploadToCloudflare(file, filename);

    return NextResponse.json({ 
      url: imageUrl,
      success: true 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}