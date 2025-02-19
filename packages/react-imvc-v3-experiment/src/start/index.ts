/**
 * node server start file
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

import 'core-js/stable'
import 'regenerator-runtime/runtime'
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

export default async function start(options: Options): Promise<Result> {
  let config = getConfig(options)
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

  if (hasModuleFile(routePath)) {
    // get server routes
    let routes = require(routePath)
    routes = routes.default || routes
    Object.keys(routes).forEach((key) => {
      let route = routes[key]
      if (typeof route === 'function') {
        route(app, server)
      }
    })
  }

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
      let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
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

function hasModuleFile(filename: string): boolean {
  try {
    return !!require.resolve(filename)
  } catch (_) {
    return false
  }
}
