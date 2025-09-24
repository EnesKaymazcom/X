// Web image service placeholder
// Actual implementation will be added when needed

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
    name: 'Landscape (16:9)', 
    ratio: 1.78, 
    width: 1080, 
    height: 608,
    icon: 'monitor'
  }
}

export class ImageUploadService {
  // Web implementation placeholder
  async pickImage(): Promise<any> {
    throw new Error('Not implemented for web yet')
  }
  
  async pickImageWithCrop(): Promise<string> {
    throw new Error('Not implemented for web yet')
  }
  
  async pickImageFromCameraWithCrop(): Promise<string> {
    throw new Error('Not implemented for web yet')
  }
  
  async compressImage(): Promise<string> {
    throw new Error('Not implemented for web yet')
  }
}

export const imageUploadService = new ImageUploadService()