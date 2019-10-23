import fs from 'fs'
import gulp from 'gulp'
import path from 'path'
import webpack from 'webpack'
import del from 'del'
import start from '../start'
import getConfig from '../config'
import createGulpTask from './createGulpTask'
import createWebpackConfig from './createWebpackConfig'
import { Options, Config, AppSettings } from '..'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

export default function build(options: Options): Promise<Config | void> {
  let config = getConfig(options)
  let delPublicPgs = () => delPublish(path.join(config.root, config.publish))
  let startGulpPgs = () => startGulp(config)
  let startWebpackPgs = () =>
    Promise.all(
      [
        startWebpackForClient(config),
        config.useServerBundle && startWebpackForServer(config)
      ].filter(Boolean)
    )
  let startStaticEntryPgs = () => startStaticEntry(config)
  let errorHandler = (error: Error) => {
    console.error(error)
    process.exit(1)
  }

  return Promise.resolve()
    .then(delPublicPgs)
    .then(startGulpPgs)
    .then(startWebpackPgs)
    .then(startStaticEntryPgs)
    .catch(errorHandler)
}

function delPublish(folder: string): Promise<string[]> {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

function startWebpackForClient(config: Config): Promise<Config | boolean> {
  let webpackConfig = createWebpackConfig(config, false)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error, stats) => {
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

function startWebpackForServer(config: Config): Promise<Config> {
  let webpackConfig = createWebpackConfig(config, true)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error, stats) => {
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

function startGulp(config: Config): Promise<Config> {
  return new Promise((resolve, reject) => {
    gulp.task('default', createGulpTask(config))

    let taskFunction: gulp.TaskFunction = (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }
    gulp.series('default')(taskFunction)
  })
}

async function startStaticEntry(config: Config): Promise<Config | void> {
  if (!config.staticEntry) {
    return
  }
  console.log(`start generating static entry file`)

  let appSettings: Partial<AppSettings> = {
    ...config.appSettings,
    type: 'createHashHistory'
  }
  let staticEntryconfig: Config = {
    ...config,
    root: path.join(config.root, config.publish),
    publicPath: config.publicPath || '',
    appSettings,
    SSR: false
  }

  let { server } = await start({
    config: staticEntryconfig
  })

  let url = `http://localhost:${config.port}/__CREATE_STATIC_ENTRY__`
  console.log(`fetching url:${url}`)
  let response = await fetch(url)
  let html = await response.text()
  let staticEntryPath = path.join(
    config.root,
    config.publish,
    config.static,
    config.staticEntry
  )

  server.close(() => console.log('finish generating static entry file'))

  return new Promise<Config>((resolve, reject) => {

    type ErrorCallback = (err: NodeJS.ErrnoException | null) => void

    let callback: ErrorCallback = (error) => {
      error ? reject(error) : resolve()
    }
    fs.writeFile(staticEntryPath, html, callback)
  })
}