// User service exports
export * from './user.web';
export * from './user.native';

// Re-export for easier import
import { userServiceWeb } from './user.web';
import { userServiceNative } from './user.native';
export { userServiceWeb, userServiceNative };