/**
 * Helper function to convert R2 URLs to custom domain URLs
 */
export function getProxiedImageUrl(r2Url: string | null | undefined): string {
  if (!r2Url) return ''
  
  // If it's already using the custom domain, return as is
  if (r2Url.includes('images.fishivo.com')) {
    return r2Url
  }
  
  // If it's a full R2 URL, convert to custom domain
  if (r2Url.includes('.r2.dev/')) {
    const path = r2Url.split('.r2.dev/')[1]
    return `https://images.fishivo.com/${path}`
  }
  
  // If it's already a relative path, assume it's correct
  if (r2Url.startsWith('/')) {
    return r2Url
  }
  
  // Otherwise return the original URL
  return r2Url
}

/**
 * Check if a URL is an R2 URL
 */
export function isR2Url(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('.r2.dev/')
}

/**
 * Get protected image URL with dynamic watermark support
 */
export function getProtectedImageUrl(
  r2Url: string | null | undefined,
  options?: {
    watermark?: boolean
    quality?: number
    format?: 'auto' | 'webp' | 'jpeg' | 'png'
  }
): string {
  const baseUrl = getProxiedImageUrl(r2Url)
  
  if (!baseUrl) return ''
  
  // Add protection parameters for Cloudflare Images transform
  const params = new URLSearchParams()
  
  if (options?.watermark) {
    params.set('watermark', 'true')
  }
  
  if (options?.quality) {
    params.set('quality', options.quality.toString())
  }
  
  if (options?.format && options.format !== 'auto') {
    params.set('format', options.format)
  }
  
  const paramString = params.toString()
  return paramString ? `${baseUrl}?${paramString}` : baseUrl
}