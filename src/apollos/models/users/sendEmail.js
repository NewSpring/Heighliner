import toPascalCase from "to-pascal-case";
import toSnakeCase from "to-snake-case";
import moment from "moment";
import Liquid from "liquid-node";
import _ from "lodash";

import * as api from "./api";
import makeNewGuid from "./makeNewGuid";

// @TODO abstract
const Parser = new Liquid.Engine();

const StandardFilters = { ...Liquid.StandardFilters };
const caseChangedFilter = {};
for (const filter in StandardFilters) {
  // eslint-disable-line
  const newFilter = toPascalCase(filter);

  caseChangedFilter[newFilter] = (i, format) => {
    let input = i;
    input = toSnakeCase(input);

    return StandardFilters[filter](input, format);
  };
}

function toDate(i) {
  let input = i;
  if (input == null) return null;
  if (input instanceof Date) return input;
  if (input === "now" || input === "Now") return new Date();

  if (_.isNumber(input)) {
    input = parseInt(input); // eslint-disable-line
  } else {
    input = toString(input);
    if (input.length === 0) return null;
    input = Date.parse(input);
  }
  if (input != null) return new Date(input);

  return null;
}

Parser.registerFilters({
  ...caseChangedFilter,
  ...{
    Attribute(variable, key) {
      if (variable === "Global") {
        const global = this.context.findVariable("GlobalAttribute");
        return global.then(response => response[key]);
      }
      return null;
    },
    Format(value, format) {
      // hardcode number formating for now
      if (format === "#,##0.00") {
        return `${Number(value).toFixed(2)}`.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ",",
        );
      }
      return null;
    },
    Date(i, f) {
      let input = i;
      let format = f;

      input = toDate(input);

      if (input == null) return "";
      if (toString(format).length === 0) return input.toUTCString();

      format = format.replace(/y/gim, "Y");
      return moment(input).format(format);
      // return Liquid.StandardFilters.date(input, format.toLowerCase())
    },
  },
});

export default async function sendEmail(emailId, PersonAliasId, merge) {
  try {
    let mergeFields = merge;

    const Email = await api.get(`/SystemEmails/${emailId}`);
    if (!Email.Body || !Email.Subject) throw new Error(`No email body or subject found for ${emailId}`);

    /*

      Get global attributes from Rock and map to JSON

      @TODO depreciate for MergeFieldsJson

    */
    const GlobalAttribute = {};
    // NOTE: Calls to AttributeValues are failing silently
    // on https://alpha-rock.newspring.cc/

    // eslint-disable-next-line max-len
    const Globals = await api.get(
      "/AttributeValues?$filter=Attribute/EntityTypeId eq null&$expand=Attribute&$select=Attribute/Key,Value",
    );

    // eslint-disable-next-line max-len
    const Defaults = await api.get(
      "/Attributes?$filter=EntityTypeId eq null&$select=DefaultValue,Key",
    );

    for (const d of Defaults) {
      GlobalAttribute[d.Key] = d.DefaultValue;
    }
    for (const g of Globals) {
      GlobalAttribute[g.Attribute.Key] = g.Value;
    }
    mergeFields = { ...mergeFields, ...{ GlobalAttribute } };

    const [subject, body] = await Promise.all([
      Parser.parseAndRender(Email.Subject, mergeFields),
      Parser.parseAndRender(Email.Body, mergeFields),
    ]);

    const CommunicationId = await api.post("/Communications", {
      CommunicationType: 'email', // Not sure why Holtzman didn't have this
      SenderPersonAliasId: null,
      Status: 3,
      IsBulkCommunication: false,
      Guid: makeNewGuid(),
      Subject: subject,
      Message: body,
    });

    if (typeof PersonAliasId === "number") {
      PersonAliasId = [PersonAliasId]; // eslint-disable-line
    }

    const ids = [];
    for (const id of PersonAliasId) {
      const CommunicationRecipientId = await api.post("/CommunicationRecipients", {
        MediumEntityTypeId: 37, // Mandrill, added this here instead, it seems to be working :D
        PersonAliasId: id,
        CommunicationId,
        Status: 0, // Pending
        Guid: makeNewGuid(),
      });

      ids.push(CommunicationRecipientId);
    }

    await api.post(`/Communications/Send/${CommunicationId}`);

    for (const CommunicationRecipientId of ids) {
      if (CommunicationRecipientId.statusText) {
        throw new Error(CommunicationRecipientId);
      }
    }

    return ids;
  } catch (err) {
    throw err;
  }
}
