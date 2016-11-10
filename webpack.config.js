const nodeExternals = require("webpack-node-externals");
const DotenvPlugin = require("webpack-dotenv-plugin");
const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

module.exports = {
	entry: [
		// "webpack/hot/signal.js",
		// "webpack-hot-middleware/client?reload=true",
		"./src/server.js"
	],
	target: "node",
	output: {
		path: path.resolve(__dirname, "./lib"),
		filename: "server.js"
	},
	recordsPath: path.resolve(__dirname, "dist/_records"),
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
		// new DashboardPlugin(),
		new DotenvPlugin({ sample: "./.env.example" }),
    // new webpack.HotModuleReplacementPlugin(),
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel",
			}
		]
	},
	externals: [nodeExternals()]
}
