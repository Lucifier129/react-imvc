const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ManifestPlugin = require('webpack-manifest-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const PnpWebpackPlugin = require('pnp-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const resolve = require('resolve')
const { checkFilename } = require('./compileNodeModules')

module.exports = async function createWebpackConfig(options, isServer = false) {
    let result = {}
    let config = Object.assign({}, options)
    let root = path.join(config.root, config.src)
    let alias = Object.assign({}, config.alias, {
        '@routes': root,
    })
    let indexEntry = isServer ? root : path.join(__dirname, '../entry/client')
    let NODE_ENV = config.NODE_ENV
    let isProd = NODE_ENV === 'production'
    let isDev = NODE_ENV === 'development'
    let mode = NODE_ENV === 'test' ? 'development' : NODE_ENV || 'production'
    let entry = Object.assign({}, config.entry, {
        index: [!!config.hot && !isServer && 'webpack-hot-middleware/client', indexEntry].filter(Boolean),
    })

    let defaultOutput = {
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: !isProd,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: (info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    }

    const staticDir = path.join(config.root, config.publish, config.static)

    if (isServer) {
        result.target = 'node'
        defaultOutput = {
            ...defaultOutput,
            libraryTarget: 'commonjs2',
            path: path.join(config.root, config.publish),
            filename: config.serverBundleName,
            chunkFilename: `js/[name].js`,
        }
    } else {
        defaultOutput = {
            ...defaultOutput,
            path: staticDir,
            filename: `js/[name].js`,
            chunkFilename: `js/[name].js`,
        }
    }

    let output = Object.assign(defaultOutput, config.output)

    let plugins = [
        !isServer &&
            new ManifestPlugin({
                fileName: config.assetsPath,
                generate: (_seed, files, _entries) => {
                    const assets = {}

                    for (const file of files) {
                        if (!file.name) {
                            continue
                        }

                        assets[file.name] = file.path

                        // 生成一个不带后缀的文件名
                        // assets.vendor 可以访问到 vendor.js
                        // assets.index 可以访问到 index.js
                        if (file.name && /\.js$/.test(file.name)) {
                            assets[file.name.slice(0, -3)] = file.path
                        }
                    }

                    return assets
                },
            }),
        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how Webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        !isServer && new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),

        // TypeScript type checking
        config.useTypeCheck &&
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    typescriptPath: resolve.sync('typescript', {
                        basedir: path.join(config.root, 'node_modules'),
                    }),
                    configFile: path.join(config.root, 'tsconfig.json'),
                },
                async: !isProd,
            }),
    ].filter(Boolean)

    // 添加热更新插件（只在开发模式下开启）
    if (isDev && !isServer && config.hot) {
        plugins.push(new webpack.HotModuleReplacementPlugin())
    }

    if (Array.isArray(config.webpackPlugins)) {
        plugins = plugins.concat(config.webpackPlugins)
    }

    let watch = NODE_ENV !== 'test'
    let postLoaders = []
    let optimization = {
        // Automatically split vendor and commons
        // https://twitter.com/wSokra/status/969633336732905474
        // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
        splitChunks: {
            chunks: 'all',
            name: 'vendor',
        },
    }

    if (isProd) {
        watch = false
        if (!isServer) {
            output = Object.assign(
                defaultOutput,
                {
                    filename: 'js/[name]-[contenthash:10].js',
                    chunkFilename: 'js/[name]-[contenthash:10].js',
                    devtoolModuleFilenameTemplate: (info) =>
                        path.relative(root, info.absoluteResourcePath).replace(/\\/g, '/'),
                },
                config.productionOutput,
            )
            optimization = Object.assign(optimization, {
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {
                            parse: {
                                // we want terser to parse ecma 8 code. However, we don't want it
                                // to apply any minfication steps that turns valid ecma 5 code
                                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                                // sections only apply transformations that are ecma 5 safe
                                // https://github.com/facebook/create-react-app/pull/4234
                                ecma: 8,
                            },
                            compress: {
                                ecma: 5,
                                drop_console: true,
                                warnings: false,
                                // Disabled because of an issue with Uglify breaking seemingly valid code:
                                // https://github.com/facebook/create-react-app/issues/2376
                                // Pending further investigation:
                                // https://github.com/mishoo/UglifyJS2/issues/2011
                                comparisons: false,
                                // Disabled because of an issue with Terser breaking valid code:
                                // https://github.com/facebook/create-react-app/issues/5250
                                // Pending futher investigation:
                                // https://github.com/terser-js/terser/issues/120
                                inline: 2,
                            },
                            mangle: {
                                safari10: true,
                            },
                            output: {
                                ecma: 5,
                                comments: false,
                                // Turned on because emoji and regex is not minified properly using default
                                // https://github.com/facebook/create-react-app/issues/2488
                                ascii_only: true,
                            },
                        },
                        // Use multi-process parallel running to improve the build speed
                        // Default number of concurrent runs: os.cpus().length - 1
                        parallel: true,
                        // Enable file caching
                        cache: true,
                        sourceMap: false,
                    }),
                ],
            })
        } else {
            optimization = {
                minimize: false,
            }
        }
    }

    if (!isServer && config.bundleAnalyzer) {
        plugins = plugins.concat([
            new BundleAnalyzerPlugin(
                Object.assign(
                    {
                        // Automatically open analyzer page in default browser
                        openAnalyzer: true,
                        // Analyzer HTTP-server port
                        analyzerPort: 8090,
                    },
                    config.bundleAnalyzer,
                ),
            ),
        ])
    }

    const babelOptions = {
        // include presets|plugins
        babelrc: false,
        configFile: false,
        cacheDirectory: true,
        ...config.babel(isServer, config),
        // Save disk space when time isn't as important
        cacheCompression: isProd,
        compact: isProd,
        sourceType: 'unambiguous',
    }

    result = Object.assign(result, {
        target: isServer ? 'node' : 'web',
        mode: mode,
        // Don't attempt to continue if there are any errors.
        bail: true,
        watch: watch,
        devtool: isServer ? 'source-map' : config.devtool,
        entry: entry,
        output: output,
        module: {
            // makes missing exports an error instead of warning
            strictExportPresence: true,
            rules: [
                // Disable require.ensure as it's not a standard language feature.
                { parser: { requireEnsure: false } },
                // Process application JS with Babel.
                // The preset includes JSX, Flow, TypeScript and some ESnext features.
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    options: babelOptions,
                },
                // 将指定的node_modules目录下的文件也进行babel编译
                config.compileNodeModules?.rules && {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    include: (filename) => {
                        if (!filename.includes('node_modules')) {
                            return false
                        }
                        return checkFilename(filename, config.compileNodeModules?.rules)
                    },
                    loader: 'babel-loader',
                    options: babelOptions,
                },
                config.useFileLoader && {
                    test: /\.(png|jpe?g|gif|css)$/i,
                    loader: 'file-loader',
                    options: {
                        name: isProd ? '[name]-[contenthash:10].[ext]' : '[name].[ext]',
                        emitFile: !isServer,
                        outputPath: (url, resourcePath, context) => {
                            const outputFilename = path.basename(url)
                            const outputPath = resourcePath.replace(context + path.sep, '')
                            const outputDirname = path.dirname(outputPath)

                            return path.join(outputDirname, outputFilename).replaceAll(path.sep, '/')
                        },
                        publicPath: (url, resourcePath, context) => {
                            const outputFilename = path.basename(url)
                            const outputPath = resourcePath.replace(context, '')
                            const outputDirname = path.dirname(outputPath)

                            return path.join(outputDirname, outputFilename).replaceAll(path.sep, '/')
                        },
                    },
                },
            ]
                .filter(Boolean)
                .concat(config.webpackLoaders, postLoaders),
        },
        plugins: plugins,
        optimization,
        performance: {
            hints: false,
            maxEntrypointSize: 400000,
            ...config.performance,
        },
        resolve: {
            modules: ['node_modules'],
            extensions: ['.js', '.jsx', '.json', '.mjs', '.ts', '.tsx'],
            alias: alias,
            plugins: [
                // Adds support for installing with Plug'n'Play, leading to faster installs and adding
                // guards against forgotten dependencies and such.
                PnpWebpackPlugin,
            ],
        },
        context: root,
        resolveLoader: {
            plugins: [
                // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
                // from the current package.
                PnpWebpackPlugin.moduleLoader(module),
            ],
        },
        externals: isServer
            ? nodeExternals({
                  allowlist: config.compileNodeModules?.rules ?? [],
                  modulesFromFile: true,
              })
            : void 0,
    })

    return config.webpack ? config.webpack(result, isServer) : result
}
