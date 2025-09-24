import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { uploadImage } from './unified-upload-service';
import Config from 'react-native-config';

interface CoverUploadResult {
  success: boolean;
  coverUrl?: string;
  error?: string;
}

export class CoverImageUploadService {
  /**
   * Ana upload fonksiyonu - Cover image için - Unified service kullanır
   */
  static async uploadCoverImage(): Promise<CoverUploadResult> {
    try {
      return new Promise((resolve) => {
        launchImageLibrary(
          {
            mediaType: 'photo',
            includeBase64: false,
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.9,
            selectionLimit: 1
          },
          async (response: ImagePickerResponse) => {
            // Kullanıcı iptal etti
            if (response.didCancel) {
              resolve({
                success: false,
                error: 'cancelled'
              });
              return;
            }

            // Hata oluştu
            if (response.errorCode) {
              resolve({
                success: false,
                error: response.errorMessage || 'Resim seçilemedi'
              });
              return;
            }

            // Resim seçildi
            if (response.assets && response.assets[0]) {
              const imageUri = response.assets[0].uri!;
              
              try {
                // Unified upload service kullan
                const result = await uploadImage(imageUri, {
                  type: 'cover',
                  cropToSquare: false,
                  maxWidth: 1920,
                  maxHeight: 1080,
                  quality: 0.85
                });
                
                if (result.success) {
                  resolve({
                    success: true,
                    coverUrl: result.url
                  });
                } else {
                  resolve({
                    success: false,
                    error: result.error || 'Kapak görseli yüklenemedi'
                  });
                }
              } catch (error: any) {
                resolve({
                  success: false,
                  error: error.message || 'Kapak görseli yüklenemedi'
                });
              }
            } else {
              resolve({
                success: false,
                error: 'Resim seçilemedi'
              });
            }
          }
        );
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Beklenmeyen bir hata oluştu'
      };
    }
  }
}

// Export convenience function
export const uploadCoverImage = CoverImageUploadService.uploadCoverImage.bind(CoverImageUploadService);

/**
 * Cover image silme fonksiyonu - Database ve R2'den siler
 */
export async function deleteCoverImage(): Promise<{ success: boolean; error?: string }> {
  try {
    const { getNativeSupabaseClient } = require('@fishivo/api/client/supabase.native');
    const supabase = getNativeSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }
    
    // R2'den dosyayı silmek için Edge Function'a DELETE request gönder
    const supabaseUrl = Config.NEXT_PUBLIC_SUPABASE_URL || Config.SUPABASE_URL;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Oturum bulunamadı' };
    }
    
    // Edge Function'a DELETE request (R2'den silmek için)
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/r2-upload`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'cover' })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // R2 delete failed - old cover remains
        return { success: false, error: `R2 silme hatası: ${response.status}` };
      }
      
      const result = await response.json();
      if (!result.success) {
        // R2 delete unsuccessful - old cover remains
        return { success: false, error: 'R2 dosya silinemedi' };
      }
    } catch (r2Error) {
      // R2 delete request error - old cover remains
      return { success: false, error: 'R2 bağlantı hatası' };
    }
    
    // Update database - set cover_image_url to null
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cover_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      return { success: false, error: 'Kapak görseli silinemedi' };
    }
    
    return { success: true };
  } catch (error) {
    // Cover delete error
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Kapak görseli silinemedi' 
    };
  }
}