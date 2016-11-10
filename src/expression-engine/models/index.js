import { merge } from "lodash";

import { Tables } from "../mysql";

import channels from "./../models/content/tables";
import assets from "./../models/files/tables";
import matrix from "./ee/matrix";
import playa from "./ee/playa";
import tags from "./ee/tags";
import sites from "./ee/sites";
import snippets from "./ee/snippets";
import navee from "./../models/navigation/tables";

let tables = {
  assets,
  channels,
  matrix,
  playa,
  sites,
  tags,
  navee,
  snippets,
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
