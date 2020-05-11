const argv = require('minimist')(process.argv.slice(2));
const autoprefixer = require('autoprefixer');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const SvgStorePlugin = require('external-svg-sprite-loader');
const TerserPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

global.$ = {
    PATH: {
        ROOT: __dirname,
        SRC: path.join(__dirname, 'src'),
        DIST: path.join(__dirname, 'dist'),
    },
    ENV: (process.env.NODE_ENV || 'development').trim(),
};

const cacheLoader = {
    loader: 'cache-loader',
    options: {
        cacheDirectory: path.join($.PATH.ROOT, 'node_modules', '.cache', 'cache-loader'),
    },
};

const postCSSLoader = {
    loader: 'postcss-loader',
    options: {
        plugins: () => [
            autoprefixer(),
        ],
    },
};

const webpackCommonConfig = {
    entry: path.join($.PATH.SRC, 'index.js'),

    output: {
        path: $.PATH.DIST,
        publicPath: '/',
        filename: 'js/bundle.js',
    },

    optimization: {
        noEmitOnErrors: true,
    },

    resolve: {
        alias: {
            '@': $.PATH.SRC,
            // 'modernizr$': path.join($.PATH.ROOT, 'empty'),
        },
        modules: [
            'node_modules',
            'spritesmith-generated',
        ],
    },

    module: {
        rules: [
            // js
            {
                test: /\.js$/,
                include: $.PATH.SRC,
                use: [
                    cacheLoader,
                    'babel-loader',
                    'eslint-loader',
                ],
            },

            // pug
            {
                test: /\.pug$/,
                include: $.PATH.SRC,
                use: [
                    cacheLoader,
                    'babel-loader',
                    {
                        loader: 'pug-loader',
                        options: {
                            pretty: true,
                            self: true,
                        },
                    },
                ],
            },

            // images
            {
                test: /\.(png|jpg|gif|svg)$/,
                exclude: [
                    path.join($.PATH.SRC, 'images', 'sprite-svg'),
                    path.join($.PATH.SRC, 'images', 'sprite-png'),
                    path.join($.PATH.SRC, 'components', 'icons'),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[hash].[ext]',
                        },
                    },
                ],
            },

            // svg-sprite
            {
                test: /\.svg$/,
                include: path.join($.PATH.SRC, 'images', 'sprite-svg'),
                exclude: /node_modules/,
                use: [
                    {
                        loader: SvgStorePlugin.loader,
                        options: {
                            name: 'images/sprite.svg',
                            iconName: 'icon-[name]',
                        },
                    },
                ],
            },

            // fonts
            {
                test: /\.(woff2?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                include: [
                    path.join($.PATH.ROOT, 'node_modules'),
                    path.join($.PATH.SRC, 'fonts'),
                    path.join($.PATH.SRC, 'components', 'icons'),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[hash].[ext]',
                        },
                    },
                ],
            },

            // modernizr
            // {
            //     test: /empty$/,
            //     use: [
            //         {
            //             loader: 'webpack-modernizr-loader',
            //             options: {
            //                 'options': [
            //                     'setClasses',
            //                     'mq',
            //                 ],
            //                 'feature-detects': [
            //                     'touchevents',
            //                 ],
            //             },
            //         },
            //     ],
            // },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            ENV: $.ENV,
            filename: 'index.html',
            minify: false,
            template: path.join($.PATH.SRC, 'index.pug'),
        }),

        // svg sprite
        new SvgStorePlugin({
            emit: true,
        }),

        // png sprite
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve($.PATH.SRC, 'images', 'sprite-png'),
                glob: '**/*.png',
            },
            target: {
                image: path.join($.PATH.SRC, 'spritesmith-generated', 'sprite.png'),
                css: path.join($.PATH.SRC, 'spritesmith-generated', 'sprite.scss'),
            },
            apiOptions: {
                cssImageRef: '~sprite.png',
            },
            spritesmithOptions: {
                algorithm: 'left-right',
            },
        }),

        // css linting
        new StyleLintPlugin({
            configFile: path.join($.PATH.ROOT, '.stylelintrc'),
        }),

        new webpack.ProvidePlugin({
            // $: 'jquery',
            // jQuery: 'jquery',
            Modernizr: 'modernizr',
        }),
    ],
};

const webpackDevConfig = {
    mode: 'development',

    devtool: 'cheap-module-eval-source-map',

    module: {
        rules: [
            {
                test: /\.(sa|sc)ss$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader',
                    postCSSLoader,
                    'sass-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    postCSSLoader,
                ],
            },
        ],
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsPlugin(),
    ],

    devServer: {
        compress: true,
        host: '0.0.0.0',
        hot: true,
        open: true,
        openPage: 'index.html',
        overlay: true,
        port: 8000,
        stats: {
            assets: false,
            builtAt: false,
            cached: false,
            cachedAssets: false,
            children: true,
            chunks: false,
            chunkGroups: false,
            chunkModules: false,
            chunkOrigins: false,
            colors: true,
            entrypoints: false,
            hash: false,
            modules: false,
            performance: false,
            publicPath: false,
            reasons: false,
            timings: true,
            version: false,
        },
        useLocalIp: true,
    },
};

const webpackProdConfig = {
    mode: 'production',

    optimization: {
        minimizer: [
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    rawCache: true,
                    calc: false,
                    colormin: true,
                    convertValues: true,
                    discardComments: {
                        removeAll: true,
                    },
                    discardDuplicates: true,
                    discardEmpty: true,
                    discardOverridden: true,
                    discardUnused: false,
                    mergeIdents: false,
                    mergeLonghand: true,
                    mergeRules: true,
                    minifyFontValues: true,
                    minifyGradients: true,
                    minifyParams: true,
                    minifySelectors: true,
                    normalizeCharset: true,
                    normalizeDisplayValues: true,
                    normalizePositions: true,
                    normalizeRepeatStyle: false,
                    normalizeString: false,
                    normalizeTimingFunctions: false,
                    normalizeUnicode: false,
                    normalizeUrl: true,
                    normalizeWhitespace: true,
                    orderedValues: true,
                    reduceIdents: false,
                    reduceInitial: true,
                    reduceTransforms: true,
                    svgo: true,
                    uniqueSelectors: true,
                    zindex: false,
                },
            }),

            // new TerserPlugin({
            //     cache: true,
            //     terserOptions: {
            //         output: {
            //             comments: false,
            //         },
            //     },
            //     extractComments: false,
            // }),
        ],
        removeEmptyChunks: false,
    },

    module: {
        rules: [
            {
                test: /\.(sa|sc)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    cacheLoader,
                    'css-loader',
                    postCSSLoader,
                    'sass-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    cacheLoader,
                    'css-loader',
                    postCSSLoader,
                ],
            },
        ],
    },

    plugins: [
        // remove dist before build
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [$.PATH.DIST],
        }),

        // css
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            ignoreOrder: true,
        }),
    ],
};

const webpackConfig = merge(webpackCommonConfig, $.ENV === 'development' ? webpackDevConfig : webpackProdConfig);

if (argv['bundle-analyze']) {
    webpackConfig.plugins.push(
        new BundleAnalyzerPlugin({
            analyzerPort: 9333,
            generateStatsFile: true,
        })
    );
}

module.exports = webpackConfig;
