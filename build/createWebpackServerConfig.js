var webpack = require('webpack')
var path = require('path')
var pkg = require('../package')

module.exports = function createWebpackServerConfig(options) {
  var config = Object.assign({}, options)
  var NODE_ENV = config.NODE_ENV || process.env.NODE_ENV

  var dependencies = []

  var list = [
    path.resolve('package.json'),
    path.join(__dirname, '../package.json'),
    path.join(config.root, '../package.json')
  ]

  while (list.length) {
    var item = list.shift()
    try {
      var pkg = require(item)
      if (pkg.dependencies) {
        dependencies = dependencies.concat(
        Object.keys(pkg.dependencies)
        )
      }
      if (pkg.devDependencies) {
        dependencies = dependencies.concat(
        Object.keys(pkg.devDependencies)
        )
      }
    } catch(error) {
      // ignore error
    }
  }

  var map = {}
  dependencies = dependencies.filter(name => {
    if (map[name]) {
      return false
    }
    map[name] = true
    return true
  })

  return {
    target: 'node',
    entry: {
      routes: path.join(config.root, config.src),
    },
    output: {
      path: path.join(__dirname, '../server'),
      filename: 'routes.js',
      libraryTarget: 'commonjs2'
    },
    module: {
      preLoaders: [{
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
      })
    ],
    externals: dependencies,
    resolve: {
      extensions: ['', '.js'],
      root: config.root,
      alias: {}
    }
  }
}