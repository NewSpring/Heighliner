
import Helpers from "./../util/helpers"
import Schemas from "./../util/schemas"

export default function(doc){
  const date = Helpers.getDate(doc.day, doc.month, doc.year);
  const entryDate = Helpers.getDateFromUnix(doc.entry_date);
  const actualDate = Helpers.getDateFromUnix(doc.actual_date);

  const speakers = Helpers.splitByNewlines(doc.speakers);
  const tags = Helpers.splitByNewlines(doc.tags);

  const description = Helpers.cleanMarkup(doc.description);

  const scripture = doc.scripture === "1" ? false : doc.scripture;

  const images = Helpers.getFiles(doc.entry_id, doc.positions, "da.col_id_232");

  let collectionId,
      relatedSermonId;

  const playa = Helpers.getPlayaRelationships(doc.entry_id);
  playa.map(row => {
    if (row.parent_field_id === 17 ||    // sermon to series
        row.parent_field_id === 679 ||   // group study entry to group study
        row.parent_field_id === 682) {   // study entry to study
      collectionId = row.child_entry_id;
    }
    else if (row.parent_field_id === 681) {
      relatedSermonId = row.child_entry_id;
    }
  });

  let media = [];
  if (doc.video_low_bitrate ||
      doc.video_medium_bitrate ||
      doc.video_high_bitrate ||
      doc.audio ||
      doc.downloads) {
    media = Helpers.getMedia(doc.entry_id);
  }

  let week = null;
  // only include week if sermon
  // b/c stories returns "Trailer"?
  if (doc.channel_id === "3") {
    week = doc.week;
  }

  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    status: doc.status,
    title: doc.title,
    subtitle: doc.subtitle,
    collectionId: collectionId,
    relatedSermonId: relatedSermonId,
    meta: {
      urlTitle: doc.url_title,
      date: date,
      channelId: doc.channel_id,
      entryDate: entryDate,
      actualDate: actualDate
    },
    content: {
      body: doc.body,
      scripture: scripture,
      week: week,
      speakers: speakers,
      tags: tags,
      description: description,
      ooyalaId: doc.ooyala_id,
      images: images
    },
    media: media
  };

  return cleanedData;
};
