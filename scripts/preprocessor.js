// fileTransformer.js
// const path = require("path");
const fs = require("fs");

module.exports = {
  process(src) {
    console.log(src);
    return src;
  },
};

