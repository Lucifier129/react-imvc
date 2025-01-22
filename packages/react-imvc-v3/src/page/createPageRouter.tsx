import fs from 'fs'
import path from 'path'
import React from 'react'
import { Router } from 'express'
import createApp from 'create-app/server'
import ReactDOMServer from 'react-dom/server'
import Controller from '../controller'
import {
  getFlatList,
  getClearFilePath,
  stringToUnit8Array,
  isThenable,
  isIMVCController,
} from '../util'
import type {
  HistoryLocation,
  Context,
  LoadController,
  ControllerConstructor,
  Route,
  ViewEngineRender,
} from 'create-app/server'
import type { EntireConfig, AppSettings, Req } from '..'
import { Stream } from 'stream'

function getModule(module: any) {
  return module.default || module
}
function commonjsLoader(
  controller: LoadController | Controller<any, any>,
  location?: HistoryLocation,
  context?: Context
): ControllerConstructor | Promise<ControllerConstructor> {
  let ctrl = null
  if (isIMVCController(controller) || isThenable(controller)) {
    ctrl = controller
  } else {
    ctrl = controller(location, context)
  }

  if (isThenable(ctrl)) {
    return (ctrl as Promise<ControllerConstructor>).then(getModule)
  } else {
    return getModule(ctrl)
  }
}

const getStreamBuffer = (stream: Stream) => {
  return new Promise<Buffer>((resolve, reject) => {
    let buffers = [] as Buffer[]
    stream.on('data', (chunk) => buffers.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
    stream.on('error', reject)
  })
}

const isStream = (stream: any): stream is Stream => {
  return !!stream && typeof stream.pipe === 'function'
}

/**
 * controller 里会劫持 React.createElement
 * server side 场景缺乏恢复机制
 * 因此在这里特殊处理，在渲染完后，恢复 React.createElement
 */
const createElement = React.createElement

function renderToNodeStream(
  view: React.ReactElement | string | undefined | null,
  controller?: Controller<any, any>
): Promise<ArrayBuffer> {
  if (typeof view === 'string') {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      resolve(Buffer.from(stringToUnit8Array(view)))
    })
  }
  if (view === void 0 || view === null) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      resolve(Buffer.from(stringToUnit8Array('')))
    })
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    let stream = ReactDOMServer.renderToNodeStream(view)
    let buffers: Uint8Array[] = []
    stream.on('data', (chunk) => buffers.push(chunk))
    stream.on('end', () => {
      React.createElement = createElement
      resolve(Buffer.concat(buffers))
    })
    stream.on('error', (error) => {
      if (!controller) {
        React.createElement = createElement
        return reject(error)
      }

      if (controller.errorDidCatch) {
        controller.errorDidCatch(error, 'view')
      }

      if (controller.getViewFallback) {
        let fallbackView = controller.getViewFallback('view')
        renderToNodeStream(fallbackView).then(resolve, reject)
      } else {
        React.createElement = createElement
        reject(error)
      }
    })
  })
}

function renderToString(
  view: React.ReactElement | string | undefined | null,
  controller?: Controller<any, any>
): string {
  if (typeof view === 'string') {
    return view
  }
  if (view === void 0 || view === null) {
    return ''
  }

  try {
    return ReactDOMServer.renderToString(view)
  } catch (error) {
    if (!controller) throw error

    if (controller.errorDidCatch) {
      controller.errorDidCatch(error as Error, 'view')
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

const renderers = {
  renderToNodeStream,
  renderToString,
}

function getRightPath(filePath: string): string {
  const extensions = ['js', 'jsx', 'ts', 'tsx']
  let finalFilePath: string = filePath
  let clearFilePath = getClearFilePath(filePath, extensions)

  extensions.some((ets) => {
    if (fs.existsSync(`${clearFilePath}.${ets}`)) {
      finalFilePath = `${clearFilePath}.${ets}`
      return true
    }
    return false
  })

  return finalFilePath
}

export default async function createPageRouter(
  options: EntireConfig
): Promise<Router> {
  let config = Object.assign({}, options)
  let routes: Route[] = []

  if (!config.webpackDevMiddleware) {
    routes = require(path.join(config.root, config.serverBundleName))
  }

  if (!Array.isArray(routes)) {
    routes = Object.values(routes)
  }
  routes = getFlatList(routes)

  let router = Router()
  let render: ViewEngineRender<
    React.ReactElement,
    Controller<any, any>
  > = renderers[config.renderMode] || renderToNodeStream

  let serverAppSettings: AppSettings = {
    loader: commonjsLoader,
    routes: routes,
    viewEngine: {
      // @ts-ignore
      render: (view, controller) => {
        if (config.serverRenderer) {
          const result = config.serverRenderer(view, controller)
          if (Buffer.isBuffer(result)) {
            return result.toString()
          } else if (isStream(result)) {
            return getStreamBuffer(result).then((buffer) => buffer.toString())
          } else {
            return result
          }
        }
        return render(view, controller as any)
      },
    },
    context: {
      isClient: false,
      isServer: true,
    },
  }
  let app = createApp(serverAppSettings)
  let layoutView = config.layout
    ? process.env.NODE_ENV !== 'production'
      ? getRightPath(path.resolve(config.root, config.routes, config.layout))
      : path.resolve(config.root, config.routes, config.layout)
    : path.join(__dirname, 'view')

  // 纯浏览器端渲染模式，用前置中间件拦截所有请求
  if (config.SSR === false) {
    router.all('*', (req, res) => {
      res.render(layoutView)
    })
  } else if (config.webpackDevMiddleware) {
    // 带服务端渲染模式的开发环境，需要动态编译 src/routes
    let setupDevEnv = await import('../build/setupDevEnv')
    let handleRoutes = ($routes: any[] | object | undefined | null) => {
      if (!$routes) {
        return
      }
      const routes = getFlatList(
        Array.isArray($routes) ? $routes : Object.values($routes)
      )
      app = createApp({
        ...serverAppSettings,
        routes,
      })
    }

    let $routes = await setupDevEnv.setupServer(config, {
      handleHotModule: handleRoutes,
    })

    handleRoutes($routes as any)
  }

  // handle page
  router.all('*', async (req: Req, res, next) => {
    let { basename, serverPublicPath, publicPath } = req
    let context = {
      basename,
      serverPublicPath,
      publicPath,
      staticPath: config.staticPath,
      restapi: config.serverRestapi || config.restapi || '',
      ...config.context,
      preload: {},
      isServer: true,
      isClient: false,
      req,
      res,
      assets: res.locals.assets,
    }

    try {
      let result = await app.render(req.url, context)
      let content = result.content
      let controller = result.controller as Controller<{}, {}>
      /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
      if (!content) {
        return
      }

      // content 可能是异步渲染的
      content = await content

      let initialState = controller.store ? controller.store.getState() : void 0
      let htmlConfigs = initialState ? initialState.html : void 0
      let data = {
        ...htmlConfigs,
        content,
        initialState,
      }

      if (controller.destroy) {
        controller.destroy()
      }

      // 支持通过 res.locals.layoutView 动态确定 layoutView
      const finalLayoutPath = res.locals.layoutView
        ? getRightPath(
            path.resolve(config.root, config.routes, res.locals.layoutView)
          )
        : layoutView

      const LayoutView = getModule(require(finalLayoutPath))

      const html = ReactDOMServer.renderToStaticMarkup(
        <LayoutView {...res.locals} {...data} />
      )

      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/html;charset=utf-8')
      }

      res.end(`<!DOCTYPE html>${html}`)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(error)
      }

      next(error)
    }
  })

  return router
}
