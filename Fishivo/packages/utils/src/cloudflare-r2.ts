// Cloudflare R2 utility functions
export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  endpoint: string;
}

export const generateR2Url = (key: string, config: R2Config): string => {
  return `${config.publicUrl}/${key}`;
};

export const extractR2Key = (url: string): string => {
  const urlObj = new URL(url);
  return urlObj.pathname.substring(1); // Remove leading slash
};

// Server-side only functions for Next.js
// These require S3 SDK and should only be used in API routes

export async function uploadToCloudflare(file: File | Blob, key: string): Promise<string> {
  // This is a placeholder for the actual implementation
  // In a real implementation, this would use AWS SDK S3 client
  // configured for Cloudflare R2
  throw new Error('uploadToCloudflare must be implemented in the API route with S3 client');
}

export async function deleteFromCloudflare(url: string): Promise<void> {
  // This is a placeholder for the actual implementation
  // In a real implementation, this would use AWS SDK S3 client
  // configured for Cloudflare R2
  throw new Error('deleteFromCloudflare must be implemented in the API route with S3 client');
}