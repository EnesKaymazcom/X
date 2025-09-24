import ImageResizer from 'react-native-image-resizer'

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'JPEG' | 'PNG' | 'WEBP'
  outputPath?: string
}

export interface CompressedImageResult {
  uri: string
  width: number
  height: number
  size: number
  originalSize: number
  compressionRatio: number
}

export class ImageCompressionService {
  /**
   * Default compression ayarları (optimal)
   */
  private static readonly DEFAULT_PRESET: CompressionOptions = {
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
    format: 'JPEG' // WEBP desteklenmiyor, JPEG kullan
  }

  /**
   * Resim sıkıştır (default)
   */
  static async compressImage(
    imageUri: string,
    options: CompressionOptions = this.DEFAULT_PRESET
  ): Promise<CompressedImageResult> {
    try {
      // Orijinal dosya boyutunu al
      const originalSize = await this.getFileSize(imageUri)

      const response = await ImageResizer.createResizedImage(
        imageUri,
        options.maxWidth || 2000,
        options.maxHeight || 2000,
        options.format || 'JPEG',
        options.quality || 85,
        0, // rotation
        options.outputPath, // output path
        false, // keep meta
        {
          mode: 'contain',
          onlyScaleDown: true // Küçük resimleri büyütme
        }
      )

      const compressedSize = response.size

      return {
        uri: response.uri,
        width: response.width,
        height: response.height,
        size: compressedSize,
        originalSize,
        compressionRatio: Math.round(((originalSize - compressedSize) / originalSize) * 100)
      }
    } catch (error) {
      throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Standard sıkıştırma (default preset kullanır)
   */
  static async compress(imageUri: string): Promise<CompressedImageResult> {
    return this.compressImage(imageUri)
  }

  /**
   * Avatar için optimize sıkıştırma (512x512 tek boyut)
   */
  static async compressAvatar(imageUri: string): Promise<CompressedImageResult> {
    return this.compressImage(imageUri, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 90,
      format: 'JPEG' // WEBP desteklenmiyor, JPEG kullan
    })
  }

  /**
   * Cover için sıkıştırma (1400x400 tek boyut)
   */
  static async compressCover(imageUri: string): Promise<CompressedImageResult> {
    return this.compressImage(imageUri, {
      maxWidth: 1400,
      maxHeight: 400,
      quality: 85,
      format: 'JPEG' // WEBP desteklenmiyor, JPEG kullan
    })
  }

  /**
   * Instagram standardında catch görseli sıkıştırma
   * Aspect ratio'ya göre optimize edilmiş boyutlar
   */
  static async compressForInstagram(
    imageUri: string, 
    aspectRatio: 'square' | 'portrait' | 'landscape'
  ): Promise<CompressedImageResult> {
    const settings = {
      square: { width: 1080, height: 1080 },      // 1:1
      portrait: { width: 1080, height: 1350 },    // 4:5 
      landscape: { width: 1080, height: 810 }     // 4:3
    };
    
    const { width, height } = settings[aspectRatio];
    
    return this.compressImage(imageUri, {
      maxWidth: width,
      maxHeight: height,
      quality: 90,  // Instagram standardı %90
      format: 'JPEG'
    });
  }

  /**
   * Dosya boyutunu kontrol et
   */
  static async shouldCompress(
    imageUri: string,
    maxSizeBytes: number = 5 * 1024 * 1024 // 5MB
  ): Promise<boolean> {
    try {
      const size = await this.getFileSize(imageUri)
      return size > maxSizeBytes
    } catch {
      return true // Hata durumunda sıkıştır
    }
  }

  /**
   * Akıllı sıkıştırma - dosya boyutuna göre ayarlar
   */
  static async smartCompress(imageUri: string): Promise<CompressedImageResult> {
    try {
      const originalSize = await this.getFileSize(imageUri)
      
      // Çok büyük dosyalar için daha agresif sıkıştırma
      if (originalSize > 20 * 1024 * 1024) {
        return this.compressImage(imageUri, {
          maxWidth: 1600,
          maxHeight: 1600, 
          quality: 75,
          format: 'JPEG' // WEBP desteklenmiyor, JPEG kullan
        })
      } else {
        // Normal sıkıştırma
        return this.compressImage(imageUri)
      }
    } catch (error) {
      // Hata durumunda default compression
      return this.compressImage(imageUri)
    }
  }

  /**
   * Dosya boyutunu byte olarak döner
   */
  private static async getFileSize(uri: string): Promise<number> {
    try {
      const RNFS = require('react-native-fs')
      const stat = await RNFS.stat(uri)
      return stat.size
    } catch {
      return 0
    }
  }

  /**
   * Formatları desteklenen formata çevir
   */
  static getSupportedFormat(originalFormat: string): 'JPEG' | 'PNG' | 'WEBP' {
    const format = originalFormat.toLowerCase()
    if (format.includes('webp')) return 'WEBP'
    if (format.includes('png')) return 'PNG'
    return 'JPEG' // Default
  }

  /**
   * Compression stats'leri string olarak döner
   */
  static getCompressionStats(result: CompressedImageResult): string {
    const { originalSize, size, compressionRatio } = result
    const originalMB = (originalSize / (1024 * 1024)).toFixed(1)
    const compressedMB = (size / (1024 * 1024)).toFixed(1)
    
    return `${originalMB}MB → ${compressedMB}MB (${compressionRatio}% reduction)`
  }
}

// Export singleton instance
export const imageCompression = ImageCompressionService