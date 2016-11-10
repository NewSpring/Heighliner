
const validate = require("webpack-validator");
const nodeExternals = require("webpack-node-externals");
const DotenvPlugin = require("webpack-dotenv-plugin");
const NpmInstallPlugin = require("npm-install-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

module.exports = validate({
	entry: "./src/server.js",
	target: "node",
	output: {
		path: path.resolve(__dirname, "./lib"),
		filename: "server.js"
	},
	recordsPath: path.resolve(__dirname, "lib/_records"),
	plugins: [
		new NpmInstallPlugin(),
		new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
		new DotenvPlugin({ sample: "./.env.example" }),
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
});
