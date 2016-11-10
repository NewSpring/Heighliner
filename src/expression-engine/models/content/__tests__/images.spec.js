import { addResizings } from "../images";

const createSampleImage = () => ({
  url: "url.jpg",
  fileLabel: null,
});

it("`addResizings` should return 5 images when handed 1", () => {
  const images = [createSampleImage()];

  const result = addResizings(images);
  expect(result.length).toEqual(5);
});

it("`addResizings` should return 15 images when handed 3", () => {
  const images = [
    createSampleImage(),
    createSampleImage(),
    createSampleImage(),
  ];

  const result = addResizings(images);
  expect(result.length).toEqual(15);
});

it("`addResizings` should generate an xlarge image", () => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { url, size } = results[0];
  expect(url.indexOf("xlarge") > -1).toBeTruthy();
  expect(size).toEqual("xlarge");
});

it("`addResizings` should generate a large image", () => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { url, size } = results[1];
  expect(url.indexOf("large") > -1).toBeTruthy();
  expect(size).toEqual("large");
});

it("`addResizings` should generate a medium image", () => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { url, size } = results[2];
  expect(url.indexOf("medium") > -1).toBeTruthy();
  expect(size).toEqual("medium");
});

it("`addResizings` should generate a small image", () => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { url, size } = results[3];
  expect(url.indexOf("small") > -1).toBeTruthy();
  expect(size).toEqual("small");
});

it("`addResizings` should generate an xsmall image", () => {
  const images = [createSampleImage()];

  const results = addResizings(images);
  const { url, size } = results[4];
  expect(url.indexOf("xsmall") > -1).toBeTruthy();
  expect(size).toEqual("xsmall");
});

it("`addResizings` should return 1 image if 1 image and 1 size", () => {
  const images = [createSampleImage()];
  const options = {
    sizes: ["medium"],
    ratios: [],
  };

  const results = addResizings(images, options);
  expect(results.length).toEqual(1);
  expect(results[0].url.indexOf("medium") > -1).toBeTruthy();
  expect(results[0].size).toEqual("medium");
});

it("`addResizings` should return 4 images if 2 images and 2 sizes", () => {
  const images = [
    createSampleImage(),
    createSampleImage(),
  ];
  const options = {
    sizes: ["medium", "large"],
    ratios: [],
  };

  const results = addResizings(images, options);
  expect(results.length).toEqual(4);
});

it("`addResizings` should return only the ratio specified", () => {
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
  expect(results.length).toEqual(5);
  results.map((image) => {
    expect(image.fileLabel).toEqual("2:1");
  });
});
