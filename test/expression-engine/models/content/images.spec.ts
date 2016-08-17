import test from "ava";
import { addResizings } from "../../../../src/expression-engine/models/content/images";

const createSampleImage = () => {
  return {
    s3: "s3.jpg",
    cloudfront: "cloudfront.jpg",
    fileLabel: null,
  };
};

test("`addResizings` should return 5 images when handed 1", t => {
  const images = [createSampleImage()];

  const result = addResizings(images);
  t.is(result.length, 5);
});

test("`addResizings` should return 15 images when handed 3", t => {
  const images = [
    createSampleImage(),
    createSampleImage(),
    createSampleImage(),
  ];

  const result = addResizings(images);
  t.is(result.length, 15);
});

test("`addResizings` should generate an xlarge image", t => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { s3, cloudfront, size } = results[0];
  t.true(s3.indexOf("xlarge") > -1);
  t.true(cloudfront.indexOf("xlarge") > -1);
  t.is(size, "xlarge");
});

test("`addResizings` should generate a large image", t => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { s3, cloudfront, size } = results[1];
  t.true(s3.indexOf("large") > -1);
  t.true(cloudfront.indexOf("large") > -1);
  t.is(size, "large");
});

test("`addResizings` should generate a medium image", t => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { s3, cloudfront, size } = results[2];
  t.true(s3.indexOf("medium") > -1);
  t.true(cloudfront.indexOf("medium") > -1);
  t.is(size, "medium");
});

test("`addResizings` should generate a small image", t => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { s3, cloudfront, size } = results[3];
  t.true(s3.indexOf("small") > -1);
  t.true(cloudfront.indexOf("small") > -1);
  t.is(size, "small");
});

test("`addResizings` should generate an xsmall image", t => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { s3, cloudfront, size } = results[4];
  t.true(s3.indexOf("xsmall") > -1);
  t.true(cloudfront.indexOf("xsmall") > -1);
  t.is(size, "xsmall");
});

test("`addResizings` should return 1 image if 1 image and 1 size", t => {
  const images = [createSampleImage()];
  const options = {
    sizes: ["medium"],
    ratios: [],
  };

  const results = addResizings(images, options);
  t.is(results.length, 1);
  t.true(results[0].s3.indexOf("medium") > -1);
  t.true(results[0].cloudfront.indexOf("medium") > -1);
  t.is(results[0].size, "medium");
});

test("`addResizings` should return 4 images if 2 images and 2 sizes", t => {
  const images = [
    createSampleImage(),
    createSampleImage(),
  ];
  const options = {
    sizes: ["medium", "large"],
    ratios: [],
  };

  const results = addResizings(images, options);
  t.is(results.length, 4);
});

test("`addResizings` should return only the ratio specified", t => {
  const images = [
    createSampleImage(),
    createSampleImage(),
  ];
  const options = {
    sizes: null,
    ratios: ["2:1"],
  };
  images[0].fileLabel = "2:1";
  images[1].fileLabel = "1:2";

  const results = addResizings(images, options);
  t.is(results.length, 5);
  results.map((image) => {
    t.is(image.fileLabel, "2:1");
  });
});
