var webpack = require('webpack')
var path = require('path')
var BundleAnalyzerPlugin = require(
  'webpack-bundle-analyzer'
).BundleAnalyzerPlugin
var StatsPlugin = require('./webpack.stats.plugin')
var OptimizeJsPlugin = require('optimize-js-plugin')

var cwd = process.cwd()
var customConfig = require(path.join(cwd, 'build.config'))
var alias = Object.assign({
  moment: path.join(__dirname, '../share/moment'),
  rome: path.join(__dirname, '../share/rome'),
}, customConfig.alias)

var outputPath = path.join(cwd, 'publish/dest')
var entry = {
  index: path.join(__dirname, '../entry/client'),
  vendor: [
    'babel-polyfill',
    'react',
    'react-dom',
    'relite',
    'create-app',
    'classnames',
    'querystring',
    'fetch-ie8',
    'js-cookie',
    path.join(__dirname, '../polyfill'),
    'moment',
    'react-imvc/component',
    'react-imvc/controller',
    'react-imvc/util'
  ]
}

if (customConfig.index) {
  entry.index = [].concat(customConfig.index, entry.index)
}

if (customConfig.vendor) {
  entry.vendor = entry.vendor.concat(customConfig.vendor)
}

var output = {
  path: outputPath,
  filename: `[name].js`,
  chunkFilename: '[name].js'
}

var plugins = [
  new StatsPlugin('../stats.json'),
  // new webpack.optimize.OccurrenceOrderPlugin(false),
  // extract vendor chunks for better caching
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: Infinity
  }),
  // new webpack.optimize.CommonsChunkPlugin({
  //   children: true,
  //   minChunks: 3
  // }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    )
  })
]
var watch = true
var devtool = '#source-map'
var postLoaders = []

if (process.env.CODE_SPLIT !== '0') {
  postLoaders.push({
    test: /controller\.jsx?$/,
    loader: 'bundle-loader',
    query: {
      lazy: true,
      name: 'app-[1]/js/[folder]',
      regExp: /[\/\\]app-([^\/\\]+)[\/\\]/.source
    },
    exclude: /node_modules/
  })
}

if (process.env.NODE_ENV === 'production') {
  devtool = ''
  output = {
    path: outputPath,
    filename: '[name]-[hash:6].js',
    chunkFilename: '[name]-[chunkhash:6].js'
  }
  plugins = plugins.concat([
    // banner
    // new webpack.BannerPlugin(banner),
    new webpack.optimize.DedupePlugin(),
    // minify JS
    new webpack.optimize.UglifyJsPlugin({
      // beautify: true,
      compress: {
        unused: true,
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
        properties: false,
        warnings: false,
        screw_ie8: false,
      },
      mangle: false,
      mangle: {
        screw_ie8: false
      },
      output: {
        screw_ie8: false
      },
      comments: false
    }),
    new OptimizeJsPlugin({
      sourceMap: false
    })
  ])
  watch = false
}

if (process.env.SHOW === 'yes') {
  plugins = plugins.concat([
    new BundleAnalyzerPlugin({
      // Automatically open analyzer page in default browser
      openAnalyzer: true,
      // Analyzer HTTP-server port
      analyzerPort: 8090
    })
  ])
}

module.exports = {
  watch: watch,
  devtool: devtool,
  entry: entry,
  output: output,
  module: {
    preLoaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }],
    postLoaders: postLoaders,
  },
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: __dirname,
    alias: alias
  }
}