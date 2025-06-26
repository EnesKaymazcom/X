// Image Upload Service for React Native
// This service handles image picking and uploading functionality

interface ImageUploadResponse {
  success: boolean;
  data?: {
    variants: {
      thumbnail: string;
      medium: string;
      large: string;
      original: string;
    };
    originalFilename: string;
    size: number;
    uploadType: string;
  };
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    size: number;
  };
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ImagePickerResult {
  didCancel?: boolean;
  errorMessage?: string;
  assets?: {
    uri: string;
    type: string;
    fileName?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }[];
}

export class ImageUploadService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.API_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Pick image from camera or gallery
   * In a real implementation, this would use react-native-image-picker
   */
  async pickImage(source: 'camera' | 'gallery'): Promise<ImagePickerResult | null> {
    try {
      console.log(`📷 ImageUpload: Picking image from ${source}`);
      
      // In a real implementation, this would use react-native-image-picker:
      // const options = {
      //   mediaType: 'photo' as MediaType,
      //   includeBase64: false,
      //   maxHeight: 2000,
      //   maxWidth: 2000,
      //   quality: 0.8,
      // };
      // 
      // return new Promise((resolve) => {
      //   const callback = (response: ImagePickerResponse) => {
      //     if (response.didCancel || response.errorMessage) {
      //       resolve(null);
      //     } else {
      //       resolve(response.assets?.[0] || null);
      //     }
      //   };
      //
      //   if (source === 'camera') {
      //     launchCamera(options, callback);
      //   } else {
      //     launchImageLibrary(options, callback);
      //   }
      // });

      // Placeholder implementation for development
      const mockResult: ImagePickerResult = {
        didCancel: false,
        assets: [{
          uri: 'https://via.placeholder.com/400x300.jpg',
          type: 'image/jpeg',
          fileName: `${source}_image_${Date.now()}.jpg`,
          fileSize: 1024 * 100 // 100KB
        }]
      };

      return mockResult;
    } catch (error) {
      console.error('❌ Error picking image:', error);
      return null;
    }
  }

  /**
   * Upload image to backend
   */
  async uploadImage(
    imageUri: string,
    metadata: {
      type: 'catch' | 'spot' | 'profile' | 'equipment';
      fishSpecies?: string;
      spotName?: string;
    },
    authToken: string
  ): Promise<ImageUploadResponse> {
    try {
      console.log(`📤 ImageUpload: Uploading ${metadata.type} image`);
      
      // Create form data
      const formData = new FormData();
      
      // Add image file
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${metadata.type}_${Date.now()}.jpg`,
      } as any;

      formData.append('image', imageFile);
      formData.append('type', metadata.type);
      
      if (metadata.fishSpecies) {
        formData.append('fishSpecies', metadata.fishSpecies);
      }
      
      if (metadata.spotName) {
        formData.append('spotName', metadata.spotName);
      }

      // Upload to backend
      const response = await fetch(`${this.baseUrl}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      console.log('✅ ImageUpload: Upload successful');
      
      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple images in sequence
   */
  async uploadMultipleImages(
    imageUris: string[],
    metadata: {
      type: 'catch' | 'spot' | 'profile' | 'equipment';
      fishSpecies?: string;
      spotName?: string;
    },
    authToken: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{
    success: boolean;
    uploadedImages: string[];
    failedImages: string[];
  }> {
    console.log(`📤 ImageUpload: Uploading ${imageUris.length} images`);
    
    const uploadedImages: string[] = [];
    const failedImages: string[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      
      const result = await this.uploadImage(uri, metadata, authToken);
      
      if (result.success && result.data) {
        uploadedImages.push(result.data.variants.medium); // Use medium size for display
      } else {
        failedImages.push(uri);
      }

      // Progress callback
      if (onProgress) {
        const progress: UploadProgress = {
          loaded: i + 1,
          total: imageUris.length,
          percentage: Math.round(((i + 1) / imageUris.length) * 100),
        };
        onProgress(progress);
      }
    }

    console.log(`✅ ImageUpload: Completed. Success: ${uploadedImages.length}, Failed: ${failedImages.length}`);
    
    return {
      success: failedImages.length === 0,
      uploadedImages,
      failedImages
    };
  }

  /**
   * Show image picker options
   * In a real implementation, this would show a native alert
   */
  showImagePicker(onSelect: (result: ImagePickerResult | null) => void) {
    console.log('📷 ImageUpload: Showing image picker options');
    
    // In a real implementation, this would use Alert from react-native:
    // Alert.alert(
    //   'Fotoğraf Seç',
    //   'Nereden fotoğraf eklemek istiyorsunuz?',
    //   [
    //     { 
    //       text: 'Kamera', 
    //       onPress: async () => {
    //         const result = await this.pickImage('camera');
    //         onSelect(result);
    //       }
    //     },
    //     { 
    //       text: 'Galeri', 
    //       onPress: async () => {
    //         const result = await this.pickImage('gallery');
    //         onSelect(result);
    //       }
    //     },
    //     { text: 'İptal', style: 'cancel' }
    //   ]
    // );

    // For now, just pick from gallery as default
    this.pickImage('gallery').then(onSelect);
  }

  /**
   * Validate image file
   */
  validateImage(imageResult: ImagePickerResult): {
    isValid: boolean;
    error?: string;
  } {
    // Check if result has assets
    if (!imageResult.assets || imageResult.assets.length === 0) {
      return {
        isValid: false,
        error: 'Geçersiz resim'
      };
    }

    const asset = imageResult.assets[0];
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (asset.fileSize && asset.fileSize > maxSize) {
      return {
        isValid: false,
        error: 'Dosya boyutu çok büyük (maksimum 10MB)'
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(asset.type)) {
      return {
        isValid: false,
        error: 'Desteklenmeyen dosya formatı'
      };
    }

    return { isValid: true };
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(uri: string): Promise<{ width: number; height: number } | null> {
    try {
      // In a real implementation, this would use Image.getSize from react-native:
      // return new Promise((resolve, reject) => {
      //   Image.getSize(uri, (width, height) => {
      //     resolve({ width, height });
      //   }, reject);
      // });

      // Placeholder implementation
      return { width: 400, height: 300 };
    } catch (error) {
      console.error('❌ Error getting image dimensions:', error);
      return null;
    }
  }

  /**
   * Compress image before upload
   */
  async compressImage(uri: string, quality = 0.8): Promise<string> {
    try {
      // In a real implementation, this would use react-native-image-resizer:
      // const resizedImage = await ImageResizer.createResizedImage(
      //   uri,
      //   800, // max width
      //   600, // max height
      //   'JPEG',
      //   quality * 100,
      //   0, // rotation
      //   undefined, // output path
      //   false, // keep meta
      //   { mode: 'contain', onlyScaleDown: true }
      // );
      // return resizedImage.uri;

      // For now, return original URI
      return uri;
    } catch (error) {
      console.error('❌ Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
export type { ImageUploadResponse };