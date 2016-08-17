
import { Heighliner } from "../../../util";

export class EE extends Heighliner {
  public __type: string = "RockSystem";
  public id: string = "entry_id";

  public getDate(day: string, month: string, year: string): string {
    if (!day || !month || !year) throw new Error("Missing information from `getDate`");
    return `${new Date(Number(year), Number(month) - 1 , Number(day))}`;
  }

  public getDateFromUnix(timestamp: number): string | void {
    return timestamp ? `${new Date(timestamp * 1000)}` : null;
  }

  public contentImages(markup: string): any[] {
    if (!markup) return [];

    let images = markup.match(/src=".*\.(jpg|jpeg|png)"/gmi);
    if (!images) return [];

    return images
      .filter(x => x.slice(5, -1) !== "")
      .map(image => ({ fileLabel: "inline", s3: image.slice(5, -1), url: image.slice(5, -1) }));
  }

  public splitByNewLines(tags: string): string[] {
    if (!tags) return [];

    return tags.replace("\\n", ",").split("\n");
  }

  public getSeries(series: string): RegExpExecArray | boolean {
    if (!series) return false;

    // format: [dddd] [some-thing] Series Title
    // match[1]: series id
    // match[2]: series slug
    // match[3]: series name
    const seriesRegex = /\[(\d*)\] \[(.*)\] (.*)/g;
    return seriesRegex.exec(series);
  }

  public cleanMarkup(markup: string): string | boolean {
    if (!markup) return false;

    let parsed = markup.match(/src="{assets_\d*.*}"/gmi);
    if (!parsed) return markup;

    // remove {assets_IDSTRING:} and make protocal relative
    markup = markup.replace(/{assets_\d*.*}/gmi, (link: string): string => {
      link = link.trim().substring(0, link.length - 1);
      link = link.replace(/{assets_\d*:/gmi, "");
      return link;
    });

    // make all links protocal relative
    return markup.replace(/https*:\/\//g, "\/\/");
  }
}
