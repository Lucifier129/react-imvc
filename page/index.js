import path from 'path'
import { Router } from 'express'
import { renderToString } from 'react-dom/server'
import createApp from 'create-app/lib/server'
import config from '../../server.config'
import routes from '../../src'

const router = Router()
export default router

const serverAppSettings = {
  loader: module => module.default || module,
  routes: routes,
  viewEngine: {
    render: renderToString
  }
}

let app = createApp(serverAppSettings)

let assets = null
if (process.env.NODE_ENV === 'development' || process.env.BUILD === '1') {
  // 开发模式用 webpack-dev-middleware 获取 assets
  router.use((req, res, next) => {
    assets = getAssets(res.locals.webpackStats.toJson().assetsByChunkName)
    next()
  })
} else {
  // 生产模式直接用编译好的资源表
  try {
    // 在 publish 目录下启动
    assets = getAssets(require('../../stats'))
  } catch(error) {
    // 在项目根目录下启动
    assets = getAssets(require('../../publish/stats'))
  }
}

let layoutView = config.layout || path.join(__dirname, 'view')

// 添加浏览器端 app 配置
let attachClientAppSettings = (req, res, next) => {
  let locationOrigin = config.locationOrigin
  let host = req.headers.host
  let basename = req.basename || ''

  if (!host.includes('localhost') && !host.includes('127.0')) {
    locationOrigin = host
  }

  req.clientAppSettings = {
    basename: basename,
    type: 'createHistory',
    context: {
      basename,
      locationOrigin,
      ...config.clientContext,
    }
  }

  next()
}

router.all('*', attachClientAppSettings)

// 纯浏览器端渲染模式，用前置中间件拦截所有请求
if (process.env.CLIENT_RENDER === '1') {
  router.all('*', (req, res) => {
    res.render(layoutView, {
      assets: assets,
      appSettings: req.clientAppSettings
    })
  })
} else if (process.env.NODE_ENV === 'development') {
  // 带服务端渲染模式的开发环境，需要动态编译 src/routes
  var setupDevEnv = require('../build/setup-dev-env')
  setupDevEnv.setupServer({
    handleHotModule: routes => {
      app = createApp({
        ...serverAppSettings,
        routes
      })
    }
  })
}

// handle page
router.all('*', async (req, res, next) => {
  let serverContext = {
    req,
    res,
    isServer: true,
    isClient: false,
    basename: req.basename || '',
    publicPath: config.publicPath,
    // 服务端用 http 协议，浏览器端让浏览器自动补全协议
    restfulApi: 'http:' + config.serverRestfulApi,
    /**
     * serverLocationOrigin 是为了防止因为不能访问外网而导致的错误
     * 它是 localhost:${port} 的形式
     */
    locationOrigin: 'http:' + config.serverLocationOrigin,
    env: config.env,
    preload: {}
  }

  try {
    let {
      content,
      controller
    } = await app.render(req.url, serverContext)
    /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
    if (!content) {
      return
    }

    let initialState = controller.store
      ? controller.store.getState()
      : undefined
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

function getAssets (stats) {
  return Object.keys(stats).reduce((result, assetName) => {
    let value = stats[assetName]
    result[assetName] = Array.isArray(value) ? value[0] : value
    return result
  }, {})
}
