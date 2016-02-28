
import _ from "lodash"

export default function(doc){

  let parents = {

  }

  let orphans = []

  for (let row of doc) {
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
