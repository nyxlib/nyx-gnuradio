/*--------------------------------------------------------------------------------------------------------------------*/

const ADDON_NAME = 'nyx-gnuradio';

/*--------------------------------------------------------------------------------------------------------------------*/

import { VueLoaderPlugin } from 'vue-loader';

/*--------------------------------------------------------------------------------------------------------------------*/

import NyxPlugin from 'nyx-webpack-plugin';

import TerserPlugin from 'terser-webpack-plugin';

/*--------------------------------------------------------------------------------------------------------------------*/

// noinspection JSUnusedGlobalSymbols
export default {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        'plugin': './src/addon.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                'type': 'asset/resource',
                'test': /\.(ttf|png|jpg|wasm)$/,
                'generator': {
                    'filename': 'assets/[hash][ext]'
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new NyxPlugin(ADDON_NAME),
    ],
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                test: /\.js$/,
                parallel: true,
                extractComments: false,
            })
        ]
    },
    performance: {
        hints: false
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
