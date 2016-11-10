
import { Heighliner } from "../../../util";

export class EE extends Heighliner {
  __type = "RockSystem";
  id = "entry_id";

  getDate(day, month, year) {
    if (!day || !month || !year) throw new Error("Missing information from `getDate`");
    return `${new Date(Number(year), Number(month) - 1 , Number(day))}`;
  }

  getDateFromUnix(timestamp) {
    return timestamp ? `${new Date(timestamp * 1000)}` : null;
  }

  contentImages(markup) {
    if (!markup) return [];

    let images = markup.match(/src=".*\.(jpg|jpeg|png)"/gmi);
    if (!images) return [];

    return images
      .filter(x => x.slice(5, -1) !== "")
      .map(image => ({ fileLabel: "inline", s3: image.slice(5, -1), url: image.slice(5, -1) }));
  }

  splitByNewLines(tags) {
    if (!tags) return [];

    return tags.replace("\\n", ",").split("\n");
  }

  getSeries(series) {
    if (!series) return false;

    // format: [dddd] [some-thing] Series Title
    // match[1]: series id
    // match[2]: series slug
    // match[3]: series name
    const seriesRegex = /\[(\d*)\] \[(.*)\] (.*)/g;
    return seriesRegex.exec(series);
  }

  cleanMarkup(markup) {
    if (!markup) return false;

    let parsed = markup.match(/src="{assets_\d*.*}"/gmi);
    if (!parsed) return markup;

    // remove {assets_IDSTRING:} and make protocal relative
    markup = markup.replace(/{assets_\d*.*?}/gmi, (link) => {
      link = link.trim().substring(0, link.length - 1);
      link = link.replace(/{assets_\d*:/gmi, "");
      return link;
    });

    // make all links protocal relative
    return markup.replace(/https*:\/\//g, "\/\/");
  }
}
