import Helpers from "./../util/helpers"
import Schemas from "./../util/schemas"

export default function(doc){

  let tracks = [
    "col_id_246 as title",
    "col_id_247 as duration",
    "col_id_248 as file"
  ].join(",\n");

  let downloads = [
    "col_id_209 as title",
    "col_id_210 as file"
  ].join(",\n");

  let links = [
    "col_id_245 as link",
    "col_id_417 as cta"
  ].join(",\n");

  let image = Helpers.getFile(doc.entry_id, doc.album_image, "f.file_name");
  // image = image[0];
  // if (image.cloudfront !== false) {
  //   image = image.cloudfront;
  // } else {
  //   image = image.s3;
  // }
  // if (image.slice(0,4) === "http") {
  //   image = image.slice(image.indexOf("//"));
  // }

  let blurredImage = Helpers.getFile(doc.entry_id, doc.album_blurred_image, "f.file_name");
  // blurredImage = blurredImage[0];
  // if (blurredImage.cloudfront !== false) {
  //   blurredImage = blurredImage.cloudfront;
  // } else {
  //   blurredImage = blurredImage.s3;
  // }
  // if (blurredImage.slice(0,4) === "http") {
  //   blurredImage = blurredImage.slice(blurredImage.indexOf("//"));
  // }

  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  // track files and data from matrix
  tracks = Helpers.getMatrixWithFile(doc.entry_id, tracks, {
    pivot: "f.file_name",
    field: "file"
  });

  // download files and titles from matrix
  downloads = Helpers.getMatrixWithFile(doc.entry_id, downloads, {
    pivot: "f.file_name",
    field: "file"
  });

  // links ctas and urls
  links = Helpers.getMatrixData(doc.entry_id, links);


  let images = [].concat(image, blurredImage)

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    title: doc.title,
    status: doc.status,
    content: {
      images: images
    },
    // image: image,
    // blurredImage: blurredImage,
    meta: {
      date: date,
      channelId: doc.channel_id
    },
    tracks: tracks,
    downloads: downloads,
    links: links
  }

  return cleanedData;

};
