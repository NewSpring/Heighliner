
import Helpers from "./../util/helpers"

export default function(doc) {
  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  let images = [];
  switch(doc.channel_name) {
    // collection
    case "series_newspring":
      const collectionImages = Helpers.getFiles(doc.entry_id, doc.collection_positions, "da.col_id_269");
      images = images.concat(collectionImages);
      break;

    // collection entry
    case "sermons":
    case "stories":
      const colEntryImages = Helpers.getFiles(doc.entry_id, doc.collection_entry_positions, "da.col_id_232");
      images = images.concat(colEntryImages);
      break;

    // editorial
    case "devotionals":
    case "articles":
      const editorialImages = Helpers.getFiles(doc.entry_id, doc.editorial_positions, "da.col_id_218");
      const markup = Helpers.cleanMarkup(doc.markup);
      const contentImages = Helpers.contentImages(markup);
      images = images.concat(editorialImages, contentImages);
      break;

    // albums
    case "albums":
      const albumImage = Helpers.getFile(doc.entry_id, doc.album_image, "f.file_name");
      images = images.concat(albumImage);
      break;

  }

  let collectionId;
  if (doc.channel_name === "sermons") {
    const playa = Helpers.getPlayaRelationships(doc.entry_id);
    playa.map(row => {
      if (row.parent_field_id === 17) {
        // sermon to series
        collectionId = row.child_entry_id;
      }
    });
  }

  // set us up for multiple colors in the future
  let colors = [];
  if (doc.primary_accent_color !== "") {
    colors.push(
      { id: 1, value: doc.primary_accent_color, description: "primary" }
    );
  }

  const cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    status: doc.status,
    title: doc.title,
    collectionId: collectionId,
    meta: {
      date: date,
      channelId: doc.channel_id,
    },
    content: {
      images: images,
      colors: colors,
    },
  };

  return cleanedData;
}
