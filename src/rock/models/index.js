import { merge } from "lodash";

import people from "./people/tables";
import finances from "./finances/tables";
import system from "./system/tables";
import campuses from "./campuses/tables";
import groups from "./groups/tables";
import content from "./content/tables";
import binaryFiles from "./binary-files/tables";

const tables = {
  people,
  finances,
  system,
  campuses,
  groups,
  content,
  binaryFiles,
};

export function createTables() {
  let createdTables = {};

  for (const table in tables) {
    try {
      createdTables = merge(createdTables, tables[table].connect());
    } catch (e) {
      console.error(e);
    }
  }

  for (const table in tables) {
    try {
      if (tables[table].bind) tables[table].bind(createdTables);
    } catch (e) {
      console.error(`in binding ${table}`);
      console.error(e);
    }
  }

  return createdTables;
}
