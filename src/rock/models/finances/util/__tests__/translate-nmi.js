import { defaultsDeep } from "lodash";

import translate, { getCardType } from "../translate-nmi";

import {
  standard,
  recurring,
  check,
  NMIExample,
} from "../__mocks__/sample-response";

jest.mock("moment", () => date => ({
  toISOString: () => `Mocked ISODate: ${date}`,
}));

describe("getCardType", () => {
  it("correctly identifies a visa with hashes", () => {
    expect(getCardType("4111********1111")).toBe(7);
  });

  it("correctly identifies a visa", () => {
    const cards = ["4111111111111111", "4012888888881881", "4222222222222"];
    cards.map(x => expect(getCardType(x)).toBe(7));
  });

  it("correctly identifies a mastercard", () => {
    const cards = ["5555555555554444", "5105105105105100", "5431111111111111"];
    cards.map(x => expect(getCardType(x)).toBe(8));
  });

  it("correctly identifies an American Express", () => {
    const cards = ["378282246310005", "371449635398431", "341111111111111"];
    cards.map(x => expect(getCardType(x)).toBe(159));
  });

  it("correctly identifieds a discover card", () => {
    const cards = ["6011111111111117", "6011000990139424", "6011601160116611"];
    cards.map(x => expect(getCardType(x)).toBe(160));
  });

  it("returns a falsy if no valid card is found", () => {
    expect(getCardType("xxxxx")).toBeFalsy();
  });
});

jest.mock("node-uuid", () => ({
  v4: () => "a31044f3-d721-47b2-a91d-e58ac41832ad",
}));

describe("translate", () => {
  it("correctly formats a standard transaction", () => {
    expect(translate(standard, { Id: 3 })).toMatchSnapshot();
  });

  it("correctly formats the NMI example transaction", () => {
    expect(translate(NMIExample, { Id: 3 })).toMatchSnapshot();
  });

  it("returns null for a pending transaction", () => {
    const example = defaultsDeep({ condition: "pending" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a pendingsettlement transaction", () => {
    const example = defaultsDeep({ condition: "pendingsettlement" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for an in_progress transaction", () => {
    const example = defaultsDeep({ condition: "in_progress" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for an abandoned transaction", () => {
    const example = defaultsDeep({ condition: "abandoned" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a failed transaction", () => {
    const example = defaultsDeep({ condition: "failed" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  xit("returns correctly for a failed transaction", () => {
    const example = defaultsDeep({ condition: "failed" }, standard);
    expect(translate(example, { Id: 3 })).toMatchSnapshot();
  });

  it("returns null for a canceled transaction", () => {
    const example = defaultsDeep({ condition: "canceled" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for an unknown transaction", () => {
    const example = defaultsDeep({ condition: "unknown" }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a refund transaction", () => {
    const example = defaultsDeep(
      { action: { action_type: "refund" } },
      standard
    );
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  xit("correctly formats refunds", () => {
    const example = defaultsDeep(
      { action: { action_type: "refund" } },
      standard
    );
    expect(translate(example, { Id: 3 })).toMatchSnapshot();
  });

  it("returns null for a credit transaction", () => {
    const example = defaultsDeep(
      { action: { action_type: "credit" } },
      standard
    );
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a auth transaction", () => {
    const example = defaultsDeep({ action: { action_type: "auth" } }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a capture transaction", () => {
    const example = defaultsDeep(
      { action: { action_type: "capture" } },
      standard
    );
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a void transaction", () => {
    const example = defaultsDeep({ action: { action_type: "void" } }, standard);
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  it("returns null for a return transaction", () => {
    const example = defaultsDeep(
      { action: { action_type: "return" } },
      standard
    );
    expect(translate(example, { Id: 3 })).toBeFalsy();
  });

  xit("correctly formats a return action", () => {
    const example = defaultsDeep(
      { action: { action_type: "return" } },
      standard
    );
    expect(translate(example, { Id: 3 })).toMatchSnapshot();
  });

  it("allows sale to not be the first action", () => {
    const example = defaultsDeep({}, NMIExample);
    const sale = example.action[0];
    const other = example.action[1];
    const settle = example.action[2];
    example.action = [other, settle, sale];
    expect(translate(example, { Id: 3 })).toMatchSnapshot();
  });

  it("supports multiple funds", () => {
    const example = defaultsDeep(
      {
        product: [
          standard.product,
          {
            sku: "128",
            quantity: "10.0000",
            description: "Step Up",
          },
        ],
      },
      standard
    );
    expect(translate(example, { Id: 3 })).toMatchSnapshot();
  });

  it("supports a recurring transaction", () => {
    expect(translate(recurring, { Id: 3 })).toMatchSnapshot();
  });

  it("supports manually setting a person", () => {
    expect(translate(recurring, { Id: 3 }, 10)).toMatchSnapshot();
  });

  it("supports a check", () => {
    expect(translate(check, { Id: 3 })).toMatchSnapshot();
  });
});
