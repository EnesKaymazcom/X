// Follow service test
console.log('=== FOLLOW SERVICE TEST ===');

try {
  // Direct import
  const { followService } = require('./packages/api/src/services/follow/follow.native.ts');
  console.log('Direct import:', followService);
  console.log('Methods:', Object.keys(followService || {}));
} catch (error) {
  console.error('Direct import error:', error.message);
}

try {
  // API index import
  const api = require('./packages/api/src/index.ts');
  console.log('API index followService:', api.followService);
  console.log('API all exports:', Object.keys(api).filter(k => k.includes('follow')));
} catch (error) {
  console.error('API index error:', error.message);
}