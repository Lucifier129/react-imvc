import fs from 'fs'
import del from 'del'
import gulp from 'gulp'
import path from 'path'
import webpack from 'webpack'
import start from '../start'
import getConfig from '../config'
import createGulpTask from './createGulpTask'
import createWebpackConfig from './createWebpackConfig'
import type { Options, EntireConfig, AppSettings } from '..'

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { revStaticAssets, replaceManifestInDir } from './assetsHelper'

export default function build(options: Options): Promise<EntireConfig | void> {
  const config = getConfig(options, true)
  const delPublicPgs = () => delPublish(path.join(config.root, config.publish))
  const startGulpPgs = () => startGulp(config)
  const startWebpackPgs = async () => {
    const publishPath = path.join(config.root, config.publish)
    const staticPath = path.join(publishPath, config.static)
    let gulpAssets: Record<string, string> | null = null

    if (config.useContentHash) {
      gulpAssets = await revStaticAssets(staticPath)
    }

    await Promise.all([
      startWebpackForClient(config),
      startWebpackForServer(config),
    ])

    if (!gulpAssets) {
      return
    }

    const assetsPath = path.join(staticPath, config.assetsPath)
    const webpackAssets = require(assetsPath)

    const mergedAssets = {
      ...gulpAssets,
      ...webpackAssets,
    }

    await replaceManifestInDir(publishPath, gulpAssets)

    fs.writeFileSync(assetsPath, JSON.stringify(mergedAssets, null, 2))
  }

  const startStaticEntryPgs = () => startStaticEntry(config)
  const errorHandler = (error: Error) => {
    console.error(error)
    process.exit(1)
  }
  const finalHandler = () => {
    console.log('build successfully!')
    process.exit(0)
  }

  return Promise.resolve()
    .then(delPublicPgs)
    .then(startGulpPgs)
    .then(startWebpackPgs)
    .then(startStaticEntryPgs)
    .catch(errorHandler)
    .finally(finalHandler)
}

function delPublish(folder: string): Promise<string[]> {
  console.log(`delete publish folder: ${folder}`)
  return del(folder)
}

async function startWebpackForClient(config: EntireConfig): Promise<void> {
  let webpackConfig = await createWebpackConfig(config, false)
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

async function startWebpackForServer(config: EntireConfig): Promise<void> {
  let webpackConfig = await createWebpackConfig(config, true)
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

function startGulp(config: EntireConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    gulp.task('default', createGulpTask(config))

    gulp.series('default')((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

async function startStaticEntry(config: EntireConfig): Promise<void> {
  if (!config.staticEntry) {
    return
  }
  console.log(`start generating static entry file`)

  let appSettings: AppSettings = {
    ...config.appSettings,
    type: 'createHashHistory',
  }
  let staticEntryConfig: EntireConfig = {
    ...config,
    root: path.join(config.root, config.publish),
    // 默认当前文件夹
    publicPath: config.publicPath || '.',
    appSettings,
    SSR: false,
  }

  let { server } = await start({
    config: staticEntryConfig,
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

  return new Promise<void>((resolve, reject) => {
    type ErrorCallback = (err: NodeJS.ErrnoException | null) => void

    let callback: ErrorCallback = (error) => {
      error ? reject(error) : resolve()
    }
    fs.writeFile(staticEntryPath, html, callback)
  })
}
