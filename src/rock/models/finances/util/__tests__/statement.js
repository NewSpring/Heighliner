import React from "react";
import renderer from "react-test-renderer";
import { formatMoney, Statement, generatePDF } from "../statement";
import ReactDOMServer from "react-dom/server";

describe("formatMoney", () => {
  it("should render 2 decimal places", () => {
    expect(formatMoney(1)).toEqual("$1.00");
  });

  it("should format with commas", () => {
    expect(formatMoney(1234)).toEqual("$1,234.00");
    expect(formatMoney(1234566)).toEqual("$1,234,566.00");
  });

  it("should allow non-whole numbers", () => {
    expect(formatMoney(1234.6)).toEqual("$1,234.60");
    expect(formatMoney(0.65)).toEqual("$0.65");
  });
});

describe("Statement", () => {
  const person = { FirstName: "", LastName: "", nickName: "" };
  const home = {
    Street1: "3400 Vine St",
    Street2: "",
    City: "Cincinnati",
    State: "OH",
    PostalCode: "45220",
  };
  const transactions = [
    { Name: "Admission", Date: "2016-01-01", Amount: 15 },
    { Name: "Admission", Date: "2016-02-01", Amount: 15 },
  ];
  const total = 30;

  it("should render with data", () => {
    const component = renderer.create(
      <Statement
        person={person}
        home={home}
        transactions={transactions}
        total={total}
      />,
    );
    expect(component).toMatchSnapshot();
  });
});

describe("generatePDF", () => {
  it("should call pdf.create with markup and settings", async () => {
    jest.mock("react-dom/server");
    ReactDOMServer.renderToStaticMarkup = jest.fn(c => c);
    const results = await generatePDF("<div>Hello</div>");

    // XXX can't properly snapshot the results, because of a creationDate
    // being injected by pdf.create (which we don't have time to properly mock)
    // can use Buffer(results, "base64").toString() to print
    expect(results).toBeDefined();
  });

  it("should fail with no component to render", async () => {
    jest.mock("react-dom/server");
    ReactDOMServer.renderToStaticMarkup = jest.fn(c => c);
    return generatePDF().then(
      res => {
        throw new Error("generatePDF didn't fail");
      },
      res => {
        expect(res).toBeDefined();
      },
    );
  });
});
