// fileTransformer.js
const path = require("path");
const fs = require("fs");

module.exports = {
  process(src) {
    return fs.readSync(src, "utf8");
  },
  getCacheKey(fileData, filename) {
    return filename;
  },
};
