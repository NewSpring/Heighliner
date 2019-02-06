import { merge } from "lodash";

import channels from "./../models/content/tables";
import assets from "./../models/files/tables";
import matrix from "./ee/matrix";
import playa from "./ee/playa";
import tags from "./ee/tags";
import sites from "./ee/sites";
import snippets from "./ee/snippets";
import navee from "./../models/navigation/tables";

const tables = {
  assets,
  channels,
  matrix,
  playa,
  sites,
  tags,
  navee,
  snippets
};

export function createTables() {
  let createdTables = {};

  for (const table in tables) {
    createdTables = merge(createdTables, tables[table].connect());
  }

  for (const table in tables) {
    if (tables[table].bind) tables[table].bind(createdTables);
  }

  return createdTables;
}
