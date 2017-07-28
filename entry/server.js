import fs from 'fs'
import express from 'express'
import compression from 'compression'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import helmet from 'helmet'
import ReactViews from 'express-react-views'
import shareRoot from '../middleware/shareRoot'
import wrapRender from '../middleware/wrapRender'
import createPageRouter from '../page/createPageRouter'

export default function createExpressApp(config) {
  const app = express()

  // handle basename
  if (config.basename) {
    let list = Array.isArray(config.basename) ? config.basename : [config.basename]
    list.forEach(basename => {
      app.use(shareRoot(basename))
    })
  }

  // handle helmet
  if (config.helmet) {
    app.use(helmet(config.helmet))
  }

  // handle compression
  if (config.compression) {
    app.use(compression(config.compression))
  }

  // handle favicon
  if (config.favicon) {
    app.use(favicon(config.favicon))
  }

  // handle view engine
  app.engine(
    'js',
    ReactViews.createEngine(config.ReactViews)
  )

  // view engine setup
  app.set('views', path.join(config.routes || ''))
  app.set('view engine', 'js')

  // handle default props
  app.use(
    wrapRender({
      defaults: config
    })
  )

  // handle logger
  if (config.logger) {
    app.use(logger(config.logger))
  }

  // handle bodyParser
  if (config.bodyParser) {
    if (config.bodyParser.json) {
      app.use(bodyParser.json(config.bodyParser.json))
    }

    if (config.bodyParser.urlencoded) {
      app.use(
        bodyParser.urlencoded(config.bodyParser.urlencoded)
      )
    }
  }

  // handle cookieParser
  if (config.cookieParser) {
    app.use(cookieParser(config.cookieParser))
  }

  app.get('/slbhealthcheck.html', (req, res) => {
    res.send('slbhealthcheck ok')
  })

  var statciPath = '/' + config.static

  if (config.webpackDevMiddleware) {
    // 开发模式用 webpack-dev-middleware 代理 js 文件
    var setupDevEnv = require('../build/setup-dev-env')
    app.use(setupDevEnv.setupClient(config.static))

    // 开发模式里，用 src 里的静态资源
    app.use(statciPath, express.static(path.join(config.root, config.src)))
  } else {
    // publish 目录启动
    app.use(statciPath, express.static(path.join(config.root, config.static)))
    // 在根目录启动
    app.use(statciPath, express.static(path.join(config.root, config.publish, config.static)))
  }

  app.use('/mock', (req, res, next) => {
    let {
      url: target
    } = req
    let filePath = path.join(config.root, config.src, `${target}.json`)
    try {
      let data = fs.readFileSync(filePath, 'utf-8').toString()
      res.type('application/json')
      res.send(data)
    } catch (error) {
      next(error)
    }
  })

  let serverHandlers = app.serverHandlers = []
  let routes = null

  try {
    routes = require(path.join(config.root, config.routes))
  } catch (error) {
    // ignore error
  }

  if (routes) {
    Object.keys(routes).forEach(key => {
      let route = routes[key]
      if (typeof route === 'function') {
        route(app, serverHandlers)
      }
    })
  }

  let page = createPageRouter(config)
  app.use(page)

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
}