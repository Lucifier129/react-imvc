/**
 * node server start file
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import * as fs from 'fs/promises'
import path from 'path'
import http from 'http'
import debug from 'debug'
import express from 'express'
import fetch, * as nodeFetch from 'node-fetch'
import getConfig from '../config'
import createExpressApp from '../entry/server'
import createPageRouter from '../page/createPageRouter'
import type { Options, RequestHandler, Result } from '..'

declare global {
  namespace NodeJS {
    interface Global {
      fetch: typeof window.fetch
    }
  }
}

const isExist = async (path: string) => {
  try {
    await fs.access(path)
    return true
  } catch (e) {
    return false
  }
}

type PackageResult = {
  filename: string
  package: {
    name: string
  }
}

const findUpClosestTwoPackages = async (startDir: string) => {
  let currentDir = startDir
  let packages = [] as PackageResult[]

  while (true) {
    let packageFile = path.join(currentDir, 'package.json')
    if (await isExist(packageFile)) {
      packages.unshift({
        filename: packageFile,
        package: require(packageFile),
      })

      if (packages.length >= 2) {
        break
      }
    }

    let parentDir = path.dirname(currentDir)

    if (parentDir === currentDir) {
      break
    }

    currentDir = parentDir
  }

  return packages
}

const syncPackage = async () => {
  const mainFilename = path.normalize(require.main?.filename ?? '')

  if (!mainFilename) {
    return
  }

  const packages = await findUpClosestTwoPackages(path.dirname(mainFilename))

  if (packages.length < 2) {
    return
  }

  const [rootPackage, publishPackage] = packages

  const isPackageNameEqual =
    rootPackage.package.name === publishPackage.package.name
  const isPackageContentEqual =
    JSON.stringify(rootPackage.package) ===
    JSON.stringify(publishPackage.package)

  if (!isPackageNameEqual || isPackageContentEqual) {
    return
  }

  console.error(
    `${publishPackage.filename}\nis not equal to\n${rootPackage.filename}\nSyncing...`
  )
  await fs.writeFile(
    publishPackage.filename,
    await fs.readFile(rootPackage.filename)
  )
  console.error('Syncing done. Please restart the server to apply changes')
  process.exit(1)
}

export type Route = (
  app: express.Express,
  server: http.Server
) => void | Promise<void>

export type Routes = Record<string, Route>

export default async function start(options: Options): Promise<Result> {
  let config = getConfig(options)

  /**
   * sync package.json in root dir and publish dir
   * if they are not equal when server starts not from script
   */
  if (config.syncPackage && options.fromScript !== true) {
    await syncPackage()
  }

  let [app, pageRouter] = await Promise.all([
    createExpressApp(config),
    createPageRouter(config),
  ])

  let port = normalizePort(config.port)

  /**
   * make fetch works like in browser
   * when url starts with //, prepend protocol
   * when url starts with /, prepend protocol, host and port
   */
  function fetchNative(
    url: string,
    options: nodeFetch.RequestInit
  ): Promise<nodeFetch.Response> {
    if (url.startsWith('//')) {
      url = 'http:' + url
    }
    if (url.startsWith('/')) {
      url = `http://localhost:${port}${url}`
    }
    return fetch(url, options)
  }
  global.fetch = fetchNative as unknown as typeof window.fetch

  /**
   * set port from environment and store in Express.
   */
  app.set('port', port)

  /**
   * Create HTTP server.
   */

  let server = http.createServer(app)

  let routePath = path.join(config.root, config.routes)

  // 添加 renderPage 方法，让自定义的 routes 里可以手动调用，走 IMVC 的渲染流程
  let addRenderPage: RequestHandler = (req, res, next) => {
    res.renderPage = pageRouter
    next()
  }

  // catch 404 and forward to error handler
  let catch404: express.RequestHandler = function (req, res, next) {
    const err: any = new Error('Not Found')
    err.status = 404
    res.render('404', err)
  }

  // error handlers
  // development error handler
  let devErrorHandler: express.ErrorRequestHandler = function (
    err: any,
    req,
    res,
    next
  ) {
    res.status(err.status || 500)
    res.send(err.stack)
  }

  // production error handler
  let prodErrorHandler: express.ErrorRequestHandler = function (
    err: any,
    req,
    res,
    next
  ) {
    res.status(err.status || 500)
    res.send(err.message)
  }

  app.use(addRenderPage as express.RequestHandler)

  // get server routes
  let routes = getRoutes(routePath)

  await Promise.all(
    Object.keys(routes).map(async (key) => {
      let route = routes[key]
      if (typeof route === 'function') {
        await route(app, server)
      }
    })
  )

  app.use(pageRouter)
  app.use(catch404)
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(devErrorHandler)
  } else {
    app.use(prodErrorHandler)
  }

  let promise = new Promise<Result>((resolve, reject) => {
    /**
     * Event listener for HTTP server "listening" event.
     */

    const onListening = () => {
      let addr = server.address()
      let bind =
        typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port
      debug('Listening on ' + bind)
      console.log('Listening on ' + bind)
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    const onError = (error: any) => {
      if (error.syscall !== 'listen') {
        throw error
      }

      let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges')
          process.exit(1)
          break
        case 'EADDRINUSE':
          console.error(bind + ' is already in use')
          process.exit(1)
          break
        default:
          throw error
      }
    }

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
    server.on('error', reject)
    server.on('listening', () => resolve({ server, app }))
  })

  return promise
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string | number): string | number | undefined {
  let port = parseInt(String(val), 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return void 0
}

const getRoutes = (filename: string): Routes => {
  try {
    return require(filename)
  } catch (_) {
    return {}
  }
}
