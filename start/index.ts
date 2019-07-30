/**
 * node server start file
 */
if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'production'
}

import 'core-js/stable'
import 'regenerator-runtime/runtime'

import path from 'path'
import http from 'http'
import fetch, * as nodeFetch from 'node-fetch'
import express from 'express'
import debug from 'debug'
import createExpressApp from '../entry/server'
import getConfig, { Options, Config } from '../config'
import createPageRouter from '../page/createPageRouter'

const start: (options: Options) => Promise<{server: http.Server, app: express.Express}> = (options) => {
	let config: Config = getConfig(options)
	let app: express.Express = createExpressApp(config)
	let port: number = normalizePort(config.port)

	/**
	 * make fetch works like in browser
	 * when url starts with //, prepend protocol
	 * when url starts with /, prepend protocol, host and port
	 */
  let fetchNative: (url: string, options: nodeFetch.RequestInit) => Promise<nodeFetch.Response> = (url, options) => {
		if (url.startsWith('//')) {
			url = 'http:' + url
		}
		if (url.startsWith('/')) {
			url = `http://localhost:${port}${url}`
		}
		return fetch(url, options)
  }
  global.fetch = fetchNative  

	/**
	 * set port from environment and store in Express.
	 */
	app.set('port', port)

	/**
	 * Create HTTP server.
	 */

	let server: http.Server = http.createServer(app)

	let pageRouter = createPageRouter(config)

	// 添加 renderPage 方法，让自定义的 routes 里可以手动调用，走 IMVC 的渲染流程
	app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
		res.renderPage = pageRouter
		next()
	})

	let routePath = path.join(config.root, config.routes)

	if (hasModuleFile(routePath)) {
		// get server routes
		let routes = require(routePath)
		routes = routes.default || routes
		Object.keys(routes).forEach(key => {
			let route = routes[key]
			if (typeof route === 'function') {
				route(app, server)
			}
		})
	}

	app.use(pageRouter)

	// catch 404 and forward to error handler
	app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
		const err: any = new Error('Not Found')
		err.status = 404
		res.render('404', err)
	})

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
			res.status(err.status || 500)
			res.send(err.stack)
		})
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
		res.status(err.status || 500)
		res.json(err.message)
	})

	return new Promise<{server: http.Server, app: express.Express}>((resolve, reject) => {
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
}

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort: (val: string) => number | string | boolean = (val) => {
	let port = parseInt(val, 10)

	if (isNaN(port)) {
		// named pipe
		return val
	}

	if (port >= 0) {
		// port number
		return port
	}

	return false
}

const hasModuleFile: (filename: string) => string | boolean = (filename) => {
	try {
		return !!require.resolve(filename)
	} catch (_) {
		return false
	}
}

export default start