import { merge } from "lodash";

import { Tables } from "../mysql";

import channels from "./channels";
import assets from "./assets";
import matrix from "./matrix";

let tables = {
  assets,
  channels,
  matrix,
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
