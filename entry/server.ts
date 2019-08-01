import fs from 'fs'
import express from 'express'
import compression from 'compression'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import helmet from 'helmet'
// @ts-ignore
import ReactViews from 'express-react-views'
import shareRoot from '../middleware/shareRoot'
import { Req } from '../types'
import { Config } from '../config'

export default function createExpressApp(config: Config) {
	const app: express.Express = express()

	// handle basename
	let list = Array.isArray(config.basename)
		? config.basename
		: [config.basename || '']
	list.forEach((basename: string) => {
		app.use(shareRoot(basename))
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
	app.engine('js', ReactViews.createEngine(config.ReactViews))

	// view engine setup
	app.set('views', path.join(<string>config.root, <string>config.routes))
	app.set('view engine', 'js')

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
			app.use(bodyParser.urlencoded(config.bodyParser.urlencoded))
		}
	}

	// handle cookieParser
	if (config.cookieParser) {
		app.use(cookieParser('', config.cookieParser))
	}

	app.use('/mock', (req, res, next) => {
		let filePath = path.join(<string>config.root, <string>config.src, `${req.path}.json`)
		res.type('application/json')
		fs.createReadStream(filePath).pipe(res)
	})

	app.get('/slbhealthcheck.html', (req, res) => {
		res.send('slbhealthcheck ok')
	})

	if (config.webpackDevMiddleware) {
		// 开发模式用 webpack-dev-middleware 代理 js 文件
		let setupDevEnv = require('../build/setup-dev-env')
		let { compiler, middleware } = setupDevEnv.setupClient(config)
		app.use(middleware)

		// 添加热更新中间件
		if (config.hot) {
			let webpackHotMiddleware = require('webpack-hot-middleware')
			app.use(
				webpackHotMiddleware(compiler, {
					quiet: true,
					noInfo: true,
					log: false,
				})
			)
		}

		// 开发模式里，用 src 里的静态资源
		app.use(
			<string>config.staticPath,
			express.static(path.join(<string>config.root, <string>config.src))
		)

		// 开发模式用 webpack-dev-middleware 获取 assets
		app.use((req, res, next) => {
			res.locals.assets = getAssets(
				res.locals.webpackStats.toJson().assetsByChunkName
			)
			next()
		})
	} else {
		// publish 目录启动
		app.use(
			<string>config.staticPath,
			express.static(
				path.join(<string>config.root, <string>config.static),
				config.staticOptions
			)
		)

		// 在根目录启动
		app.use(
			<string>config.staticPath,
			express.static(
				path.join(<string>config.root, <string>config.publish, <string>config.static),
				config.staticOptions
			)
		)

		let assets = readAssets(config)
		app.use((req, res, next) => {
			res.locals.assets = assets
			next()
		})
	}

	// handle publicPath and default props
	app.use((req: Req, res, next) => {
		let basename = req.basename // from shareRoot
		let serverPublicPath = basename + <string>config.staticPath
		let publicPath = config.publicPath || serverPublicPath
		let defaultProps = {
			...config,
			basename,
			publicPath,
			serverPublicPath
		}
		Object.assign(res.locals, defaultProps)
		req.serverPublicPath = serverPublicPath
		req.publicPath = publicPath
		next()
	})

	// attach appSettings for client
	app.use((req: Req, res, next) => {
		let { basename, publicPath } = req
		let context = {
			basename,
			publicPath,
			restapi: config.restapi,
			...config.context,
			preload: {}
		}

		res.locals.appSettings = {
			type: 'createHistory',
			basename,
			context,
			...config.appSettings
		}

		next()
	})

	return app
}

function getAssets(stats: { [propName: string]: any }) {
	return Object.keys(stats).reduce((result: { [propName: string]: any }, assetName) => {
		let value = stats[assetName]
		result[assetName] = Array.isArray(value) ? value[0] : value
		return result
	}, {})
}

function readAssets(config: Config) {
	let result
	// 生产模式直接用编译好的资源表
	let assetsPathList = [
		// 在 publish 目录下启动
		path.join(<string>config.root, <string>config.static, <string>config.assetsPath),
		// 在项目根目录下启动
		path.join(<string>config.root, <string>config.publish, <string>config.static, <string>config.assetsPath)
	]

	while (assetsPathList.length) {
		try {
      let itemPath = assetsPathList.shift()
      if (itemPath) {
        result = require(itemPath)
      }
		} catch (error) {
			// ignore error
		}
	}

	if (!result) {
		throw new Error('找不到 webpack 资源表 assets.json')
	}

	return getAssets(result)
}
