import { merge } from "lodash";

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
          duration: x.exp_matrix_datum && this.fuzzyMatchKey(x.exp_matrix_datum, "duration"),
        },
        this.generateFileName(x.exp_assets_file)
      ))))
    );
  }
}

export default {
  File,
};
