import { merge } from "lodash";

import { Tables } from "../mssql";

import people from "./people/tables";
import finances from "./finances/tables";
import rock from "./rock/tables";
import campuses from "./campuses/tables";

let tables = {
  people,
  finances,
  rock,
  campuses,
} as {
  [key: string]: {
    connect: () => Tables;
    bind?: (Tables) => void;
  }
};

export function createTables() {
   let createdTables = {};

  for (let table in tables) {
    try {
      createdTables = merge(createdTables, tables[table].connect());
    } catch (e) {
      console.error(e);
    }

  }

  for (let table in tables) {
    try {
      if (tables[table].bind) tables[table].bind(createdTables);
    } catch (e) {
      console.error(e);
    }

  }

  return createdTables as Tables;
}
