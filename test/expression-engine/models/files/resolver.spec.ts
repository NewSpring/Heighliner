
import test from "ava";
import casual from "casual";
import Resolver from "../../../../src/expression-engine/models/files/resolver";

import { createGlobalId } from "../../../../src/util/node/model";

const sampleData = {
  file_id: `${casual.integer(0, 1000)}`,
  file: casual.word,
  label: casual.word,
  s3: casual.word,
  cloudfront: casual.word,
  fileName: casual.word,
  fileType: casual.word,
  fileLabel: casual.word,
};


function macro(t, resolver, expected) {
  const { File } = Resolver;
  t.is(File[resolver](sampleData), sampleData[expected]);
}

test("`File` should return a global id", t => {
  const { File } = Resolver;
  t.is(
    File.id(sampleData, null, null, { parentType: { name: "File" } }),
    createGlobalId(sampleData.file_id, "File")
  );
});

(test as any)("file should resolve from fileName", macro, "file", "fileName");
(test as any)("label should resolve from fileLabel", macro, "label", "fileLabel");
(test as any)("s3 should resolve from s3", macro, "s3", "s3");
(test as any)("cloudfront should resolve from cloudfront", macro, "cloudfront", "cloudfront");
(test as any)("fileName should resolve from fileName", macro, "fileName", "fileName");
(test as any)("fileType should resolve from fileType", macro, "fileType", "fileType");
(test as any)("fileLabel should resolve from fileLabel", macro, "fileType", "fileType");
