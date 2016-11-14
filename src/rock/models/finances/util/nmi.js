
import { Builder, parseString } from "xml2js";
import fetch from "isomorphic-fetch";
import { timeout, TimeoutError } from "promise-timeout";

import ErrorCodes from "./language";

export default (payload, gateway) => {
  if (!gateway) throw new Error("must be called with NMI Gateway object");

  const builder = new Builder();
  const xml = builder.buildObject(payload);

  return timeout(fetch(gateway.APIUrl, {
    method: "POST",
    body: `${xml}`,
    headers: { "Content-Type": "text/xml" },
  })
    .then(response => response.text())
    .then((result) => {
      let data = result;
      // clean all tags to make sure they are parseable
      const matches = data.match(/<([^>]+)>/gmi);
      for (const match of matches) {
        if (match.indexOf(",") > -1) {
          const matchRegex = new RegExp(match, "gmi");
          data = data.replace(matchRegex, match.replace(/,/gmi, ""));
        }
      }

      return data;
    })
    .then(x => new Promise((s, f) => {
      parseString(x, { trim: true, explicitArray: false, mergeAttrs: true }, (err, result) => {
        if (err) f(err);
        if (!err) s(result);
      });
    }))
    .then(({ response }) => {
      const data = response;
      if (data["result-code"] === "100") return data;

      let number = Number(data["result-code"]);

      let err;

      // special mapping to ensure duplicates
      if (data["result-text"] && data["result-text"].indexOf("Duplicate") > -1) {
        number = 430;
      }

      if (ErrorCodes[number] && ErrorCodes[number] !== "result-text") {
        err = ErrorCodes[number];
      } else {
        err = data["result-text"];
      }

      throw new Error(err);
    })
  , 60000)
    .catch((err) => {
      if (err instanceof TimeoutError) {
        throw new Error(`
          The request to our payment process took longer than expected.
          For your safety we have cancelled this action.
          You were not charged and should be able to try again!
        `);
      }

      throw err;
    });
};

