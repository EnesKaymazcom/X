// Dummy module to replace blocked imports (NodeStorage, SecureTokenStorage, etc.)
// Provides basic mocks for React Native compatibility

// Mock SecureTokenStorage for React Native
class MockSecureTokenStorage {
  constructor(options = {}) {
    this.options = options;
  }
  
  async storeToken(userId, tokenData) {
    console.warn('MockSecureTokenStorage: storeToken called - implement real token storage');
    return Promise.resolve();
  }
  
  async getToken(userId) {
    console.warn('MockSecureTokenStorage: getToken called - implement real token storage');
    return Promise.resolve(null);
  }
  
  async removeToken(userId) {
    console.warn('MockSecureTokenStorage: removeToken called');
    return Promise.resolve();
  }
  
  async hasValidToken(userId) {
    console.warn('MockSecureTokenStorage: hasValidToken called');
    return Promise.resolve(false);
  }
}

const mockSecureTokenStorage = new MockSecureTokenStorage();

module.exports = {
  // SecureTokenStorage exports
  SecureTokenStorage: MockSecureTokenStorage,
  getSecureTokenStorage: () => mockSecureTokenStorage,
  setSecureTokenStorage: (storage) => { /* no-op */ },
  
  // NodeStorage exports
  default: {},
  
  // React Native Reanimated web mocks
  startWebLayoutAnimation: () => {},
  tryActivateLayoutTransition: () => {},
  CustomConfig: {},
  addHTMLMutationObserver: () => {},
  
  // Fallback for any other exports
  __esModule: true,
};
