module.exports = {
  'extends': [
    './eslint/common.js',
    './eslint/node.js',
  ],
  'globals': {
    '__CLIENT__': true,
    '__SERVER__': true,
    '__DEBUG__': true,
  },
  'rules': {
    // Turning this off as it fit with Immutable atm
    'new-cap': 'off',
  },
  'env': {
    'jest': true,
  },
};
