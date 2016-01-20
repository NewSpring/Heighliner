
import Helpers from "./../util/helpers"
import Schemas from "./../util/schemas"


export default function(doc) {
  let tags = Helpers.splitByNewlines(doc.field_id_1028);

  let images = Helpers.getFiles(doc.entry_id, doc.field_id_664, "da.col_id_218");

  const date = Helpers.getDate(doc.day, doc.month, doc.year);

  let scripture = doc.field_id_654;
  if (scripture === "1") {
    scripture = Helpers.getMatrixData(doc.entry_id, "col_id_216, col_id_217");
    let newScripture = [];
    scripture.map((scripture) => {
      newScripture.push(scripture.col_id_216, scripture.col_id_217);
    });
    scripture = newScripture.join("\n");
  }

  const markup = Helpers.cleanMarkup(doc.field_id_18);
  const contentImages = Helpers.contentImages(markup);
  images = images.concat(contentImages);

  if (doc.channel_name === "devotionals") {
    const defaultImage = {
      fileLabel: "default",
      cloudfront: "//dg0ddngxdz549.cloudfront.net/newspring/editorial/devotionals/hero.devotional.jpg",
      s3: "//s3.amazonaws.com/ns.images/newspring/editorial/devotionals/hero.devotional.jpg"
    };
    images = images.concat(defaultImage);
  }

  const series = Helpers.getSeries(doc.field_id_653);
  const fuseSeries = Helpers.getSeries(doc.field_id_1178);

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
      scripture: scripture,
      tags: tags,
      ooyalaId: doc.field_id_668,
      images: images
    },
    author: {
      authorId: doc.author_id,
      firstName: doc.m_field_id_2 || false,
      lastName: doc.m_field_id_3 || false,
      fullName: doc.m_field_id_4 || false
    },
    series: {
      seriesId: series[1],
      slug: series[2],
      title: series[3]
    },
    fuseSeries: {
      seriesId: fuseSeries[1],
      slug: fuseSeries[2],
      title: fuseSeries[3]
    }
  }

  return cleanedData;
};
