import { merge } from "lodash";

import { Tables } from "../mssql";

import person from "./person";


let tables = {
  person,
} as {
  [key: string]: {
    connect: () => Tables;
    bind?: (Tables) => void;
  }
};

export function createTables() {
   let createdTables = {};
   
  for (let table in tables) {
    createdTables = merge(createdTables, tables[table].connect());
  }
  
  for (let table in tables) {
    if (tables[table].bind) tables[table].bind(createdTables);
  }

  return createdTables as Tables;
}
