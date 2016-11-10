import { EE } from "../model";

it("`cleanMarkup` should exist", () => {
  const ee = new EE() as any;
  expect(ee.cleanMarkup).toBeTruthy();
});

it("`cleanMarkup` should be a function", () => {
  const ee = new EE() as any;
  expect(typeof ee.cleanMarkup).toBe("function");
});

it("`cleanMarkup` should return false if no markup", () => {
  const ee = new EE() as any;
  const result = ee.cleanMarkup(null);
  expect(result).toBe(false);
});

it("`cleanMarkup` should return input if nothing to parse", () => {
  const ee = new EE() as any;
  const result = ee.cleanMarkup("test");
  expect(result).toBe("test");
});

it("`cleanMarkup` should remove simple asset tag", () => {
  const ee = new EE() as any;
  const testImage = "//test.com/test.jpg";
  const testAsset = `{assets_40016:${testImage}}`;
  const testMarkup = `<img src="${testAsset}" />`;
  const result = ee.cleanMarkup(testMarkup);
  expect(result).toBe(`<img src="${testImage}" />`);
});

it("`cleanMarkup` should remove https", () => {
  const ee = new EE() as any;
  const testImage = "//test.com/test.jpg";
  const testAsset = `{assets_40016:https:${testImage}}`;
  const testMarkup = `<img src="${testAsset}" />`;
  const result = ee.cleanMarkup(testMarkup);
  expect(result).toBe(`<img src="${testImage}" />`);
});

it("`cleanMarkup` should remove multiple asset tags", () => {
  const ee = new EE() as any;
  const testImage1 = "//test.com/test.jpg";
  const testImage2 = "//test.com/test2.jpg";
  const testAsset1 = `{assets_40016:https:${testImage1}}`;
  const testAsset2 = `{assets_40017:https:${testImage2}}`;
  const testMarkup = `
    <h3>
      <img src="${testAsset1}" />
      <img src="${testAsset2}" />
    </h3>
  `;
  const result = ee.cleanMarkup(testMarkup);
  expect(result).toBe(`
    <h3>
      <img src="${testImage1}" />
      <img src="${testImage2}" />
    </h3>
  `);
});

it("`cleanMarkup` should remove multiple asset tags on the same line", () => {
  const ee = new EE() as any;
  const testImage1 = "//test.com/test.jpg";
  const testImage2 = "//test.com/test2.jpg";
  const testAsset1 = `{assets_40016:https:${testImage1}}`;
  const testAsset2 = `{assets_40017:https:${testImage2}}`;
  const testMarkup = `
    <h3><img src="${testAsset1}" /><img src="${testAsset2}" /></h3>
  `;
  const result = ee.cleanMarkup(testMarkup);
  expect(result).toBe(`
    <h3><img src="${testImage1}" /><img src="${testImage2}" /></h3>
  `);
});
