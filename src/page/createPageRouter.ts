import { Router } from 'express'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
// @ts-ignore
import CA from 'create-app'
import util from '../util'
import { AppSettingContext, AppSettingLoader, AppSettingController, Config, AppSettings } from '../config'
import { Req, Res } from '../types'
import Controller from '../controller'
import { State } from '../controller/types'

const { getFlatList } = util
const getModule = (module: any) => module.default || module
const commonjsLoader: CA.Loader = (loadModule, location, context) => {
  const controller = loadModule(location, context)
  return getModule(controller)
}

/**
 * controller 里会劫持 React.createElement
 * server side 场景缺乏恢复机制
 * 因此在这里特殊处理，在渲染完后，恢复 React.createElement
 */
const createElement = React.createElement

const renderToNodeStream: CA.ViewEngineRender = (view, controller) => {
  return new Promise((resolve, reject) => {
    let stream = ReactDOMServer.renderToNodeStream(<React.ReactElement>view)
    let buffers: Uint8Array[] = []
    stream.on('data', chunk => buffers.push(chunk))
    stream.on('end', () => {
      React.createElement = createElement
      resolve(Buffer.concat(buffers))
    })
    stream.on('error', error => {
      if (!controller) {
        React.createElement = createElement
        return reject(error)
      }

      if (controller.errorDidCatch) {
        controller.errorDidCatch(error, 'view')
      }

      if (controller.getViewFallback) {
        let fallbackView: React.ReactElement = controller.getViewFallback('view')
        renderToNodeStream(fallbackView).then(resolve, reject)
      } else {
        React.createElement = createElement
        reject(error)
      }
    })
  })
}

const renderToString: CA.ViewEngineRender = (view, _, controller) => {
  try {
    return ReactDOMServer.renderToString(<React.ReactElement>view)
  } catch (error) {
    if (!controller) throw error

    if (controller.errorDidCatch) {
      controller.errorDidCatch(error, 'view')
    }

    if (controller.getViewFallback) {
      let fallbackView = controller.getViewFallback()
      return renderToString(fallbackView)
    } else {
      throw error
    }
  } finally {
    React.createElement = createElement
  }
}

const renderers: {
  renderToNodeStream: CA.ViewEngineRender,
  renderToString: CA.ViewEngineRender,
  [propName: string]: CA.ViewEngineRender
} = {
  renderToNodeStream,
  renderToString
}

export default function createPageRouter(options: Config) {
  let config = Object.assign({}, options)
  let routes: CA.Route[] = []

  if (config.useServerBundle) {
    routes = require(path.join(config.root, config.serverBundleName))
  } else {
    routes = require(path.join(config.root, config.src))
  }

  if (!Array.isArray(routes)) {
    routes = Object.values(routes)
  }
  routes = getFlatList(routes)

  let router = Router()
  let render = renderers[config.renderMode] || renderToNodeStream
  let serverAppSettings: AppSettings = {
    loader: commonjsLoader,
    routes: routes,
    viewEngine: { render }
  }

  let app = CA.server(serverAppSettings)
  let layoutView = config.layout || path.join(__dirname, 'view')

  // 纯浏览器端渲染模式，用前置中间件拦截所有请求
  if (config.SSR === false) {
    router.all('*', (req, res) => {
      res.render(layoutView)
    })
  } else if (config.NODE_ENV === 'development') {
    // 带服务端渲染模式的开发环境，需要动态编译 src/routes
    var setupDevEnv = require('../build/setup-dev-env')
    setupDevEnv.setupServer(config, {
      handleHotModule: ($routes: any[] | object) => {
        const routes = getFlatList(
          Array.isArray($routes) ? $routes : Object.values($routes)
        )
        app = CA.server({
          ...serverAppSettings,
          routes
        })
      }
    })
  }

  // handle page
  router.all('*', async (req: Req, res, next) => {
    let { basename, serverPublicPath, publicPath } = req
    let context = {
      basename,
      serverPublicPath,
      publicPath,
      restapi: config.serverRestapi || config.restapi || '',
      ...config.context,
      preload: {},
      isServer: true,
      isClient: false,
      req,
      res
    }

    try {
      let { content, controller } = await app.render(req.url, context) as 
      { content: any, controller: Controller }

      /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
      if (!content) {
        return
      }

      // content 可能是异步渲染的
      content = await content

      let initialState: State | undefined = controller.store
        ? controller.store.getState()
        : undefined
      let htmlConfigs = initialState ? initialState.html : undefined
      let data = {
        ...htmlConfigs,
        content,
        initialState
      }

      if (controller.destory) {
        controller.destory()
      }

      // 支持通过 res.locals.layoutView 动态确定 layoutView
      res.render(res.locals.layoutView || layoutView, data)
    } catch (error) {
      next(error)
    }
  })

  return router
}
