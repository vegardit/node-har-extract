'use strict';

// node core modules

// 3rd party modules
const { default: roarr } = require('roarr');

// internal modules

const logger = roarr.child({
  package: '@vegardit/har-extract',
});

module.exports = { logger };
