// Image upload service exports
// Platform-specific exports - import directly based on platform
// React Native: import from '@fishivo/api/services/image/image.native'
// Web: import from '@fishivo/api/services/image/image.web'

// Export common types and constants
export { ASPECT_RATIOS, type AspectRatioType, type AspectRatio, type AspectRatioCheck } from './image.native'

// Export crop service for native
export { imageCropService, type CropOptions } from './image-crop.native'

// Note: R2 direct upload and compression services moved to native app utils
// Import from: apps/native/src/utils/r2-upload.ts
// Import from: apps/native/src/utils/image-compression.ts