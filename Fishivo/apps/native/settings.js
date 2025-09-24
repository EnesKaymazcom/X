const path = require('path');

// Monorepo için node_modules yolunu belirt
process.env.REACT_NATIVE_NODE_MODULES_DIR = path.resolve(__dirname, '../../node_modules');

module.exports = {
  // CLI'nın node_modules'u doğru yerde aramasını sağla
  project: {
    android: {
      sourceDir: './android',
    },
  },
}; 