
import Fs  from "fs"
import Path from "path"
import Url from "url"
import MySQL from "mysql"
import Promise from "bluebird"
import Sync from "deasync"

import { load } from "../util/cache"
import Helpers from "./util/helpers"

// local development handling for docker-machine ips being different
let dockerhost = "192.168.99.100"
if (process.env.DOCKER_HOST) {
  const hostObj = Url.parse(process.env.DOCKER_HOST)
  dockerhost = hostObj.host
}

// sql connections
const SQLSettings = {
  host        : process.env.MYSQL_HOST || dockerhost,
  user        : process.env.MYSQL_USER || "root",
  password    : process.env.MYSQL_PASSWORD || "password",
  database    : process.env.MYSQL_DB || "ee_local",
  port        : 3306,
  minInterval : 200,
  connectTimeout: 20000,
  ssl: process.env.MYSQL_SSL || false
};

// connect to db
let started = false;
const connection = MySQL.createConnection(SQLSettings);
connection.connect((err) => {
  if (err) {
    console.log(`MYSQL connection error trying to connect to ${process.env.MYSQL_HOST}`)
    console.log(err);
    // closeAndExit();
  }

  started = true;
});


// shut down connection on ext
function closeAndExit() {

  if (started) {
    connection.end();
  }

  process.exit();
  return
}

// Close connections on hot code push
process.on("SIGTERM", closeAndExit);

// Close connections on exit (ctrl + c)
process.on("SIGINT", closeAndExit);


const getQuery = (file, data) => {
  const variableRegex = /(?:\$\{(?:[\s\S]*?)\})/gmi;

  // ensure arguments are correct
  if (typeof(data) === "function" && !cb) {
    cb = data;
    data = {};
  }

  let query = Fs.readFileSync(
    file,
    { encoding: "utf8" }
  ).toString()

  if (data.entry_id) {
    query += ` WHERE d.entry_id = ${data.entry_id}`
  }

  if (data.channel_id) {
    query += ` WHERE d.channel_id = ${data.channel_id}`
  }

  if (data.sort) {
    if (!data.future) {
      if (query.indexOf("WHERE") === -1) {
        query += " WHERE"
      } else {
        query += " AND"
      }
      query += ` t.entry_date < UNIX_TIMESTAMP(NOW())`
    }
    query += ` ORDER BY t.entry_date DESC`
  }

  if (data.limit) {
    query += ` LIMIT ${data.limit}`
  }

  if (data.offset) {
    query += ` OFFSET ${data.offset}`
  }

  // replace variables in query via data object
  // ${foobar} = value when data = {foobar: value}
  let match = query.match(variableRegex);
  if (match) {
    for (let key of match) {
      let cleanedKey = key.replace("${", "").replace("}", "");

      let val = cleanedKey.split('.').reduce((previous, current) => {

        return previous.hasOwnProperty(current) &&
          previous[current] || previous;


      }, data);
      query = query.replace(key, val);
    }

  }

  return query
}


// export lookup module
const mysql = (file, data, ttl, cache) => {

  let query = getQuery(file, data)


  return load(query, () => new Promise((resolve, reject) => {

    connection.query(query, (err, row, fields) => {

      if (err) { return reject(err) }

      const results = {
        rows: row
      }

      resolve(results)
    });

  }), ttl, cache)


}

mysql.sync = (file, data) => {
  let query = getQuery(file, data)

  // sync call
  let results = null,
      done = false;

  const syncQuery = connection.query(query, (err, row) => {
    results = {
      rows: row
    }

    done = true;
  });

  Sync.loopWhile(function(){return !done;});

  return results
}

const lookupById = (entry_id) => {
  let tableFromId = Path.join(__dirname, "./util/tableFromId.sql")

  return mysql(tableFromId, { entry_id })
    .then((data) => {
      if (!data.rows.length) {
        return {}
      }

      const table = data.rows[0].group_name.toLowerCase().replace(/\s/gmi, "_"),
            tabelsDir = Path.join(__dirname, "./tables"),
            tableDir = Path.join(tabelsDir, `${table}.sql`);


      if (Fs.existsSync(tableDir)) {
        return mysql(tableDir, { entry_id, sort: true })
          .then((data) => {
            let documents = []
            const mappingDir = Path.join(tabelsDir, `${table}.js`),
                  modal = require(mappingDir)

            for (let row of data.rows) {
              documents.push(modal(row))
            }

            // id should only return one response
            return documents[0]
          })
      }

      return false
    })


}

const lookupByChannel = (channel_name, limit, offset) => {
  let tableFromChannel = Path.join(__dirname, "./util/tableFromChannel.sql")

  return mysql(tableFromChannel, { channel_name: `'${channel_name}'` })
    .then((data) => {

      if (!data.rows.length) {
        return {}
      }

      const table = data.rows[0].group_name.toLowerCase().replace(/\s/gmi, "_"),
            tabelsDir = Path.join(__dirname, "./tables"),
            tableDir = Path.join(tabelsDir, `${table}.sql`);

      let { channel_id } = data.rows[0]

      if (Fs.existsSync(tableDir)) {
        return mysql(tableDir, { channel_id, limit, offset, sort: true })
          .then((data) => {
            let documents = []
            const mappingDir = Path.join(tabelsDir, `${table}.js`),
                  modal = require(mappingDir)

            for (let row of data.rows) {
              documents.push(modal(row))
            }

            return documents
          })
      }

      return false
    })


}

const lookupNav = (navTitle, ttl, cache) => {
  let getNav = Path.join(__dirname, "./tables/navee.sql")
  return mysql(getNav, { nav_title: `'${navTitle}'`})
    .then((data) => {

      if (!data.rows.length) {
        return []
      }

      const mappingDir = Path.join(__dirname, `./tables/navee.js`),
            converter = require(mappingDir);

      return converter(data.rows)
    })
}

const lookupSet = (setName, ttl, cache) => {

  let getSet = Path.join(__dirname, "./util/low_reorder_sets.sql")

  return mysql(getSet, { set_name: `'${setName}'`})
    .then((data) => {

      if (!data.rows.length) {
        return []
      }

      let { parameters, sort_order } = data.rows[0]

      parameters = JSON.parse(parameters)
      sort_order = sort_order.split("|").map((x) => (Number(x))).filter((x) => (x != 0))

      let channelLookups = []
      for (let id of sort_order) {
        channelLookups.push(lookupById(id))
      }
      let channelData = Promise.all(channelLookups)

      return channelData
        .then((entries) => {
          let entryObj = {}

          for (let entry of entries) {
            entryObj[entry.entryId] = entry
          }

          let sortedEntries = []
          for (let entry of sort_order) {
            sortedEntries.push(entryObj[entry])
          }

          return sortedEntries
        })


    })

}

const getImagesFromAccount = (AccountId, ttl, cache) => {

  let getAccoundEntryId = Path.join(__dirname, "./util/financial_account_from_id.sql")

  return mysql(getAccoundEntryId, { AccountId })
    .then((data) => {

      if (!data.rows.length) {
        return []
      }
      let doc = data.rows[0]

      return Helpers.getFiles(doc.entry_id, doc.positions, "da.col_id_565");
    })

}

export { lookupById, lookupByChannel, lookupSet, lookupNav, getImagesFromAccount }
export default mysql
