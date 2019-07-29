import fs from 'fs'
import gulp from 'gulp'
import path from 'path'
import webpack from 'webpack'
import del from 'del'
import start from '../start'
import getConfig, { Config, Options } from '../config'
import createGulpTask from './createGulpTask'
import createWebpackConfig from './createWebpackConfig'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

process.env.NODE_ENV = process.env.NODE_ENV || 'production'


export default (options: Options): Promise<Config> => {
  let config = getConfig(options)
  let delPublicPgs: () => Promise<string[]> = 
    () => delPublish(path.join(<string>config.root, <string>config.publish))
  let startGulpPgs: () => Promise<GulpConfig> =
    () => startGulp(config)
  let startWebpackPgs: () => Promise<(Config | boolean)[]> = () =>
    Promise.all(
      [
        startWebpackForClient(config),
        config.useServerBundle && startWebpackForServer(config)
      ].filter(Boolean)
    )
  let startStaticEntryPgs: () => Promise<Config> = () => startStaticEntry(config)
  let errorHandler: (error: Error) => never = (error: Error) => {
    console.error(error)
    process.exit(1)
    throw new Error('something is worng')
  }

  return Promise.resolve()
    .then(delPublicPgs)
    .then(startGulpPgs)
    .then(startWebpackPgs)
    .then(startStaticEntryPgs)
    .catch(errorHandler)
}

const delPublish = (folder: string): Promise<string[]> => {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

const startWebpackForClient = (config: Config): Promise<Config | boolean> => {
  let webpackConfig = createWebpackConfig(config, false)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error: Error, stats: webpack.Stats) => {
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

const startWebpackForServer = (config: Config): Promise<Config> => {
  let webpackConfig = createWebpackConfig(config, true)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error: Error, stats: webpack.Stats) => {
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

interface GulpConfig {

}

const startGulp = (config: GulpConfig): Promise<GulpConfig> => {
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

const startStaticEntry = async (config: Config): Promise<Config> => {
  if (!config.staticEntry) {
    return new Promise<Config>((resolve) => { resolve() })
  }
  console.log(`start generating static entry file`)

  let staticEntryconfig = {
    ...config,
    root: path.join(config.root, config.publish),
    publicPath: config.publicPath || '',
    appSettings: {
      ...config.appSettings,
      type: 'createHashHistory'
    },
    SSR: true
  }

  let { server } = await start({
    config: staticEntryconfig
  })

  let url = `heep://localhost:${config.port}/__CREATE_STATIC_ENTRY__`
  console.log(`fetching url:${url}`)
  let response = await fetch(url)
  let html = await response.text()
  let staticEntryPath = path.join(
    <string>config.root,
    <string>config.publish,
    <string>config.static,
    <string>config.staticEntry
  )

  server.close((): void => console.log('finish generating static entry file'))

  return new Promise((resolve, reject) => {
    let callback: (err: NodeJS.ErrnoException | null) => void = (error: NodeJS.ErrnoException | null) => {
      error ? reject(error) : resolve()
    }
    fs.writeFile(staticEntryPath, html, callback)
  })
}