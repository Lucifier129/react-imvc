import { Router } from 'express'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import createApp from 'create-app/server'
import util from '../util'
import IMVC from '../index'
import Controller from '../controller'

const { getFlatList } = util
const commonjsLoader: createApp.Loader = (loadModule, location, context) => {
  return (<createApp.LoadController>loadModule)(location, context)
}

/**
 * controller 里会劫持 React.createElement
 * server side 场景缺乏恢复机制
 * 因此在这里特殊处理，在渲染完后，恢复 React.createElement
 */
const createElement = React.createElement

const renderToNodeStream: IMVC.RenderToNodeStream<React.ReactElement> = (view: React.ReactElement, controller?: Controller) => {
  return new Promise<{}>((resolve, reject) => {
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

const renderToString: IMVC.RenderToString<React.ReactElement> = (view: React.ReactElement, controller?: Controller) => {
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
  renderToNodeStream: IMVC.RenderToNodeStream<React.ReactElement>,
  renderToString: IMVC.RenderToString<React.ReactElement>
} = {
  renderToNodeStream,
  renderToString
}

export default function createPageRouter(options: IMVC.Config) {
  let config = Object.assign({}, options)
  let routes: createApp.Route[] = []

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
  let render: createApp.RenderTo<React.ReactElement> = renderers[config.renderMode] || renderToNodeStream
  let serverAppSettings: IMVC.AppSettings = {
    loader: commonjsLoader,
    routes: routes,
    viewEngine: { render }
  }

  let app = createApp(serverAppSettings)
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
        app = createApp({
          ...serverAppSettings,
          routes
        })
      }
    })
  }

  // handle page
  router.all('*', async (req: IMVC.Req, res, next) => {
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
      let { content, controller } = await (app.render as createApp.Render)(req.url, context)

      /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
      if (!content) {
        return
      }

      // content 可能是异步渲染的
      content = await content

      let initialState: IMVC.State | undefined = controller.store
        ? (controller.store.getState as Function)()
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
