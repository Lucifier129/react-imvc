process.env.NODE_ENV = process.env.NODE_ENV || 'production'

require('core-js/stable')
require('regenerator-runtime/runtime')

const fs = require('fs')
const del = require('del')
const path = require('path')
const gulp = require('gulp')
const webpack = require('webpack')
const start = require('../start')
const getConfig = require('../config')
const createGulpTask = require('./createGulpTask')
const createWebpackConfig = require('./createWebpackConfig')
const { revStaticAssets } = require('./assetsHelper')

module.exports = function build(options) {
  let config = getConfig(options)
  return Promise.resolve()
    .then(() => delPublish(path.join(config.root, config.publish)))
    .then(() => startGulp(config))
    .then(async () => {
      await Promise.all([
        startWebpackForClient(config),
        startWebpackForServer(config)
      ])

      const staticPath = path.join(config.root, config.publish, config.static)
      const assetsPath = path.join(staticPath, config.assetsPath)
      const assets = require(assetsPath)

      const manifest = await revStaticAssets(staticPath)

      const mergedAssets = {
        ...assets,
        ...manifest,
      }

      fs.writeFileSync(assetsPath, JSON.stringify(mergedAssets, null, 2))

    })
    .then(() => startStaticEntry(config))
    .then(() => {
      console.log('build successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

function delPublish(folder) {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

async function startWebpackForClient(config) {
  let webpackConfig = await createWebpackConfig(config, false)
  return new Promise(function (resolve, reject) {
    webpack(webpackConfig, function (error, stats) {
      if (error) {
        reject(error)
      } else {
        if (config.webpackLogger) {
          console.log(
            '[webpack:client:build]',
            stats.toString(config.webpackLogger)
          )
        }
        resolve()
      }
    })
  })
}

async function startWebpackForServer(config) {
  let webpackConfig = await createWebpackConfig(config, true)
  return new Promise(function (resolve, reject) {
    webpack(webpackConfig, function (error, stats) {
      if (error) {
        reject(error)
      } else {
        if (config.webpackLogger) {
          console.log(
            '[webpack:server:build]',
            stats.toString(config.webpackLogger)
          )
        }
        resolve()
      }
    })
  })
}

function startGulp(config) {
  return new Promise(function (resolve, reject) {
    gulp.task('default', createGulpTask(config))
    gulp.series('default')(error => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

async function startStaticEntry(config) {
  if (!config.staticEntry) {
    return
  }
  console.log(`start generating static entry file`)

  var staticEntryConfig = {
    ...config,
    root: path.join(config.root, config.publish),
    publicPath: config.publicPath || '.',
    appSettings: {
      ...config.appSettings,
      type: 'createHashHistory'
    },
    SSR: false
  }

  var { server } = await start({
    config: staticEntryConfig
  })

  var url = `http://localhost:${config.port}/__CREATE_STATIC_ENTRY__`
  console.log(`fetching url:${url}`)
  var response = await fetch(url)
  var html = await response.text()
  let staticEntryPath = path.join(
    config.root,
    config.publish,
    config.static,
    config.staticEntry
  )

  server.close(() => console.log('finish generating static entry file'))

  return new Promise((resolve, reject) => {
    fs.writeFile(staticEntryPath, html, error => {
      error ? reject(error) : resolve()
    })
  })
}
