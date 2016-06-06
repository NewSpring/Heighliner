import { merge } from "lodash";

import { Tables } from "../mysql";

import channels from "./channels";
import assets from "./assets";
import matrix from "./matrix";
import playa from "./playa";
import sites from "./sites";
import navee from "./navee";

let tables = {
  assets,
  channels,
  matrix,
  playa,
  sites,
  navee,
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
