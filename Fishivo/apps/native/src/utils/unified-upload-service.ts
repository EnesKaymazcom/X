import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import PhotoManipulator from 'react-native-photo-manipulator';
import { ImageCompressionService } from './image-compression';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type UploadType = 'avatar' | 'cover' | 'post' | 'catch' | 'spot' | 'equipment';

export interface UploadOptions {
  type: UploadType;
  entityId?: string; // For posts, catches, spots, equipment
  metadata?: Record<string, any>;
  cropToSquare?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  aspectRatio?: 'square' | 'portrait' | 'landscape'; // Instagram aspect ratios
}

export interface UploadResult {
  success: boolean;
  url?: string;
  urls?: Record<string, string>; // For multiple sizes
  error?: string;
  filePath?: string;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  filePath: string;
  expiresIn: number;
}

interface QueuedUpload {
  id: string;
  type: UploadType;
  uri: string;
  entityId?: string;
  metadata?: Record<string, any>;
  retryCount: number;
  createdAt: number;
}

export class UnifiedUploadService {
  private static instance: UnifiedUploadService;
  private uploadQueue: QueuedUpload[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.loadQueue();
  }

  static getInstance(): UnifiedUploadService {
    if (!UnifiedUploadService.instance) {
      UnifiedUploadService.instance = new UnifiedUploadService();
    }
    return UnifiedUploadService.instance;
  }

  /**
   * Main upload function - Only uses Supabase Edge Function (no Web API dependency)
   */
  async uploadImage(imageUri: string, options: UploadOptions): Promise<UploadResult> {
    try {
      // Use Supabase Edge Function (no Web API dependency)
      // Using Supabase Edge Function
      return await this.uploadViaSupabaseEdgeFunction(imageUri, options);
    } catch (error: any) {
      // Upload failed
      
      // Add to offline queue for retry
      await this.addToQueue(imageUri, options);
      
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }
  }

  /**
   * Upload via Supabase Edge Function (Primary Method - No Web API dependency)
   */
  private async uploadViaSupabaseEdgeFunction(imageUri: string, options: UploadOptions): Promise<UploadResult> {
    const { type, entityId, metadata, cropToSquare = false, aspectRatio } = options;
    
    // Get auth session
    const supabase = getNativeSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No authentication session found');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No user found in session');
    }

    // Process image if needed
    let processedUri = imageUri;
    if (cropToSquare && type === 'avatar') {
      // Cropping image to square - only for avatar
      processedUri = await this.cropToSquare(imageUri);
    }

    // Compress image based on type (single size per type)
    // Compressing image
    let compressed;
    try {
      if (type === 'avatar') {
        // Avatar: 200x200 single size
        compressed = await ImageCompressionService.compressAvatar(processedUri);
      } else if (type === 'cover') {
        // Cover: 1400x400 single size
        compressed = await ImageCompressionService.compressCover(processedUri);
      } else if (type === 'catch' && aspectRatio) {
        // Instagram standardında sıkıştır
        compressed = await ImageCompressionService.compressForInstagram(
          processedUri, 
          aspectRatio
        );
      } else {
        // Other types: standard compression
        compressed = await ImageCompressionService.compressImage(processedUri, {
          maxWidth: options.maxWidth || 1920,
          maxHeight: options.maxHeight || 1080,
          quality: options.quality || 0.85
        });
      }
      // Image compressed successfully
    } catch (compressionError: any) {
      // Image compression failed
      throw new Error(`Image compression failed: ${compressionError.message}`);
    }

    // Create FormData for Edge Function
    const formData = new FormData();
    
    // Add compressed image file
    formData.append('file', {
      uri: compressed.uri,
      type: 'image/jpeg',
      name: `${type}_${Date.now()}.jpg`
    } as any);
    
    // Add metadata
    formData.append('type', type);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    // Uploading to Edge Function
    
    // Get Supabase URL from config
    const supabaseUrl = Config.NEXT_PUBLIC_SUPABASE_URL || Config.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    // Upload to Edge Function (direct R2 upload - no Web API dependency)
    const response = await fetch(`${supabaseUrl}/functions/v1/r2-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge Function upload failed: ${error}`);
    }

    const result = await response.json();
    
    // Upload successful
    return {
      success: true,
      url: result.url,
      filePath: result.filePath
    };
  }
  private async cropToSquare(imageUri: string): Promise<string> {
    try {
      // First get image dimensions
      const Image = require('react-native').Image;
      
      return new Promise((resolve) => {
        Image.getSize(imageUri, (width: number, height: number) => {
          // Calculate square crop from center
          const size = Math.min(width, height);
          const xOffset = (width - size) / 2;
          const yOffset = (height - size) / 2;
          
          // Crop to square from center
          PhotoManipulator.crop(imageUri, {
            x: xOffset,
            y: yOffset,
            width: size,
            height: size
          }).then(croppedUri => {
            resolve(croppedUri);
          }).catch(() => {
            // Crop failed, using original
            resolve(imageUri);
          });
        }, () => {
          // Failed to get size, use original
          resolve(imageUri);
        });
      });
    } catch (error) {
      // Crop failed, using original
      return imageUri;
    }
  }

  /**
   * Add failed upload to queue for retry
   */
  private async addToQueue(uri: string, options: UploadOptions): Promise<void> {
    const queueItem: QueuedUpload = {
      id: `upload_${Date.now()}_${Math.random()}`,
      type: options.type,
      uri,
      entityId: options.entityId,
      metadata: options.metadata,
      retryCount: 0,
      createdAt: Date.now()
    };

    this.uploadQueue.push(queueItem);
    await this.saveQueue();
  }

  /**
   * Process queued uploads (call this when network is available)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.uploadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const maxRetries = 3;

    for (let i = this.uploadQueue.length - 1; i >= 0; i--) {
      const item = this.uploadQueue[i];
      
      try {
        await this.uploadImage(item.uri, {
          type: item.type,
          entityId: item.entityId,
          metadata: item.metadata
        });
        
        // Remove from queue on success
        this.uploadQueue.splice(i, 1);
        await this.saveQueue();
      } catch (error) {
        item.retryCount++;
        
        if (item.retryCount >= maxRetries) {
          // Remove from queue after max retries
          this.uploadQueue.splice(i, 1);
          // Upload failed after max retries
        }
        
        await this.saveQueue();
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Load queue from AsyncStorage
   */
  private async loadQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('upload_queue');
      if (queueData) {
        this.uploadQueue = JSON.parse(queueData);
      }
    } catch (error) {
      // Silently handle queue load errors
    }
  }

  /**
   * Save queue to AsyncStorage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('upload_queue', JSON.stringify(this.uploadQueue));
    } catch (error) {
      // Silently handle queue save errors
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { count: number; items: QueuedUpload[] } {
    return {
      count: this.uploadQueue.length,
      items: [...this.uploadQueue]
    };
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    this.uploadQueue = [];
    await this.saveQueue();
  }
}

// Export singleton instance helper functions
export const uploadService = UnifiedUploadService.getInstance();

export const uploadImage = (imageUri: string, options: UploadOptions) => 
  uploadService.uploadImage(imageUri, options);

export const processUploadQueue = () => 
  uploadService.processQueue();

export const getUploadQueueStatus = () => 
  uploadService.getQueueStatus();