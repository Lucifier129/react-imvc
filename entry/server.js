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

export default function createExpressApp(config) {
  const app = express()

  // handle basename
  let list = Array.isArray(config.basename) ? config.basename : [config.basename || '']
  list.forEach(basename => {
    app.use(shareRoot(basename))
  })

  // handle publicPath
  app.use((req, res, next) => {
    let basename = req.basename // from shareRoot
    let serverPublicPath = basename + config.staticPath
    let publicPath = config.publicPath || serverPublicPath
    req.serverPublicPath = serverPublicPath
    req.publicPath = publicPath
    next()
  })

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
  app.set('views', path.join(config.root, config.routesPath))
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

  if (config.webpackDevMiddleware) {
    // 开发模式用 webpack-dev-middleware 代理 js 文件
    let setupDevEnv = require('../build/setup-dev-env')
    app.use(setupDevEnv.setupClient(config))

    // 开发模式里，用 src 里的静态资源
    app.use(config.staticPath, express.static(path.join(config.root, config.src)))
  } else {
    // publish 目录启动
    app.use(config.staticPath, express.static(path.join(config.root, config.static)))
      // 在根目录启动
    app.use(config.staticPath, express.static(path.join(config.root, config.publish, config.static)))
  }

  if (config.NODE_ENV === 'development') {
    app.use('/mock', (req, res, next) => {   
      req.on('error', next)
      res.on('error', next)
      res.type('application/json')

      let filePath = path.join(config.root, config.src, `${req.url}.json`)
      fs.createReadStream(filePath).pipe(res)
    })
  }

  return app
}