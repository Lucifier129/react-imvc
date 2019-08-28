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
import getConfig from '../config'
import createPageRouter from '../page/createPageRouter'
import IMVC from '../index'

type StartFunc = (options: IMVC.Options) => Promise<{server: http.Server, app: express.Express}>

const start: StartFunc = (options) => {
	let config = getConfig(options)
	let app = createExpressApp(config)
	let port = normalizePort(<string>config.port)

	/**
	 * make fetch works like in browser
	 * when url starts with //, prepend protocol
	 * when url starts with /, prepend protocol, host and port
	 */
  let fetchNative = (url: string, options: nodeFetch.RequestInit) => {
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

	let server = http.createServer(app)

	let pageRouter = createPageRouter(config)

	// 添加 renderPage 方法，让自定义的 routes 里可以手动调用，走 IMVC 的渲染流程
	let addRenderPage: IMVC.RequestHandler = (req, res, next) => {
		res.renderPage = pageRouter
		next()
	}
	app.use(addRenderPage as express.RequestHandler)

	let routePath = path.join(config.root, config.routes)
	console.log(routePath)

	if (hasModuleFile(routePath)) {
		// get server routes
		let routes = require(routePath)
		routes = routes.default || routes
		Object.keys(routes).forEach(key => {
			let route = routes[key]
			console.log(route)
			if (typeof route === 'function') {
				route(app, server)
			}
		})
	}

	app.use(pageRouter)

	// catch 404 and forward to error handler
	let catch404: IMVC.RequestHandler = function(req, res, next) {
		const err: any = new Error('Not Found')
		err.status = 404
		res.render('404', err)
	}
	app.use(catch404 as express.RequestHandler)

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function(err: any, req, res, next) {
			res.status(err.status || 500)
			res.send(err.stack)
		} as express.ErrorRequestHandler)
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err: any, req, res, next) {
		res.status(err.status || 500)
		res.json(err.message)
	} as express.ErrorRequestHandler)

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

const normalizePort = (val: string) => {
	let port = parseInt(val, 10)

	if (isNaN(port)) {
		// named pipe
		return val
	}

	if (port >= 0) {
		// port number
		return port
	}

	return undefined
}

const hasModuleFile = (filename: string) => {
	try {
		return !!require.resolve(filename)
	} catch (_) {
		return false
	}
}

export default start