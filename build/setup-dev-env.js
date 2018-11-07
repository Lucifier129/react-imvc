const path = require('path')
const vm = require('vm')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const MFS = require('memory-fs')
const notifier = require('node-notifier')
const createWebpackConfig = require('./createWebpackConfig')

exports.setupClient = function setupClient(config) {
	let clientConfig = createWebpackConfig(config)
	let compiler = webpack(clientConfig)
	let middleware = webpackDevMiddleware(compiler, {
		publicPath: config.staticPath,
		stats: config.webpackLogger,
		serverSideRender: true,
		reporter: (middlewareOptions, options) => {
			reporter(middlewareOptions, options)
			if (config.notifier) {
				notifier.notify({
					title: 'React-IMVC',
					message: 'Webpack 编译结束'
				})
			}
		}
	})
	return {
		middleware,
		compiler
	}
}

exports.setupServer = function setupServer(config, options) {
	let serverConfig = createWebpackConfig(config)
	serverConfig.target = 'node'
	serverConfig.entry = {
		routes: path.join(config.root, config.src)
	}
	let externals = (serverConfig.externals = getExternals(config))
	serverConfig.output.filename = 'routes.js'
	serverConfig.output.libraryTarget = 'commonjs2'
	delete serverConfig.optimization
	let serverCompiler = webpack(serverConfig)
	let mfs = new MFS()
	let outputPath = path.join(
		serverConfig.output.path,
		serverConfig.output.filename
	)
	serverCompiler.outputFileSystem = mfs
	serverCompiler.watch({}, (err, stats) => {
		if (err) throw err
		stats = stats.toJson()
		stats.errors.forEach(err => console.error(err))
		stats.warnings.forEach(err => console.warn(err))
		let sourceCode = mfs.readFileSync(outputPath, 'utf-8')
		let defaultModuleResult = Symbol('default-module-result')
		let virtualRequire = modulePath => {
			if (matchExternals(externals, modulePath)) {
				return require(modulePath)
			}

			let filePath = path.join(serverConfig.output.path, modulePath)
			let sourceCode = ''
			let moduleResult = defaultModuleResult

			try {
				sourceCode = mfs.readFileSync(filePath, 'utf-8')
			} catch (_) {
				/**
				 * externals 和 mfs 里没有这个文件
				 * 它可能是 node.js 原生模块
				 */
				moduleResult = require(modulePath)
			}

			if (sourceCode) {
				moduleResult = runCode(sourceCode)
			}

			if (moduleResult === defaultResult) {
				throw new Error(`${modulePath} not found in server webpack compiler`)
			}

			return moduleResult
		}
		let runCode = sourceCode => {
			return vm.runInThisContext(`
				(function(require) {
					var module = {exports: {}}
									var factory = function(require, module, exports) {
											${sourceCode}
									}
									try {
											factory(require, module, module.exports)
									} catch(error) {
											console.log(error)
											return null
									}
									return module.exports
				})
			`)(virtualRequire)
		}

		// 构造一个 commonjs 的模块加载函数，拿到 newModule
		let newModule = runCode(sourceCode)

		if (newModule) {
			options.handleHotModule(newModule.default || newModule)
		}
	})
}

function reporter(middlewareOptions, options) {
	const { log, state, stats } = options

	if (state) {
		const displayStats = middlewareOptions.stats !== false

		if (displayStats) {
			if (stats.hasErrors()) {
				log.error(stats.toString(middlewareOptions.stats))
			} else if (stats.hasWarnings()) {
				log.warn(stats.toString(middlewareOptions.stats))
			} else {
				log.info(stats.toString(middlewareOptions.stats))
			}
		}

		let message = 'Compiled successfully.'

		if (stats.hasErrors()) {
			message = 'Failed to compile.'
		} else if (stats.hasWarnings()) {
			message = 'Compiled with warnings.'
		}
		log.info(message)
	} else {
		log.info('Compiling...')
	}
}

function getExternals(config) {
	var dependencies = []

	var list = [
		path.resolve('package.json'),
		path.join(__dirname, '../package.json'),
		path.join(config.root, '../package.json')
	]

	while (list.length) {
		var item = list.shift()
		try {
			var pkg = require(item)
			if (pkg.dependencies) {
				dependencies = dependencies.concat(Object.keys(pkg.dependencies))
			}
			if (pkg.devDependencies) {
				dependencies = dependencies.concat(Object.keys(pkg.devDependencies))
			}
		} catch (error) {
			// ignore error
		}
	}

	var map = {}
	dependencies = dependencies.filter(name => {
		if (map[name]) {
			return false
		}
		map[name] = true
		return true
	})

	return dependencies
}

function matchExternals(externals, modulePath) {
	for (let i = 0; i < externals.length; i++) {
		if (modulePath.startsWith(externals[i])) {
			return true
		}
	}
	return false
}
