import vm from 'vm'
import path from 'path'
import MFS from 'memory-fs'
import webpack from 'webpack'
import notifier from 'node-notifier'
import webpackDevMiddleware from 'webpack-dev-middleware'
import createWebpackConfig from './createWebpackConfig'
import type { NextHandleFunction } from 'connect'
import type { EntireConfig } from '..'

export async function setupClient(config: EntireConfig) {
  let startTime = Date.now()
  console.log('client webpack is starting...')
  let clientConfig = await createWebpackConfig(config)
  let compiler = webpack(clientConfig)
  return new Promise<{
    compiler: webpack.Compiler
    middleware: webpackDevMiddleware.WebpackDevMiddleware & NextHandleFunction
  }>((resolve) => {
    let isResolved = false
    let middleware = webpackDevMiddleware(compiler, {
      publicPath: config.staticPath,
      stats: config.webpackLogger,
      serverSideRender: true,
      reporter: (middlewareOptions, options) => {
        reporter(middlewareOptions, options)
        if (config.notifier) {
          notifier.notify({
            title: 'React-IMVC',
            message: 'Webpack 编译结束',
          })
        }
        if (!isResolved) {
          isResolved = true
          console.log(
            `client webpack compile success in ${Date.now() - startTime}ms`
          )
          resolve({
            middleware,
            compiler,
          })
        }
      },
    })
  })
}

interface SetupServerOptions {
  handleHotModule: (value: any) => void
}

export async function setupServer(
  config: EntireConfig,
  options: SetupServerOptions
) {
  let startTime = Date.now()
  console.log('server webpack is starting...')

  let serverConfig = await createWebpackConfig(config, true)

  if (!serverConfig.output?.path || !serverConfig.output.filename) {
    throw new Error(
      'serverConfig.output.path and serverConfig.output.filename must be specified'
    )
  }

  let serverCompiler = webpack(serverConfig)
  let mfs = new MFS()
  let outputDir = serverConfig.output.path
  let outputPath = path.join(outputDir, serverConfig.output.filename as string)
  serverCompiler.outputFileSystem = mfs

  return new Promise<unknown>((resolve, reject) => {
    let isResolved = false
    serverCompiler.watch({}, (err, stats) => {
      if (err) throw err
      let currentStats = stats.toJson()
      currentStats.errors.forEach((err) => console.error(err))
      currentStats.warnings.forEach((err) => console.warn(err))
      let sourceCode: string = mfs.readFileSync(outputPath, 'utf-8')

      let virtualRequire = (modulePath: string) => {
        let filePath = path.join(outputDir, modulePath)

        if (mfs.existsSync(filePath)) {
          let sourceCode = mfs.readFileSync(filePath, 'utf-8')
          return runCode(sourceCode)
        }

        let moduleFilePath = require.resolve(modulePath, {
          paths: [outputDir],
        })

        return require(moduleFilePath)
      }

      let runCode = (sourceCode: string) => {
        return vm.runInThisContext(`
          (function(require) {
            var module = {exports: {}}
                    var factory = function(require, module, exports) {
                        ${sourceCode}
                    }

                    factory(require, module, module.exports)

                    return module.exports
          })
        `)(virtualRequire)
      }

      try {
        // 构造一个 commonjs 的模块加载函数，拿到 newModule
        let newModule = runCode(sourceCode)

        if (!isResolved) {
          isResolved = true
          console.log(
            `server webpack compile success in ${Date.now() - startTime}ms`
          )
          resolve(newModule?.default || newModule)
        } else {
          options.handleHotModule(newModule?.default || newModule)
        }
      } catch (error) {
        reject(error)
      }
    })
  })
}

export function reporter(
  middlewareOptions: webpackDevMiddleware.Options,
  options: webpackDevMiddleware.ReporterOptions
): void {
  const { log, state, stats } = options
  if (state) {
    const displayStats = middlewareOptions.stats !== false
    const statsString = stats ? stats.toString(middlewareOptions.stats) : ''

    if (displayStats && statsString.trim().length) {
      if (stats && stats.hasErrors()) {
        log.error(statsString)
      } else if (stats && stats.hasWarnings()) {
        log.warn(statsString)
      } else {
        log.info(statsString)
      }
    }

    let message = 'Compiled successfully.'

    if (stats && stats.hasErrors()) {
      message = 'Failed to compile.'
    } else if (stats && stats.hasWarnings()) {
      message = 'Compiled with warnings.'
    }
    log.info(message)
  } else {
    log.info('Compiling...')
  }
}
