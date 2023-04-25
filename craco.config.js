// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const path = require('path');
// import path from 'path';
const path = require('path')
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// import webpack from 'webpack'

const CopyWebpackPlugin = require('copy-webpack-plugin');

// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
    babel: {
        plugins: ['react-refresh/babel'],
    },
    webpack: {
        alias: {
            "@": path.join(__dirname, "src")
        },
        configure: {
            // devtool: 'inline-source-map',
            // module: {
            //
            //     // rules: [
            //     //     {
            //     //         test: /\.(js|jsx|ts|tsx)$/,
            //     //         exclude: /node_modules/,
            //     //         use: [
            //     //             {
            //     //                 loader: "babel-loader"
            //     //             },
            //     //             {
            //     //                 loader: "ts-loader",
            //     //                 options: {
            //     //                     compilerOptions: {
            //     //                         noEmit: false
            //     //                     }
            //     //                 }
            //     //             }
            //     //         ]
            //     //     },
            //     // ],
            // },
            resolve: {
                fallback: {
                    "url": require.resolve("url/"),
                    "zlib": require.resolve("browserify-zlib"),
                    "https": require.resolve("https-browserify"),
                    "http": require.resolve('stream-http'),
                    "buffer": require.resolve("buffer/"),
                    "assert": require.resolve("assert/"),
                    "util": require.resolve("util/"),
                    "stream": require.resolve("stream-browserify")
                }
            },
            ignoreWarnings: [
                function ignoreSourcemapsloaderWarnings(warning) {
                    return (
                        warning.module &&
                        warning.module.resource.includes('node_modules') &&
                        warning.details &&
                        warning.details.includes('source-map-loader')
                    )
                },
            ],
        },
        // configure:  (webpackConfig, { env, paths }) => { return webpackConfig; },

        // fallback: {
        //     "url": false,
        //     "zlib": false,
        //     "https": false,
        //     "http": false,
        // },
        plugins: {
            add: [
                new ReactRefreshWebpackPlugin(),
                new CopyWebpackPlugin({
                    patterns: [
                        {from: path.join(cesiumSource, cesiumWorkers), to: 'Workers'},
                        {from: path.join(cesiumSource, 'Assets'), to: 'Assets'},
                        {from: path.join(cesiumSource, 'Widgets'), to: 'Widgets'}
                    ]
                }),
                new webpack.DefinePlugin({
                    // Define relative base path in cesium for loading assets
                    CESIUM_BASE_URL: JSON.stringify('/')
                })
            ],
        },
    },
}