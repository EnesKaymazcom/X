import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fishivo';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://images.fishivo.com';

// S3 client'ı lazy load yapalım
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new Error('Cloudflare R2 configuration is missing. Please check environment variables.');
    }
    
    s3Client = new S3Client({
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

export async function uploadToCloudflare(file: File | Blob | Buffer, key: string): Promise<string> {
  try {

    // Convert to Buffer if needed
    let buffer: Buffer;
    let contentType: string;
    
    if (file instanceof Buffer) {
      buffer = file;
      // Try to detect content type from key extension
      const ext = key.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif',
        'mp4': 'video/mp4',
        'pdf': 'application/pdf'
      };
      contentType = mimeTypes[ext || ''] || 'application/octet-stream';
    } else {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = file instanceof File ? file.type : 'application/octet-stream';
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Add cache control for images (1 hour cache to prevent stale content)
      CacheControl: contentType.startsWith('image/') ? 'public, max-age=3600, s-maxage=3600' : undefined,
    });

    await getS3Client().send(command);
    
    // Return the public URL
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cloudflare R2 upload failed: ${error.message}`);
    } else {
      throw new Error('Failed to upload file to Cloudflare R2');
    }
  }
}

export async function deleteFromCloudflare(url: string): Promise<void> {
  try {
    // Extract key from URL
    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await getS3Client().send(command);
  } catch (error) {
    throw new Error('Failed to delete file');
  }
}

/**
 * Delete all files with a given prefix from Cloudflare R2
 * This is useful for deleting all sizes of an image at once
 */
export async function deleteFromCloudflareByPrefix(prefix: string): Promise<void> {
  try {
    const s3 = getS3Client();
    
    // List all objects with the prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });
    
    const listResult = await s3.send(listCommand);
    
    if (!listResult.Contents || listResult.Contents.length === 0) {
      return; // No files to delete
    }
    
    // Delete all found objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: {
        Objects: listResult.Contents.map(obj => ({ Key: obj.Key })),
      },
    });
    
    await s3.send(deleteCommand);
  } catch (error) {
    console.error('Failed to delete files by prefix:', error);
    // Don't throw, just log - old files not being deleted is not critical
  }
}