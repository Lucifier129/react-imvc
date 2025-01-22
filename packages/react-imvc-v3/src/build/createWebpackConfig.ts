import path from 'path'
import resolve from 'resolve'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
// @ts-ignore
import PnpWebpackPlugin from 'pnp-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import nodeExternals from 'webpack-node-externals'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

import type { EntireConfig } from '..'
import { checkFilename } from './compileNodeModules'
import ImvcStylePlugin from './imvc-style-plugin'

export default async function createWebpackConfig(
  options: EntireConfig,
  isServer: boolean = false
): Promise<webpack.Configuration> {
  let result: webpack.Configuration = {}

  const config: EntireConfig = Object.assign({}, options)
  const root: string = path.join(config.root, config.src)
  const alias = Object.assign({}, config.alias, {
    '@routes': root,
  })
  const indexEntry = isServer ? root : path.join(__dirname, '../entry/client')
  const NODE_ENV = process.env.NODE_ENV
  const isProd = NODE_ENV === 'production'
  const isDev = NODE_ENV === 'development'
  const mode = NODE_ENV === 'test' ? 'development' : NODE_ENV || 'production'
  const entry = Object.assign({}, config.entry, {
    index: [
      !!config.hot && !isServer && 'webpack-hot-middleware/client',
      indexEntry,
    ].filter(Boolean),
  })
  const devtoolModuleFilenameTemplate = (
    info: webpack.DevtoolModuleFilenameTemplateInfo
  ) => path.relative(root, info.absoluteResourcePath).replace(/\\/g, '/')

  let defaultOutput: webpack.Output = {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: !isProd,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate,
    // Link the env to dom
    globalObject: 'this',
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

  const ManifestPluginOption: ManifestPlugin.Options = {
    fileName: config.assetsPath,
    generate: (_seed, files, _entries) => {
      const assets = {} as Record<string, string>

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
  }
  let plugins = [
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
        typescript: resolve.sync('typescript', {
          basedir: path.join(config.root, 'node_modules'),
        }),
        async: !isProd,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        tsconfig: path.join(config.root, 'tsconfig.json'),
        reportFiles: [
          '**',
          '!**/*.json',
          '!**/__tests__/**',
          '!**/?(*.)(spec|test).*',
          '!**/src/setupProxy.*',
          '!**/src/setupTests.*',
        ],
        watch: config.root,
      }),
    config.useSass &&
      new ImvcStylePlugin({
        emitFile: !isServer,
      }),
    !isServer && new ManifestPlugin(ManifestPluginOption),
  ].filter(Boolean)

  // 添加热更新插件
  if (isDev && !isServer && config.hot) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (Array.isArray(config.webpackPlugins)) {
    plugins = plugins.concat(config.webpackPlugins)
  }

  let watch = NODE_ENV !== 'test'
  const postLoaders: webpack.Rule[] = []
  let optimization: webpack.Options.Optimization = {
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
        !isServer && {
          filename: 'js/[name]-[contenthash:10].js',
          chunkFilename: 'js/[name]-[contenthash:10].js',
          devtoolModuleFilenameTemplate,
        },
        config.productionOutput
      )
      Object.assign(optimization, {
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
                // ecma: 5, // 默认为5，但目前ts似乎不支持该参数
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
          config.bundleAnalyzer
        )
      ),
    ])
  }

  const babelOptions: webpack.RuleSetQuery = {
    // include presets|plugins
    babelrc: false,
    configFile: false,
    cacheDirectory: true,
    ...config.babel(config),
    // Save disk space when time isn't as important
    cacheCompression: isProd,
    compact: isProd,
    sourceType: 'unambiguous',
  }
  let moduleRulesConfig: webpack.Rule[] = [
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
  ]

  // 将指定的node_modules目录下的文件也进行babel编译
  if (config.compileNodeModules?.rules) {
    moduleRulesConfig = moduleRulesConfig.concat({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: (filename) => {
        if (!filename.includes('node_modules')) {
          return false
        }
        return checkFilename(filename, config.compileNodeModules?.rules)
      },
      loader: 'babel-loader',
      options: babelOptions,
    })
  }

  const imvcStyleLoaderConfig = {
    loader: require.resolve('./imvc-style-loader'),
    options: {
      name:
        isProd && config.useContentHash
          ? '[name]-[contenthash:10].[ext]'
          : '[name].[ext]',
      emitFile: !isServer,
      outputPath: (url: string, resourcePath: string, context: string) => {
        const isInContext = resourcePath.includes(context)
        const isInNodeModules = resourcePath.includes('node_modules')

        const outputFilename = path.basename(url)
        const outputFilePath = resourcePath.replace(context + path.sep, '')
        let outputDirname = path.dirname(outputFilePath)

        if (isInNodeModules) {
          const [_, newResourcePath] = resourcePath.split(
            'node_modules' + path.sep
          )

          outputDirname = path.dirname(newResourcePath)
        } else if (!isInContext) {
          throw new Error(
            `The position of the file is not in the root directory or node_modules directory`
          )
        }

        const outputPath = path
          .join(outputDirname, outputFilename)
          .replaceAll(path.sep, '/')
          .replace(/\.scss$/, '.css')

        return outputPath
      },
      publicPath: (url: string, resourcePath: string, context: string) => {
        const isInContext = resourcePath.includes(context)
        const isInNodeModules = resourcePath.includes('node_modules')

        const outputFilename = path.basename(url)
        const outputFilePath = resourcePath.replace(context, '')
        let outputDirname = path.dirname(outputFilePath)

        if (isInNodeModules) {
          const [_, newResourcePath] = resourcePath.split('node_modules')

          outputDirname = path.dirname(newResourcePath)
        } else if (!isInContext) {
          throw new Error(
            `The position of the file is not in the root directory or node_modules directory`
          )
        }

        const publicPath = path
          .join(outputDirname, outputFilename)
          .replaceAll(path.sep, '/')
          .replace(/\.scss$/, '.css')

        return publicPath
      },
    },
  }

  if (config.useSass) {
    moduleRulesConfig = moduleRulesConfig.concat({
      test: /\.s[ac]ss$/i,
      use: [
        imvcStyleLoaderConfig,
        {
          loader: require.resolve('sass-loader'),
          options:
            typeof config.useSass !== 'boolean'
              ? config.useSass
              : {
                  implementation: require('sass'),
                },
        },
      ],
    })
  }

  if (config.useFileLoader) {
    moduleRulesConfig = moduleRulesConfig.concat({
      test: /\.css$/i,
      use: [imvcStyleLoaderConfig],
    })

    moduleRulesConfig = moduleRulesConfig.concat({
      test: /\.(png|jpe?g|gif|svg)$/i,
      loader: 'file-loader',
      options: {
        name: isProd ? '[name]-[contenthash:10].[ext]' : '[name].[ext]',
        emitFile: !isServer,
        outputPath: (url: string, resourcePath: string, context: string) => {
          const isInContext = resourcePath.includes(context)
          const isInNodeModules = resourcePath.includes('node_modules')
          const outputFilename = path.basename(url)
          const outputFilePath = resourcePath.replace(context + path.sep, '')
          let outputDirname = path.dirname(outputFilePath)

          if (isInNodeModules) {
            const [_, newResourcePath] = resourcePath.split(
              'node_modules' + path.sep
            )

            outputDirname = path.dirname(newResourcePath)
          } else if (!isInContext) {
            throw new Error(
              `The position of the file is not in the root directory or node_modules directory`
            )
          }

          const outputPath = path
            .join(outputDirname, outputFilename)
            .replaceAll(path.sep, '/')

          return outputPath
        },
        publicPath: (url: string, resourcePath: string, context: string) => {
          const isInContext = resourcePath.includes(context)
          const isInNodeModules = resourcePath.includes('node_modules')
          const outputFilename = path.basename(url)
          const outputPath = resourcePath.replace(context, '')
          let outputDirname = path.dirname(outputPath)

          if (isInNodeModules) {
            const [_, newResourcePath] = resourcePath.split('node_modules')

            outputDirname = path.dirname(newResourcePath)
          } else if (!isInContext) {
            throw new Error(
              `The position of the file is not in the root directory or node_modules directory`
            )
          }

          const publicPath = path
            .join(outputDirname, outputFilename)
            .replaceAll(path.sep, '/')

          return publicPath
        },
      },
    })
  }

  moduleRulesConfig = moduleRulesConfig.concat(
    config.webpackLoaders,
    postLoaders
  )
  const moduleConfig: webpack.Module = {
    // makes missing exports an error instead of warning
    strictExportPresence: true,
    rules: moduleRulesConfig,
  }
  const performanceConfig = {
    hints: false,
    maxEntrypointSize: 400000,
    ...config.performance,
  }
  const resolveConfig: webpack.Resolve = {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json', '.mjs', '.ts', '.tsx'],
    alias: alias,
    plugins: [
      // Adds support for installing with Plug'n'Play, leading to faster installs and adding
      // guards against forgotten dependencies and such.
      PnpWebpackPlugin,
    ],
  }
  const resolveLoaderConfig: webpack.ResolveLoader = {
    plugins: [
      // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
      // from the current package.
      PnpWebpackPlugin.moduleLoader(module),
    ],
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
    module: moduleConfig,
    plugins: plugins,
    optimization,
    performance: performanceConfig,
    resolve: resolveConfig,
    context: root,
    resolveLoader: resolveLoaderConfig,
    externals: isServer
      ? nodeExternals({
          allowlist: config.compileNodeModules?.rules ?? [],
          modulesFromFile: true,
        })
      : void 0,
  })

  if (!!config.webpack) {
    result = config.webpack(result, isServer)
  }

  return result
}
