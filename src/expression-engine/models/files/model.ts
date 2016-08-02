import { merge } from "lodash";
import { get as httpGet } from "http";
import { existsSync, mkdirSync, createWriteStream, unlink } from "fs";
import mp3Duration from "mp3-duration";

import { Cache, defaultCache } from "../../../util/cache";

import {
  ChannelData,
  // channelDataSchema,
} from "../content/tables";

import {
  Matrix,
  MatrixCol,
} from "../ee/matrix";

import {
  Assets,
  // assetsFilesSchema,
  AssetsSelections,
  // assetsSelectionSchema,
  AssetsFolders,
  // assetsFoldersSchema,
  AssetsSources,
  // assetsSourcesSchema,
} from "../files/tables";

import { EE } from "../ee";

export class File extends EE {
  public cache: Cache;
  public __type: string = "File";

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async getFromId(file_id: string, guid: string): Promise<any> { // replace with FileType

    return await this.cache.get(guid, () => AssetsSelections.findOne({
      where: { file_id: Number(file_id) },
      attributes: ["col_id", "file_id"],
      include: [
        { model: Matrix.model },
        { model: MatrixCol.model, attributes: ["col_name", "col_label"] },
        {
          model: Assets.model,
          attributes: ["file_name"],
          include: [
            { model: AssetsSources.model, attributes: ["settings"] },
            { model: AssetsFolders.model, attributes: ["full_path"] },
          ],
        },
      ],
    })
      .then(x => (merge(
        {
          file_id: x.file_id,
          fileLabel: x.exp_matrix_col && x.exp_matrix_col.col_label,
        },
        this.generateFileName(x.exp_assets_file)
      )))
    );

  }

  // XXX type this
  private generateFileName(fileAssets: any): any {

    const { file_name, exp_assets_source, exp_assets_folder } = fileAssets;
    const { full_path } = exp_assets_folder;


    const settings = JSON.parse(exp_assets_source.settings);
    if (settings.subfolder[settings.subfolder.length - 1 ] !== "/") {
      settings.subfolder = settings.subfolder + "/";
    }
    const s3 = settings.url_prefix + settings.subfolder + full_path + file_name;
    let cloudfront: string | boolean = false;
    if (settings.bucket === "ns.images") {
      cloudfront = "//dg0ddngxdz549.cloudfront.net/" + settings.subfolder + full_path + file_name as string;
    }

    return {
      fileName: file_name,
      s3,
      cloudfront,
    };
  }

  private fuzzyMatchKey(obj: { [key: string]: any }, key: string): any {
    for (let k in obj) {
      if (k.indexOf(key) > -1) {
        return obj[k];
      }
    }
  }

  private getDuration(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileName = file.exp_assets_file.file_name;
      if (fileName.slice(fileName.length - 3) !== "mp3") return null;

      const duration = file.exp_matrix_datum && this.fuzzyMatchKey(file.exp_matrix_datum, "duration");
      if (duration) return resolve(duration);

      // create ./tmp/audio directory
      if (!existsSync("./tmp")) mkdirSync("./tmp");
      if (!existsSync("./tmp/audio")) mkdirSync("./tmp/audio");

      // if no duration, try to calcuate it
      const url = `http:${this.generateFileName(file.exp_assets_file).s3}`;
      const tmpFileName = `./tmp/audio/${file.exp_assets_file.file_name}`;
      const tmpFile = createWriteStream(tmpFileName);
      httpGet(url, (response) => {
        response.pipe(tmpFile);
        tmpFile.on("finish", () => {
          tmpFile.close();
          mp3Duration(tmpFileName, (err, calcDuration) => {
            const seconds = Math.round(calcDuration % 60);
            const minutes = Math.round(calcDuration / 60);
            const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
            unlink(tmpFileName);
            return resolve(`${minutes}:${paddedSeconds}`);
          });
        });
      }).on("error", (error) => {
        console.log(error.message); // tslint:disable-line
        unlink(tmpFileName);
        resolve(null);
      });
    });
  }

  public async getFilesFromContent(
    entry_id: number, name: string = "Hero Image", field_id: number
  ): Promise<any> { // replace with FileType
    if (!entry_id || !field_id) return [];

    // XXX make this more dynamic
    let dynamicIncludes = [
      {
        model: Assets.model,
        attributes: ["file_name"],
        include: [
          { model: AssetsSources.model, attributes: ["settings"] },
          { model: AssetsFolders.model, attributes: ["full_path"] },
        ],
      },
    ] as any[]; // XXX typescript weirdness

    if (name.indexOf(".") === -1) {
      const columns = await this.cache.get(`matrix:${field_id}`, () => MatrixCol.find({
        where: { field_id },
        attributes: ["col_id", "col_name", "col_label"],
      })) as any;

      let columnIds = columns.map(x => [`col_id_${x.col_id}`, x.col_name]);
      // uses matrix
      dynamicIncludes.unshift({ model: Matrix.model, where: { field_id }, attributes: columnIds });
      dynamicIncludes.unshift({ model: MatrixCol.model, attributes: ["col_name", "col_label"] });
    }

    const query = { entry_id, field_id, name };
    return this.cache.get(this.cache.encode(query, "matrix"), () => ChannelData.find({
      where: { entry_id },
      attributes: ["entry_id"],
      include: [
        {
          model: AssetsSelections.model,
          attributes: ["col_id", "file_id"],
          where: { field_id },
          include: dynamicIncludes,
        },
      ],
    })
      .then(data => data.map(x => x.exp_assets_selection))
      .then(data => data.map(x => (merge(
        {
          file_id: x.file_id,
          fileLabel: x.exp_matrix_col && x.exp_matrix_col.col_label,
          title: x.exp_matrix_datum && this.fuzzyMatchKey(x.exp_matrix_datum, "title"),
          duration: this.getDuration(x),
        },
        this.generateFileName(x.exp_assets_file)
      ))))
    );
  }
}

export default {
  File,
};
