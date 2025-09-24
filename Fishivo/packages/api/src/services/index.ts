// Service exports
export * from './user';
export * from './posts';
export * from './spots';
export * from './email';
export * from './fishing-techniques';
export * from './contacts';
export * from './qr-code';
export * from './referral';
export * from './comments';
export * from './weather';
export * from './geocoding';
export * from './follow';

// Native API Service Factory is moved to a separate file to avoid importing React Native dependencies in web builds
// To use createNativeApiService, import it directly:
// import { createNativeApiService } from '@fishivo/api/services/native'