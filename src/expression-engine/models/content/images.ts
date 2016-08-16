import { assign } from "lodash";

const resizings = [
  "xlarge",
  "large",
  "medium",
  "small",
  "xsmall",
];
const sourceBucket = "ns.images";
const resizeBucket = "resizings";

const generateFilename = (filename, size) => {
  if (!filename) return null;

  const parts = filename.split(".");
  parts.splice(parts.length - 1, 0, size);
  let result = parts.join(".");
  result = result.replace(sourceBucket, resizeBucket);

  return result;
};

const addResizings = (images) => {
  const result = [];
  images.map((image) => {
    resizings.map((resize) => {
      const resizedImage = assign({}, image) as any;
      resizedImage.s3 = generateFilename(resizedImage.s3, resize);
      resizedImage.cloudfront = generateFilename(resizedImage.cloudfront, resize);
      resizedImage.size = resize;
      result.push(resizedImage);
    });
  });

  return result;
};

export {
  addResizings,
};
