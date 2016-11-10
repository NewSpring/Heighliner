
import { createGlobalId } from "../../../util";

export default {

  File: {
    id: ({ file_id }: any, _, $, { parentType }) => createGlobalId(file_id, parentType.name),
    file: ({ fileName }) => fileName || null,
    label: ({ fileLabel }) => fileLabel || null,

    url: ({ url }) => url,

    // deprecated
    s3: ({ s3 }) => s3,
    cloudfront: ({ cloudfront }) => cloudfront || null,

    fileName: ({ fileName }) => fileName || null,
    fileType: ({ fileType }) => fileType || null,
    fileLabel: ({ fileLabel }) => fileLabel || null,

  },

};
