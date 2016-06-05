
import { createGlobalId } from "../../util";

export default {
  
  File: {
    id: ({ file_id }: any, _, $, { parentType }) => createGlobalId(file_id, parentType.name),
    file: ({ fileName }) => fileName,
    type: ({ fileType }) => fileType,
    label: ({ fileLabel }) => fileLabel,

    s3: ({ s3 }) => s3,
    cloudfront: ({ cloudfront }) => cloudfront,

    fileName: ({ fileName }) => fileName,
    fileType: ({ fileType }) => fileType,
    fileLabel: ({ fileLabel }) => fileLabel,

  }
  
}