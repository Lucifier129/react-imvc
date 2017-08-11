/**
 * node server start file
 */
if (process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'production'
}

require('babel-polyfill')
var fetch = require('node-fetch')
var debug = require('debug')('app:server')
var http = require('http')
var createExpressApp = require('../entry/server')
var getConfig = require('../config')
var createPageRouter = require('../page/createPageRouter')

createExpressApp = createExpressApp.default || createExpressApp
getConfig = getConfig.default || getConfig
createPageRouter = createPageRouter.default || createPageRouter

module.exports = function start(options) {
  var config = getConfig(options)
  var app = createExpressApp(config)
  var port = config.port

  // let fetch work like in browser, if url start with '/', then fill location.origin
  global.fetch = (url, options) => {
    if (url.indexOf('/') === 0) {
      url = `http://localhost:${port}` + url
    }
    return fetch(url, options)
  }

  /**
   * set port from environment and store in Express.
   */
  app.set('port', port)

  /**
   * Create HTTP server.
   */

  var server = http.createServer(app)
  let routes = null

  try {
    routes = require(path.join(config.root, config.routesPath))
  } catch (error) {
    // ignore error
  }

  if (routes) {
    Object.keys(routes).forEach(key => {
      let route = routes[key]
      if (typeof route === 'function') {
        route(app, server)
      }
    })
  }
  
  app.use(createPageRouter(config))

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500)
      var message = (err.message + '\n' + err.stack)
        .split('\n')
        .map(item => `<p style="margin:0;padding:0">${item}</p>`)
        .join('')
      res.send(message)
    })
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.json(err.message)
  })

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('Listening on ' + bind)
}