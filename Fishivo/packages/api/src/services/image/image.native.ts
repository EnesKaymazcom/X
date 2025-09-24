import { 
  launchImageLibrary, 
  launchCamera, 
  ImagePickerResponse, 
  ImageLibraryOptions,
  CameraOptions 
} from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import { imageCropService, CropOptions } from './image-crop.native'
// r2DirectUpload removed - using native utils directly

export interface ImageUploadOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: AspectRatioType
}

export interface AspectRatio {
  name: string
  ratio: number
  width: number
  height: number
  icon?: string
}

export type AspectRatioType = 'portrait' | 'square' | 'landscape'

export const ASPECT_RATIOS: Record<AspectRatioType, AspectRatio> = {
  portrait: { 
    name: 'Portrait (4:5)', 
    ratio: 0.8, 
    width: 1080, 
    height: 1350,
    icon: 'smartphone'
  },
  square: { 
    name: 'Square (1:1)', 
    ratio: 1, 
    width: 1080, 
    height: 1080,
    icon: 'square'
  },
  landscape: { 
    name: 'Landscape (4:3)', 
    ratio: 1.33, 
    width: 1080, 
    height: 810,
    icon: 'monitor'
  }
}

// Temporary: react-native-image-crop-picker removed due to native linking issues
// Will use react-native-image-picker with manual cropping instead

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface AspectRatioCheck {
  needsCrop: boolean;
  detectedRatio: string;
  targetRatio: 'square' | 'portrait' | 'landscape' | null;
}

export class ImageUploadService {
  /**
   * Görsel aspect ratio kontrolü
   * 1:1 (square), 4:5 (portrait), 4:3 (landscape) formatları kabul edilir
   */
  checkAspectRatio(width: number, height: number): AspectRatioCheck {
    const ratio = width / height;
    const tolerance = 0.02;

    // Kabul edilebilir formatlar
    if (Math.abs(ratio - 1.0) < tolerance) {
      return { needsCrop: false, detectedRatio: '1:1', targetRatio: 'square' };
    }
    if (Math.abs(ratio - 0.8) < tolerance) {
      return { needsCrop: false, detectedRatio: '4:5', targetRatio: 'portrait' };
    }
    if (Math.abs(ratio - 1.33) < tolerance) {
      return { needsCrop: false, detectedRatio: '4:3', targetRatio: 'landscape' };
    }

    // Crop gerekli - en yakın hedef ratio'yu belirle
    if (ratio < 0.9) {
      return { needsCrop: true, detectedRatio: `1:${(1/ratio).toFixed(1)}`, targetRatio: 'portrait' };
    } else if (ratio > 1.1) {
      return { needsCrop: true, detectedRatio: `${ratio.toFixed(1)}:1`, targetRatio: 'landscape' };
    } else {
      return { needsCrop: true, detectedRatio: `${ratio.toFixed(2)}:1`, targetRatio: 'square' };
    }
  }
  private options: ImageLibraryOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.7, // Instagram-like compression
    selectionLimit: 3 // Allow multiple selection from gallery
  }
  
  private cameraOptions: CameraOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.7, // Instagram-like compression
    saveToPhotos: false
  }
  
  private validateImageFile(asset: any): void {
    // Validate file size
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      throw new Error(`Dosya boyutu çok büyük. Maksimum ${MAX_FILE_SIZE / 1024 / 1024}MB izin verilir.`);
    }

    // Validate file type
    if (asset.type && !ALLOWED_IMAGE_TYPES.includes(asset.type)) {
      throw new Error('Geçersiz dosya tipi. Sadece JPG, PNG ve WEBP dosyaları yüklenebilir.');
    }

    // Validate file extension
    if (asset.fileName) {
      const extension = asset.fileName.toLowerCase().match(/\.[^.]+$/);
      if (extension && !ALLOWED_EXTENSIONS.includes(extension[0])) {
        throw new Error('Geçersiz dosya uzantısı.');
      }
    }
  }

  async pickImage(source: 'camera' | 'gallery'): Promise<ImagePickerResponse> {
    const launcher = source === 'camera' ? launchCamera : launchImageLibrary
    const options = source === 'camera' ? this.cameraOptions : this.options
    
    return new Promise((resolve, reject) => {
      launcher(options, (response) => {
        if (response.errorMessage) {
          reject(new Error(response.errorMessage))
        } else if (response.errorCode) {
          reject(new Error(`Error code: ${response.errorCode}`))
        } else {
          // Validate all selected images
          if (response.assets) {
            for (const asset of response.assets) {
              try {
                this.validateImageFile(asset);
              } catch (error) {
                reject(error);
                return;
              }
            }
          }
          resolve(response)
        }
      })
    })
  }

  /**
   * Tek görsel seçimi için özel method (profil fotoğrafı vb.)
   */
  async pickSingleImage(source: 'camera' | 'gallery'): Promise<ImagePickerResponse> {
    const launcher = source === 'camera' ? launchCamera : launchImageLibrary
    
    // Tek görsel için özel options
    const singleImageOptions: ImageLibraryOptions | CameraOptions = {
      ...(source === 'camera' ? this.cameraOptions : this.options),
      selectionLimit: 1 // Sadece 1 görsel seçilebilir
    }
    
    return new Promise((resolve, reject) => {
      launcher(singleImageOptions, (response) => {
        if (response.errorMessage) {
          reject(new Error(response.errorMessage))
        } else if (response.errorCode) {
          reject(new Error(`Error code: ${response.errorCode}`))
        } else {
          // Validate selected image
          if (response.assets && response.assets[0]) {
            try {
              this.validateImageFile(response.assets[0]);
            } catch (error) {
              reject(error);
              return;
            }
          }
          resolve(response)
        }
      })
    })
  }

  /**
   * Crop olmadan fotoğraf seç
   */
  async pickImageWithoutCrop(source: 'camera' | 'gallery'): Promise<string> {
    
    try {
      const response = await this.pickImage(source);
      
      if (response.didCancel || !response.assets || response.assets.length === 0) {
        throw new Error('User cancelled image selection');
      }
      
      const asset = response.assets[0];
      if (!asset.uri) {
        throw new Error('No image URI found');
      }
      
      return asset.uri;
    } catch (error) {
      throw error;
    }
  }
  
  async pickImageWithCrop(aspectRatio: AspectRatioType = 'portrait', cropperTitle?: string): Promise<string> {
    try {
      // Try to use image-crop-picker first
      const imageUri = await imageCropService.openPickerWithCrop({
        aspectRatio,
        quality: 0.7,
        showCropGuidelines: true,
        cropperTitle: cropperTitle || 'Crop Photo',
        freeStyleCrop: false
      });
      
      return imageUri;
    } catch (error: any) {
      // Fallback to manual resize if crop-picker fails
      
      const ratio = ASPECT_RATIOS[aspectRatio];
      const response = await this.pickImage('gallery');
      
      if (response.didCancel || !response.assets || response.assets.length === 0) {
        throw new Error('User cancelled image selection');
      }
      
      const asset = response.assets[0];
      if (!asset.uri) {
        throw new Error('No image URI found');
      }
      
      // Manual aspect ratio crop by resizing
      const compressedPath = await this.compressImage(asset.uri, {
        quality: 70,
        maxWidth: ratio.width,
        maxHeight: ratio.height
      });
      
      return compressedPath;
    }
  }
  
  async pickImageFromCameraWithCrop(aspectRatio: AspectRatioType = 'portrait', cropperTitle?: string): Promise<string> {
    try {
      // Try to use image-crop-picker first
      const imageUri = await imageCropService.openCameraWithCrop({
        aspectRatio,
        quality: 0.7,
        showCropGuidelines: true,
        cropperTitle: cropperTitle || 'Crop Photo',
        freeStyleCrop: false
      });
      
      return imageUri;
    } catch (error: any) {
      // Fallback to manual resize if crop-picker fails
      
      const ratio = ASPECT_RATIOS[aspectRatio];
      const response = await this.pickImage('camera');
      
      if (response.didCancel || !response.assets || response.assets.length === 0) {
        throw new Error('User cancelled camera');
      }
      
      const asset = response.assets[0];
      if (!asset.uri) {
        throw new Error('No image URI found');
      }
      
      // Manual aspect ratio crop by resizing
      const compressedPath = await this.compressImage(asset.uri, {
        quality: 70,
        maxWidth: ratio.width,
        maxHeight: ratio.height
      });
      
      return compressedPath;
    }
  }
  
  async uploadToServer(imageUri: string, endpoint: string, token: string): Promise<any> {
    // Note: R2 direct upload is now handled by native utils (apps/native/src/utils/r2-upload.ts)
    // This fallback method is for legacy compatibility only
    
    // Fallback to web API
    const formData = new FormData()
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'profile.jpg'
    
    // Determine mime type from filename
    const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '.jpg';
    let mimeType = 'image/jpeg';
    if (extension === '.png') mimeType = 'image/png';
    else if (extension === '.webp') mimeType = 'image/webp';

    formData.append('avatar', {
      uri: imageUri,
      type: mimeType,
      name: filename
    } as any)
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = 'Upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // If not JSON, use status text
          if (response.status === 404) {
            errorMessage = 'Upload endpoint not found. Please ensure the server is running.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (response.status === 413) {
            errorMessage = 'Image too large. Please choose a smaller image.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      // Network errors
      if (error.message === 'Network request failed') {
        throw new Error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin ve sunucunun çalıştığından emin olun.');
      }
      
      throw error;
    }
  }
  
  async compressImage(uri: string, options?: ImageUploadOptions): Promise<string> {
    try {
      const resized = await ImageResizer.createResizedImage(
        uri,
        options?.maxWidth || 1920,
        options?.maxHeight || 1920,
        'JPEG',
        options?.quality || 70, // Instagram-like quality
        0, // rotation
        undefined, // outputPath
        false, // keepMeta
      )
      return resized.uri
    } catch (error) {
      return uri // Fallback to original
    }
  }

  /**
   * Çoklu görsel seçimi (crop olmadan)
   */
  async pickMultipleImages(maxFiles: number = 5): Promise<string[]> {
    
    try {
      // Multiple selection için options'u güncelle
      const multipleOptions: ImageLibraryOptions = {
        ...this.options,
        selectionLimit: maxFiles, // Birden fazla seçim için
      };
      
      return new Promise((resolve, reject) => {
        launchImageLibrary(multipleOptions, (response) => {
          
          if (response.errorMessage) {
            reject(new Error(response.errorMessage));
          } else if (response.errorCode) {
            reject(new Error(`Error code: ${response.errorCode}`));
          } else if (response.didCancel || !response.assets || response.assets.length === 0) {
            reject(new Error('User cancelled image selection'));
          } else {
            // Validate all selected images
            for (const asset of response.assets) {
              try {
                this.validateImageFile(asset);
              } catch (error) {
                reject(error);
                return;
              }
            }
            
            // Tüm seçilen görsellerin URI'lerini döndür
            const uris = response.assets
              .filter(asset => asset.uri)
              .map(asset => asset.uri!)
              .slice(0, maxFiles);
              
            resolve(uris);
          }
        });
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Mevcut bir görseli kırp
   */
  async cropExistingImage(imageUri: string, aspectRatio: AspectRatioType = 'portrait', cropperTitle?: string): Promise<string> {
    try {
      const croppedUri = await imageCropService.cropImage(imageUri, {
        aspectRatio,
        quality: 0.7,
        showCropGuidelines: true,
        cropperTitle: cropperTitle || 'Edit Photo'
      });
      
      return croppedUri;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Profil fotoğrafı için özel circular crop
   */
  async pickProfileImage(cropperTitle?: string): Promise<string> {
    try {
      const imageUri = await imageCropService.openPickerWithCrop({
        aspectRatio: 'square',
        quality: 0.8,
        circular: true,
        cropperTitle: cropperTitle || 'Profile Photo'
      });
      
      return imageUri;
    } catch (error: any) {
      // Fallback
      return this.pickImageWithCrop('square', cropperTitle);
    }
  }

  /**
   * Spot görseli için özel method - tek görsel, sadece 4:3
   */
  async pickSpotImage(source: 'camera' | 'gallery'): Promise<string> {
    const launcher = source === 'camera' ? launchCamera : launchImageLibrary
    
    // Tek görsel için özel options
    const spotImageOptions: ImageLibraryOptions | CameraOptions = {
      ...(source === 'camera' ? this.cameraOptions : this.options),
      selectionLimit: 1 // Sadece 1 görsel seçilebilir
    }
    
    try {
      const response = await new Promise<ImagePickerResponse>((resolve, reject) => {
        launcher(spotImageOptions, (response) => {
          if (response.errorMessage) {
            reject(new Error(response.errorMessage))
          } else if (response.errorCode) {
            reject(new Error(`Error code: ${response.errorCode}`))
          } else {
            // Validate selected image
            if (response.assets && response.assets[0]) {
              try {
                this.validateImageFile(response.assets[0]);
              } catch (error) {
                reject(error);
                return;
              }
            }
            resolve(response)
          }
        });
      });

      if (response.didCancel || !response.assets || response.assets.length === 0) {
        throw new Error('User cancelled image selection');
      }
      
      const asset = response.assets[0];
      if (!asset.uri) {
        throw new Error('No image URI found');
      }
      
      return asset.uri;
    } catch (error) {
      throw error;
    }
  }
}

export const imageUploadService = new ImageUploadService()