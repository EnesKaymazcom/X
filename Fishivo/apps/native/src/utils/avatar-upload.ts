import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { uploadImage } from './unified-upload-service';
import Config from 'react-native-config';

interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export class AvatarUploadService {
  /**
   * Ana upload fonksiyonu - Unified service kullanır
   */
  static async uploadAvatar(): Promise<AvatarUploadResult> {
    try {
      // react-native-image-picker ile direkt galeri aç
      return new Promise((resolve) => {
        launchImageLibrary(
          {
            mediaType: 'photo',
            includeBase64: false,
            maxWidth: 2048,
            maxHeight: 2048,
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
                // Selected image URI
                // Unified upload service kullan
                const result = await uploadImage(imageUri, {
                  type: 'avatar',
                  cropToSquare: true,
                  maxWidth: 512,
                  maxHeight: 512,
                  quality: 0.85
                });
                
                // Upload service result
                
                if (result.success) {
                  resolve({
                    success: true,
                    avatarUrl: result.url
                  });
                } else {
                  resolve({
                    success: false,
                    error: result.error || 'Avatar yüklenemedi'
                  });
                }
              } catch (error: any) {
                resolve({
                  success: false,
                  error: error.message || 'Avatar yüklenemedi'
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
/**
 * Avatar silme fonksiyonu - Database ve R2'den siler
 */
export async function deleteAvatar(): Promise<{ success: boolean; error?: string }> {
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
        body: JSON.stringify({ type: 'avatar' })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // R2 delete failed - old avatar remains
        return { success: false, error: `R2 silme hatası: ${response.status}` };
      }
      
      const result = await response.json();
      if (!result.success) {
        // R2 delete unsuccessful - old avatar remains
        return { success: false, error: 'R2 dosya silinemedi' };
      }
    } catch (r2Error) {
      // R2 delete request error - old avatar remains
      return { success: false, error: 'R2 bağlantı hatası' };
    }
    
    // Update database - set avatar_url to null
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      return { success: false, error: 'Avatar silinemedi' };
    }
    
    return { success: true };
  } catch (error) {
    // Avatar delete error
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Avatar silinemedi' 
    };
  }
}

export const uploadAvatar = AvatarUploadService.uploadAvatar.bind(AvatarUploadService);