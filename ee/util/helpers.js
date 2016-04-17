"use strict";

import Path from "path"
import Fs from "fs"
import { reject } from "lodash"
import mySQL from "../mysql"

const Helpers = {

  getDate: (day, month, year) => {

    return new Date(year, Number(month) - 1, day);

  },

  getDateFromUnix: (timestamp) => {

    return new Date(timestamp * 1000);

  },

  cleanMarkup: (markup) => {

    if (!markup) {
      return false;
    }

    let parsed = markup.match(/src="{assets_\d*.*}"/);

    if (!parsed) {
      return markup;
    }

    // remove {assets_IDSTRING:} and make protocal relative
    markup = markup.replace(/{assets_\d*.*}/, function(link) {

      link = link.trim().substring(0, link.length - 1);
      link = link.replace(/{assets_\d*:/, "");
      return link;

    });

    // make all links protocal relative
    return markup.replace(/https*:\/\//g, "\/\/");

  },

  contentImages: (markup) => {
    if (!markup) {
      return [];
    }

    let images = markup.match(/src=".*\.(jpg|jpeg|png)"/);

    if (!images) {
      return [];
    }

    let newImages = [];
    images.map((image) => {
      let newImage = image.slice(5, -1);
      if (newImage !== "") {
        newImage = {
          fileLabel: "inline",
          s3: newImage
        }
        newImages.push(newImage);
      }
    });

    return newImages

  },

  splitByNewlines: (tags) => {
    if (tags) {
      tags = tags.replace("\\n", ",");
      return tags.split("\n");
    }
    else {
      return [];
    }
  },

  getSeries: (series) => {

    if (!series) {
      return false;
    }

    // format: [dddd] [some-thing] Series Title
    // match[1]: series id
    // match[2]: series slug
    // match[3]: series name
    const seriesRegex = /\[(\d*)\] \[(.*)\] (.*)/g;
    const parsed = seriesRegex.exec(series);

    return parsed;

  },

  getMatrixData: (entryId, fields) => {

    if (!entryId || !fields) {
      return [];
    }

    const queryPath = Path.join(__dirname, "./matrix.sql");

    const matrixData = mySQL.sync(queryPath, {
      fields: fields,
      entryId: entryId
    });

    matrixData.rows = matrixData.rows.map(document => {

      // cast instanceOf RowDataPacket to plain object
      let obj = {};
      for (let key in document) {
        if (!document[key]) { continue; }
        obj[key] = document[key]
      }
      if (Object.keys(obj).length) {
        return obj
      }
      return
    }).filter(doc => { return doc != undefined});

    return matrixData.rows;

  },

  getMatrixWithFile: (entryId, fields, fileObj) => {

    if (!entryId || !fields || !fileObj) {
      return []
    }

    let data = Helpers.getMatrixData(entryId, fields);
    data = data.map(document => {

      // lookup s3 link of file
      if (document[fileObj.field]) {
        let file = Helpers.getFile(
          entryId, document[fileObj.field], fileObj.pivot
        );
        document[fileObj.field] = file[0].s3
      }

      return document

    })

    return data;

  },

  getFile: (entryId, name, positionColumn) => {

    let queryPath = Path.join(__dirname, "./images.sql");
    let results = [];

    const imageData = mySQL.sync(queryPath,
      {
        positionColumn: positionColumn,
        entryId: entryId,
        imageName: name
      }
    );

    imageData.rows.map(row => {
      const settings = JSON.parse(row.settings);
      if (settings.subfolder[settings.subfolder.length -1 ] != "/") {
        settings.subfolder = settings.subfolder + "/"
      }
      const s3 = settings.url_prefix + settings.subfolder + row.sub_path +  row.file_name;
      let cloudfront = false;
      if (settings.bucket === "ns.images") {
        cloudfront = "//dg0ddngxdz549.cloudfront.net/" + settings.subfolder + row.sub_path +  row.file_name;
      }
      results.push({
        fileName: row.file_name,
        fileType: row.image_type,
        fileLabel: row.image_label,
        s3: s3,
        cloudfront: cloudfront
      })
    });

    return results;


  },


  getFiles: (entryId, positions, positionColumn) => {

    if (!positions) {
      return [];
    }

    if (positions === "1") {
      positions = "Hero Image"; // why ee?
    }

    let files = positions.replace("\\n", ",");
    files = files.split("\n").filter(file => !!file);

    let results = [];
    for (let file in files) {

      const fileResults = Helpers.getFile(entryId, files[file], positionColumn);

      results = results.concat(fileResults);
    };

    return results;
  },


  getMedia: (entryId) => {

    let queryPath = Path.join(__dirname, "./media.sql");
    let results = [];

    const mediaData = mySQL.sync(queryPath,
      {
        entryId: entryId
      }
    );

    mediaData.rows.map(row => {
      const settings = JSON.parse(row.settings);
      const s3 = settings.url_prefix + settings.subfolder + row.sub_path + row.file_name;
      let cloudfront = false;
      if (settings.bucket === "ns.images") {
        cloudfront = "//dg0ddngxdz549.cloudfront.net/" + settings.subfolder + row.sub_path + row.file_name;
      }
      results.push({
        fileName: row.file_name,
        fileType: row.media_type,
        s3: s3,
        cloudfront: cloudfront
      })
    });

    return results;

  },

  getPlayaRelationships: (entryId) => {
    let queryPath = Path.join(__dirname, "./playa.sql");

    const playaData = mySQL.sync(queryPath,
      {
        entryId: entryId
      }
    );

    return playaData.rows;

  },

  getChannels: (excludeChannels) => {
    const channels = [
      { channelId: 27, displayName: "Devotions" },
      { channelId: 30, displayName: "Articles" },
      { channelId: 4, displayName: "Series" },
      { channelId: 5, displayName: "Stories" },
      { channelId: 47, displayName: "Music" },
      { channelId: 3, displayName: "Sermons" }
    ];
    // only include what user hasn't excluded
    let includeChannels = reject(channels, (channel) => {
      return excludeChannels.indexOf(channel.displayName) > -1
    });
    // if everything is excluded, too bad
    if (includeChannels.length === 0) {
      includeChannels = channels
    }

    includeChannels = includeChannels.map((channel) => {
      return channel.channelId
    });

    return includeChannels.join(",");
  }

};

export default Helpers
