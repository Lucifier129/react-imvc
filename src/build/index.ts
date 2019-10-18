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

export interface Build {
  (options: Options): Promise<Config | void>
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const build: Build = (options) => {
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

export default build

interface DelPublish {
  (folder: string): Promise<string[]>
}

const delPublish: DelPublish = (folder) => {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

interface StartType<T> {
  (config: Config): Promise<T>
}

const startWebpackForClient: StartType<Config | boolean> = (config) => {
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

const startWebpackForServer: StartType<Config> = (config) => {
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

const startGulp: StartType<Config> = (config) => {
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

interface StartStaticEntry<T> {
  (config: Config): Promise<T | void>
}

const startStaticEntry: StartStaticEntry<Config> = async (config) => {
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