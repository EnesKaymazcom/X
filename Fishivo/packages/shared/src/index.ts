// Shared package exports

// Theme exports
export { theme, type Theme } from './theme';

// Export all types
export * from './types';

// Export all utilities
export * from './utils';

// Services
export { apiService, setStorageAdapter } from './services/api';
export type { ApiService } from './services/api';
export { databaseService } from './services/databaseService';
export { googleSignInService } from './services/googleSignInService';
export { imageUploadService, ImageUploadService } from './services/imageUploadService';
export type { ImageUploadService as ImageUploadServiceType } from './services/imageUploadService';
export { LocationProvider, useLocation, formatLocationString, getMapboxCoordinates } from './services/LocationService';
export type { LocationData, LocationContextType } from './services/LocationService';
export { unitsApiService } from './services/UnitsApiService';

// Hooks exports
export { useUnits } from './hooks/useUnits';
export { useAuth } from './hooks/useAuth';

// Contexts exports (will be added in next phases)
// export * from './contexts';