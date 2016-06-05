import { merge, pick, flatten } from "lodash";

import { Cache, defaultCache } from "../../util/cache";

import {
  ChannelData,
  channelDataSchema,
} from "../tables/channels";

import {
  Matrix,
  MatrixCol,
} from "../tables/matrix";

import {
  Assets,
  assetsFilesSchema,
  AssetsSelections,
  assetsSelectionSchema,
  AssetsFolders,
  assetsFoldersSchema,
  AssetsSources,
  assetsSourcesSchema,
} from "../tables/assets";

import { EE } from "../ee";

export class File extends EE {
  private cache: Cache

  constructor({ cache } = { cache: defaultCache }) {
    super();
    this.cache = cache;
  }

  public async getFromId(file_id: string): Promise<any> { // replace with FileType
    
    return await AssetsSelections.findOne({
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
          // fileType: x.exp_matrix_datum[column_name],
          fileLabel: x.exp_matrix_col.col_label,
        },
        this.generateFileName(x.exp_assets_file)
      )));

    
  }
  
  // XXX type this
  private generateFileName(fileAssets: any): any {
    
    const { file_name, exp_assets_source, exp_assets_folder } = fileAssets;
    const { full_path } = exp_assets_folder;
    
    
    const settings = JSON.parse(exp_assets_source.settings);
    if (settings.subfolder[settings.subfolder.length -1 ] != "/") {
      settings.subfolder = settings.subfolder + "/"
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
    }
  }
  
  public async getFilesFromContent(entry_id: number, name: string = "Hero Image", column_name: string ): Promise<any> { // replace with FileType
    return ChannelData.find({
      where: { entry_id },
      attributes: ["entry_id"],
      include: [
        {
          model: AssetsSelections.model,
          attributes: ["col_id", "file_id"],
          include: [
            { model: Matrix.model, where: { [column_name]: name } },
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
        },
      ],
    })
      .then(data => data.map(x => x.exp_assets_selection))
      .then(data => data.map(x => (merge(
        {
          file_id: x.file_id,
          fileType: x.exp_matrix_datum[column_name],
          fileLabel: x.exp_matrix_col.col_label,
        },
        this.generateFileName(x.exp_assets_file)
      ))));
  }
}

export default {
  File,
};