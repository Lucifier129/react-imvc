import { Router } from 'express'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import createApp from 'create-app/lib/server'
import fs from 'fs'
import util from '../util'

const { getFlatList } = util
const getModule = (module) => module.default || module
const commonjsLoader = (loadModule, location, context) => {
    return loadModule(location, context).then(getModule)
}

/**
 * controller 里会劫持 React.createElement
 * server side 场景缺乏恢复机制
 * 因此在这里特殊处理，在渲染完后，恢复 React.createElement
 */
const createElement = React.createElement

const getStreamBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        let buffers = []
        stream.on('data', (chunk) => buffers.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(buffers)))
        stream.on('error', reject)
    })
}

const isStream = (stream) => {
    return stream && typeof stream.pipe === 'function'
}

const renderToNodeStream = (view, controller) => {
    return new Promise((resolve, reject) => {
        let stream = ReactDOMServer.renderToNodeStream(view)
        let buffers = []
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

const renderToString = (view, controller) => {
    try {
        return ReactDOMServer.renderToString(view)
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

const renderers = {
    renderToNodeStream,
    renderToString,
}

function getClearFilePath(filepath, extensions = ['js']) {
    function replacer(match, p1, p2, offset, str) {
        if (extensions.includes(p2)) {
            return p1
        } else {
            return str
        }
    }
    return filepath.replace(/^(.*)\.([a-zA-Z]{1,5})$/, replacer)
}

function getRightPath(filePath) {
    const extensions = ['js', 'jsx', 'ts', 'tsx']
    let finalFilePath = filePath
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

export default async function createPageRouter(options) {
    let config = Object.assign({}, options)
    let routes = []

    if (!config.webpackDevMiddleware) {
        routes = require(path.join(config.root, config.serverBundleName))
    }

    routes = routes.default || routes
    if (!Array.isArray(routes)) {
        routes = Object.values(routes)
    }
    routes = getFlatList(routes)

    let router = Router()
    let render = renderers[config.renderMode] || renderToNodeStream
    let serverAppSettings = {
        loader: commonjsLoader,
        routes: routes,
        viewEngine: {
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
                return render(view, controller)
            },
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
        let setupDevEnv = require('../build/setupDevEnv')
        let handleRoutes = ($routes) => {
            if (!$routes) {
                return
            }
            const routes = getFlatList(Array.isArray($routes) ? $routes : Object.values($routes))
            app = createApp({
                ...serverAppSettings,
                routes,
            })
        }

        let $routes = await setupDevEnv.setupServer(config, {
            handleHotModule: handleRoutes,
        })

        handleRoutes($routes)
    }

    // handle page
    router.all('*', async (req, res, next) => {
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
            let { content, controller } = await app.render(req.url, context)

            /**
             * 如果没有返回 content
             * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
             */
            if (!content) {
                return
            }

            // content 可能是异步渲染的
            content = await content

            let initialState = controller.store ? controller.store.getState() : undefined
            let htmlConfigs = initialState ? initialState.html : undefined
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
                ? getRightPath(path.resolve(config.root, config.routes, res.locals.layoutView))
                : layoutView

            const LayoutView = getModule(require(finalLayoutPath))

            const html = ReactDOMServer.renderToStaticMarkup(<LayoutView {...res.locals} {...data} />)

            if (!res.headersSent) {
                res.setHeader('Content-Type', 'text/html;charset=utf-8')
            }

            res.end(`<!DOCTYPE html>${html}`)
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error(error)
            }
            next(error)
        }
    })

    return router
}
