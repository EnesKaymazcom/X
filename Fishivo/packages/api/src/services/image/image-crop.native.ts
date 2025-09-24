import ImagePicker, { Options, Image } from 'react-native-image-crop-picker';
import { ASPECT_RATIOS, AspectRatioType, AspectRatio } from './image.native';

export interface CropOptions {
  aspectRatio?: AspectRatioType;
  customRatio?: { width: number; height: number };
  quality?: number;
  freeStyleCrop?: boolean;
  includeBase64?: boolean;
  showCropGuidelines?: boolean;
  hideBottomControls?: boolean;
  cropperTitle?: string;
  circular?: boolean;
}

export class ImageCropService {
  private static instance: ImageCropService;

  private constructor() {}

  static getInstance(): ImageCropService {
    if (!ImageCropService.instance) {
      ImageCropService.instance = new ImageCropService();
    }
    return ImageCropService.instance;
  }

  /**
   * Kameradan fotoğraf çek ve kırp
   */
  async openCameraWithCrop(options: CropOptions = {}): Promise<string> {
    const { aspectRatio = 'portrait', quality = 0.8, ...restOptions } = options;
    const ratio = this.getAspectRatio(aspectRatio, options.customRatio);

    try {
      const pickerOptions: Options = {
        cropping: true,
        width: ratio.width,
        height: ratio.height,
        compressImageQuality: quality,
        mediaType: 'photo',
        freeStyleCropEnabled: restOptions.freeStyleCrop || false,
        showCropGuidelines: restOptions.showCropGuidelines !== false,
        hideBottomControls: restOptions.hideBottomControls || false,
        cropperToolbarTitle: restOptions.cropperTitle || 'Crop Photo',
        cropperCircleOverlay: restOptions.circular || false,
        includeBase64: restOptions.includeBase64 || false,
        forceJpg: true,
      };

      const image = await ImagePicker.openCamera(pickerOptions);
      return this.processImage(image);
    } catch (error: any) {
      if (error.code === 'E_PICKER_CANCELLED') {
        throw new Error('User cancelled camera');
      }
      throw error;
    }
  }

  /**
   * Galeriden fotoğraf seç ve kırp
   */
  async openPickerWithCrop(options: CropOptions = {}): Promise<string> {
    const { aspectRatio = 'portrait', quality = 0.8, ...restOptions } = options;
    const ratio = this.getAspectRatio(aspectRatio, options.customRatio);

    try {
      const pickerOptions: Options = {
        cropping: true,
        width: ratio.width,
        height: ratio.height,
        compressImageQuality: quality,
        mediaType: 'photo',
        freeStyleCropEnabled: restOptions.freeStyleCrop || false,
        showCropGuidelines: restOptions.showCropGuidelines !== false,
        hideBottomControls: restOptions.hideBottomControls || false,
        cropperToolbarTitle: restOptions.cropperTitle || 'Crop Photo',
        cropperCircleOverlay: restOptions.circular || false,
        includeBase64: restOptions.includeBase64 || false,
        forceJpg: true,
      };

      const image = await ImagePicker.openPicker(pickerOptions);
      return this.processImage(image);
    } catch (error: any) {
      if (error.code === 'E_PICKER_CANCELLED') {
        throw new Error('User cancelled picker');
      }
      throw error;
    }
  }

  /**
   * Çoklu fotoğraf seçimi (crop olmadan)
   */
  async openMultiplePicker(maxFiles: number = 10, quality: number = 0.8): Promise<string[]> {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        maxFiles,
        compressImageQuality: quality,
        mediaType: 'photo',
        forceJpg: true,
      });

      return (images as Image[]).map(image => this.processImage(image));
    } catch (error: any) {
      if (error.code === 'E_PICKER_CANCELLED') {
        throw new Error('User cancelled picker');
      }
      throw error;
    }
  }

  /**
   * Var olan bir görseli kırp
   */
  async cropImage(
    path: string,
    options: CropOptions = {}
  ): Promise<string> {
    const { aspectRatio = 'portrait', quality = 0.8, ...restOptions } = options;
    const ratio = this.getAspectRatio(aspectRatio, options.customRatio);

    try {
      const image = await ImagePicker.openCropper({
        path,
        cropping: true,
        width: ratio.width,
        height: ratio.height,
        compressImageQuality: quality,
        freeStyleCropEnabled: restOptions.freeStyleCrop || false,
        showCropGuidelines: restOptions.showCropGuidelines !== false,
        hideBottomControls: restOptions.hideBottomControls || false,
        cropperToolbarTitle: restOptions.cropperTitle || 'Crop Photo',
        cropperCircleOverlay: restOptions.circular || false,
        includeBase64: restOptions.includeBase64 || false,
        forceJpg: true,
      } as Parameters<typeof ImagePicker.openCropper>[0]);
      return this.processImage(image);
    } catch (error: any) {
      if (error.code === 'E_CROPPER_IMAGE_NOT_FOUND') {
        throw new Error('Image not found');
      }
      throw error;
    }
  }

  /**
   * Aspect ratio hesaplama
   */
  private getAspectRatio(
    type: AspectRatioType,
    customRatio?: { width: number; height: number }
  ): AspectRatio {
    if (customRatio) {
      return {
        name: 'Custom',
        ratio: customRatio.width / customRatio.height,
        width: customRatio.width,
        height: customRatio.height,
      };
    }

    return ASPECT_RATIOS[type];
  }

  /**
   * İmage processing
   */
  private processImage(image: Image): string {
    // iOS ve Android'de farklı path formatları olabilir
    const uri = image.path || image.sourceURL || '';
    
    if (!uri) {
      throw new Error('No image URI found');
    }

    // iOS'ta bazen file:// prefix'i eksik olabilir
    if (uri && !uri.startsWith('file://') && !uri.startsWith('http')) {
      return `file://${uri}`;
    }

    return uri;
  }

  /**
   * Temizlik - geçici dosyaları sil
   */
  async cleanUp(): Promise<void> {
    try {
      await ImagePicker.clean();
    } catch (error) {
      console.warn('Failed to clean temporary images:', error);
    }
  }
}

// Singleton instance export
export const imageCropService = ImageCropService.getInstance();