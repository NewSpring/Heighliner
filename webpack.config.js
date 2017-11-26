const nodeExternals = require("webpack-node-externals");
const DotenvPlugin = require("webpack-dotenv-plugin");
const NpmInstallPlugin = require("npm-install-webpack-plugin");
const { getIfUtils, removeEmpty } = require("webpack-config-utils");
const webpack = require("webpack");
const path = require("path");

const { ifProduction, ifNotProduction } = getIfUtils(process.env.NODE_ENV);

module.exports = {
  entry: "./src/server.js",
  target: "node",
  output: {
    path: path.resolve(__dirname, "./lib"),
    filename: "server.js",
  },
  recordsPath: path.resolve(__dirname, "lib/_records"),
  plugins: removeEmpty([
    ifProduction(new webpack.optimize.DedupePlugin()),
    ifProduction(new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
    })),
    ifNotProduction(new NpmInstallPlugin()),
    ifNotProduction(new webpack.HotModuleReplacementPlugin()),
    new webpack.NoEmitOnErrorsPlugin(),
    ifNotProduction(ifNotProduction() && new DotenvPlugin({ sample: "./.env.example" })),
  ]),
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
      },
    ],
  },
  externals: [nodeExternals()],
};
