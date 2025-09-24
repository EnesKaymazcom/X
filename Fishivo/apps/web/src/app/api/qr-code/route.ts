import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server';
import { uploadToCloudflare } from '@/lib/cloudflare-upload';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // JSON veya FormData kabul et
    const contentType = request.headers.get('content-type');
    let qrImage: File;
    let qrCodeId: string;

    if (contentType?.includes('application/json')) {
      const json = await request.json();
      qrCodeId = json.qrCodeId;
      
      if (!json.qrImageBase64 || !qrCodeId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
      // Base64'ü File'a dönüştür
      const buffer = Buffer.from(json.qrImageBase64, 'base64');
      const blob = new Blob([buffer], { type: 'image/png' });
      qrImage = new File([blob], 'qr-code.png', { type: 'image/png' });
    } else {
      const formData = await request.formData();
      const qrImageData = formData.get('qrImage') as any;
      qrCodeId = formData.get('qrCodeId') as string;
      
      if (!qrImageData || !qrCodeId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
      // Base64 data URL'den File'a dönüştür
      if (typeof qrImageData === 'object' && qrImageData.uri && qrImageData.uri.startsWith('data:')) {
        const base64Data = qrImageData.uri.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: 'image/png' });
        qrImage = new File([blob], 'qr-code.png', { type: 'image/png' });
      } else {
        qrImage = qrImageData as File;
      }
    }

    // Cloudflare R2'ye yükle
    const key = `qr-codes/${user.id}/${qrCodeId}.png`;
    const imageUrl = await uploadToCloudflare(qrImage, key);

    // Veritabanına kaydet
    const { error } = await supabase
      .from('users')
      .update({
        qr_code_id: qrCodeId,
        qr_code_image_url: imageUrl,
        qr_code_generated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error saving QR code:', error);
    return NextResponse.json({ 
      error: 'Failed to save QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('qr_code_id, qr_code_image_url, qr_code_generated_at')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json({
      qrCodeId: data.qr_code_id,
      qrCodeImageUrl: data.qr_code_image_url,
      generatedAt: data.qr_code_generated_at
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json({ error: 'Failed to fetch QR code' }, { status: 500 });
  }
}