
import Helpers from "./../util/helpers"
import Schemas from "./../util/schemas"


export default function(doc) {

  let images = Helpers.getFiles(doc.entry_id, doc.promotion_images, "da.col_id_343");

  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  const markup = Helpers.cleanMarkup(doc.promotion_summary);
  const contentImages = Helpers.contentImages(markup);
  images = images.concat(contentImages);


  let cleanedData = {
    entryId: doc.entry_id,
    siteId: doc.site_id,
    channelName: doc.channel_name,
    title: doc.title,
    status: doc.status,
    meta: {
      urlTitle: doc.url_title,
      siteId: doc.site_id,
      date: date,
      channelId: doc.channel_id
    },
    content: {
      body: markup,
      images: images
    },
    author: {
      authorId: doc.author_id,
      firstName: doc.m_field_id_2 || false,
      lastName: doc.m_field_id_3 || false,
      fullName: doc.m_field_id_4 || false
    }
  }

  return cleanedData;
};
