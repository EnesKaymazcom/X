import { generateUniqueId } from '@fishivo/utils';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import type { 
  QRCodeData, 
  QRCodeGenerateOptions, 
  QRCodeResponse,
  QRCodeSaveOptions 
} from './qr-code.types';

export class QRCodeServiceNative {
  static async generateQRCode(options: QRCodeGenerateOptions): Promise<QRCodeResponse> {
    const qrId = `FSH-${options.username}-${generateUniqueId(6)}`;
    
    const qrData: QRCodeData = {
      app: 'fishivo',
      version: '1.0',
      type: 'profile',
      userId: options.userId,
      username: options.username,
      qrId,
      createdAt: new Date().toISOString()
    };
    
    // Bu data React Native tarafında QR kod oluşturmak için kullanılacak
    return {
      qrCodeId: qrId,
      qrCodeImageUrl: '', // Bu React Native'de doldurulacak
      qrCodeData: qrData
    };
  }

  static async saveQRCode(options: QRCodeSaveOptions): Promise<void> {
    const supabase = getNativeSupabaseClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        qr_code_id: options.qrCodeId,
        qr_code_image_url: options.imageUrl,
        qr_code_generated_at: new Date().toISOString()
      })
      .eq('id', options.userId);

    if (error) throw error;
  }

  static async getUserQRCode(userId: string): Promise<{ qrCodeId: string | null; qrCodeImageUrl: string | null } | null> {
    const supabase = getNativeSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('qr_code_id, qr_code_image_url')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    
    return {
      qrCodeId: data.qr_code_id,
      qrCodeImageUrl: data.qr_code_image_url
    };
  }

  static async regenerateQRCode(userId: string, username: string): Promise<QRCodeResponse> {
    const supabase = getNativeSupabaseClient();
    
    // Önce mevcut count'u al
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('qr_code_regenerated_count')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Yenileme sayısını artır
    const currentCount = userData?.qr_code_regenerated_count || 0;
    const { error } = await supabase
      .from('users')
      .update({ 
        qr_code_regenerated_count: currentCount + 1
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Yeni QR kod oluştur
    return this.generateQRCode({ userId, username });
  }
}