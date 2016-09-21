// Copyright 2004-present Facebook. All Rights Reserved.

var tsc = require("typescript");
var babel = require('babel-core');
var jestPreset = require('babel-preset-jest');

var createTransformer = (options) => {
  options = Object.assign({}, options, {
    auxiliaryCommentBefore: ' istanbul ignore next ',
    presets: ((options && options.presets) || []).concat([jestPreset]),
    retainLines: true,
  });
  delete options.cacheDirectory;

  return {
    canInstrument: true,
    process(src, filename, config, preprocessorOptions) {
      var plugins = options.plugins || [];

      if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
        src = tsc.transpile(
          src, {
            module: tsc.ModuleKind.ES6,
            target: tsc.ScriptTarget.ES6
          }, filename, []
        );

        return babel.transform(src, Object.assign({}, options, { filename, plugins })).code;
      }

      return babel.transform(src, Object.assign({}, options, { filename, plugins })).code;;
    },
  };
};

module.exports = createTransformer();
module.exports.createTransformer = createTransformer;
