
import { connect as channels } from "./channels";

let tables = {
  channels,
}

export function createTables() {
  for (let table in tables) {
    tables[table] = tables[table]();
  }

  return tables;
}
