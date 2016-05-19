
import _ from "lodash"
import { unserialize } from "php-unserialize"

export default function(doc){

  let parents = {

  }

  let orphans = []

  for (let row of doc) {
    if (row.site_pages) {
      let data = unserialize(new Buffer(row.site_pages, "base64"))
      row.link = data[row.site_id].uris[row.entry_id]
    }

    if (row.parent === 0) {
      parents[row.id] = row
      continue
    }

    if (parents[row.parent]) {
      parents[row.parent].children || (parents[row.parent].children = [])
      parents[row.parent].children.push(row)
      continue
    }

    orphans.push(row)
  }

  if (orphans.length) {
    console.log("@TODO")
  }

  let results = []

  for (let parent in parents) {
    parent = parents[parent]
    parent.children = _.orderBy(parent.children, "sort")
    results.push(parent)
  }

  return _.orderBy(results, "sort");

};
