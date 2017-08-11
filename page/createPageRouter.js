import {
  Router
} from 'express'
import path from 'path'
import ReactDOMServer from 'react-dom/server'
import createApp from 'create-app/lib/server'

const commonjsLoader = module => module.default || module
const getAssets = status => {
  return Object.keys(stats).reduce((result, assetName) => {
    let value = stats[assetName]
    result[assetName] = Array.isArray(value) ? value[0] : value
    return result
  }, {})
}

export default function createPageRouter(options) {
  let config = Object.assign({}, options)
  let routes = require(path.join(config.root, config.src))
  let router = Router()
  let serverAppSettings = {
    loader: commonjsLoader,
    routes: routes,
    viewEngine: {
      render: ReactDOMServer[config.renderMode]
    }
  }

  let app = createApp(serverAppSettings)
  let assets = null

  if (config.webpackDevMiddleware) {
    // 开发模式用 webpack-dev-middleware 获取 assets
    router.use((req, res, next) => {
      assets = getAssets(res.locals.webpackStats.toJson().assetsByChunkName)
      next()
    })
  } else {
    // 生产模式直接用编译好的资源表
    let assetsPathList = [
      // 在 publish 目录下启动
      path.join(config.cwd, config.static, config.statsPath),
      // 在项目根目录下启动
      path.join(config.cwd, config.publish, config.static, config.statsPath)
    ]

    while (assetsPathList.length) {
      try {
        assets = require(assetsPathList.shift())
      } catch (error) {
        // ignore error
      }
    }

    if (!assets) {
      throw new Error('找不到 webpack 资源表 stats.json')
    }
    
    assets = getAssets(assets)
  }

  let layoutView = config.layout || path.join(__dirname, 'view')

  // 添加浏览器端 app 配置
  let attachClientAppSettings = (req, res, next) => {
    let host = req.headers.host
    let basename = req.basename
    let context = {
      basename: basename,
      preload: {},
      ...config.context,
    }

    req.clientAppSettings = {
      type: 'createHistory',
      basename,
      context,
    }

    next()
  }

  router.use(attachClientAppSettings)

  // 纯浏览器端渲染模式，用前置中间件拦截所有请求
  if (config.SSR === false) {
    router.all('*', (req, res) => {
      res.render(layoutView, {
        assets: assets,
        appSettings: req.clientAppSettings
      })
    })
  } else if (config.NODE_ENV === 'development') {
    // 带服务端渲染模式的开发环境，需要动态编译 src/routes
    var setupDevEnv = require('../build/setup-dev-env')
    setupDevEnv.setupServer(config, {
      handleHotModule: routes => {
        app = createApp({
          ...serverAppSettings,
          routes
        })
      }
    })
  }

  // handle page
  router.all('*', async(req, res, next) => {
    let context = {
      basename: req.basename,
      preload: {},
      ...config.context,
      req,
      res,
      isServer: true,
      isClient: false,
      publicPath: config.publicPath,
    }

    try {
      let {
        content,
        controller
      } = await app.render(req.url, context)

      /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
      if (!content) {
        return
      }

      let initialState = controller.store ? controller.store.getState() : undefined
      let htmlConfigs = initialState ? initialState.html : undefined
      let data = {
        ...htmlConfigs,
        assets,
        content,
        initialState,
        appSettings: req.clientAppSettings
      }

      res.render(layoutView, data)
    } catch (error) {
      next(error)
    }
  })
}