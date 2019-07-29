import fs from 'fs'
import gulp from 'gulp'
import path from 'path'
import webpack, { Stats } from 'webpack'
import del from 'del'
import start from '../start'
import getConfig from '../config'
import createGulpTask from './createGulpTask'
import createWebpackConfig from './createWebpackConfig'
import { resolve } from 'url';

interface Options {

}

export default (options: Options): Promise<Options> => {
  let config = getConfig(options)
  let delPublicPgs: () => Promise<string[]> = 
    () => delPublish(path.join(config.root, config.publish))
  let startGulpPgs: () => Promise<GulpConfig> =
    () => startGulp(config)
  let startWebpackPgs: () => Promise<(Config | boolean)[]> = () =>
    Promise.all(
      [
        startWebpackForClient(config),
        config.useServerBundle && startWebpackForServer(config)
      ].filter(Boolean)
    )
  return Promise.resolve()
    .then()
}

const delPublish = (folder: string): Promise<string[]> => {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

interface Config {
  webpackLogger: Stats.ToStringOptions
}

const startWebpackForClient = (config: Config): Promise<Config | boolean> => {
  let webpackConfig = createWebpackConfig(config, false)
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (error: Error, stats: Stats) => {
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
    webpack(webpackConfig, (error: Error, stats: Stats) => {
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

interface StaticEntryConfig {
  port: number
  appSettings: object
  root: string
  static: string
  staticEntry?: string
  publish: string
  publicPath?: string
}

const startStaticEntry = async (config: StaticEntryConfig): Promise<StaticEntryConfig | undefined> => {
  if (!config.staticEntry) {
    return
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
    config.root,
    config.publish,
    config.static,
    config.staticEntry
  )

  server.close((): void => console.log('finish generating static entry file'))

  return new Promise((resolve, reject) => {
    let callback: (err: NodeJS.ErrnoException | null) => void = (error: NodeJS.ErrnoException | null) => {
      error ? reject(error) : resolve()
    }
    fs.writeFile(staticEntryPath, html, callback)
  })
}