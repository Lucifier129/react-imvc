/**
 * node server start file
 */
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
}

require('core-js/stable')
require('regenerator-runtime/runtime')

let fs = require('fs').promises
let path = require('path')
let http = require('http')
let fetch = require('node-fetch')
let debug = require('debug')('app:server')
let createExpressApp = require('../entry/server')
let getConfig = require('../config')
let createPageRouter = require('../page/createPageRouter')

createExpressApp = createExpressApp.default || createExpressApp
getConfig = getConfig.default || getConfig
createPageRouter = createPageRouter.default || createPageRouter

const isExist = async (path) => {
    try {
        await fs.access(path)
        return true
    } catch (e) {
        return false
    }
}

const findUpClosestTwoPackages = async (startDir) => {
    let currentDir = startDir
    let packages = []

    while (true) {
        let packageFile = path.join(currentDir, 'package.json')
        if (await isExist(packageFile)) {
            packages.unshift({
                filename: packageFile,
                package: require(packageFile),
            })

            if (packages.length >= 2) {
                break
            }
        }

        let parentDir = path.dirname(currentDir)

        if (parentDir === currentDir) {
            break
        }

        currentDir = parentDir
    }

    return packages
}

const syncPackage = async () => {
    const mainFilename = path.normalize(require.main?.filename ?? '')

    if (!mainFilename) {
        return
    }

    const packages = await findUpClosestTwoPackages(path.dirname(mainFilename))

    if (packages.length < 2) {
        return
    }

    const [rootPackage, publishPackage] = packages

    const isPackageNameEqual = rootPackage.package.name === publishPackage.package.name
    const isPackageContentEqual = JSON.stringify(rootPackage.package) === JSON.stringify(publishPackage.package)

    if (!isPackageNameEqual || isPackageContentEqual) {
        return
    }

    console.error(`${publishPackage.filename}\nis not equal to\n${rootPackage.filename}\nSyncing...`)
    await fs.writeFile(publishPackage.filename, await fs.readFile(rootPackage.filename))
    console.error('Syncing done. Please restart the server to apply changes')
    process.exit(1)
}

module.exports = async function start(options) {
    let config = getConfig(options)

    /**
     * sync package.json in root dir and publish dir
     * if they are not equal when server starts not from script
     */
    if (config.syncPackage && options.fromScript !== true) {
        await syncPackage()
    }

    let [app, pageRouter] = await Promise.all([createExpressApp(config), createPageRouter(config)])
    let port = normalizePort(config.port)

    /**
     * make fetch works like in browser
     * when url starts with //, prepend protocol
     * when url starts with /, prepend protocol, host and port
     */
    global.fetch = (url, options) => {
        if (url.startsWith('//')) {
            url = 'http:' + url
        }
        if (url.startsWith('/')) {
            url = `http://localhost:${port}${url}`
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

    let server = http.createServer(app)

    // 添加 renderPage 方法，让自定义的 routes 里可以手动调用，走 IMVC 的渲染流程
    app.use((req, res, next) => {
        res.renderPage = pageRouter
        next()
    })

    let routePath = path.join(config.root, config.routes)

    const applyRoutes = async (routes) => {
        if (Array.isArray(routes)) {
            for (const route of routes) {
                await route(app, server)
            }

            return
        }

        for (const key in routes) {
            const route = routes[key]

            if (typeof route === 'function') {
                await route(app, server)
            } else if (Array.isArray(route)) {
                await applyRoutes(route)
            } else {
                throw new Error(`Route ${key} is not a valid middleware or array of middlewares`)
            }
        }
    }

    if (hasModuleFile(routePath)) {
        // get server routes
        let routes = require(routePath)

        await applyRoutes(routes)
    }

    app.use(pageRouter)

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        const err = new Error('Not Found')
        err.status = 404
        res.render('404', err)
    })

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500)
            res.send(err.stack)
        })
    } else {
        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            res.status(err.status || 500)
            res.send(err.message)
        })
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        let addr = server.address()
        let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
        debug('Listening on ' + bind)
        console.log('Listening on ' + bind)
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error
        }

        let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges')
                process.exit(1)
                break
            case 'EADDRINUSE':
                console.error(bind + ' is already in use')
                process.exit(1)
                break
            default:
                throw error
        }
    }

    return new Promise((resolve, reject) => {
        /**
         * Listen on provided port, on all network interfaces.
         */
        server.listen(port)
        server.on('error', onError)
        server.on('listening', onListening)
        server.on('error', reject)
        server.on('listening', () => resolve({ server, app }))
    })
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10)

    if (isNaN(port)) {
        // named pipe
        return val
    }

    if (port >= 0) {
        // port number
        return port
    }

    return false
}

function hasModuleFile(filename) {
    try {
        return !!require.resolve(filename)
    } catch (_) {
        return false
    }
}
