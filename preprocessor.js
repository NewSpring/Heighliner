// Copyright 2004-present Facebook. All Rights Reserved.

const tsc = require('typescript');

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return tsc.transpile(
        src, {
          "target": "es6",
          "moduleResolution": "node",
          "sourceMap": true,
          "declaration": false,
          "noImplicitAny": false,
          "rootDir": ".",
          "outDir": "lib",
          "allowSyntheticDefaultImports": true,
          "pretty": true,
          "removeComments": true,
          "allowJs": false
        }, path, []
      );
    }
    return src;
  },
};
