// fileTransformer.js
const fs = require("fs");

module.exports = {
  process(src) {
    return fs.readSync(src, "utf8");
  },
  getCacheKey(filename) {
    return filename;
  },
};
