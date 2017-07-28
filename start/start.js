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

createExpressApp = createExpressApp.default || createExpressApp
defaultConfig = defaultConfig.default || defaultConfig

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
    /**
     * Listen on provided port, on all network interfaces.
     */
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)

  /**
   * 提供接触 server 的接口
   */
  if (Array.isArray(app.serverHandlers)) {
    app.serverHandlers.forEach(function(handler) {
      handler(server)
    })
  }
  
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