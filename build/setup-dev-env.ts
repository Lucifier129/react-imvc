import path from 'path'
import vm from 'vm'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import MFS from 'memory-fs'
import notifier from 'node-notifier'
import createWebpackConfig from './createWebpackConfig'
import { getExternals, matchExternals } from './util'
import { Config } from '../config'

export const setupClient: (config: Config) => {
	compiler: webpack.Compiler,
	middleware: webpackDevMiddleware.WebpackDevMiddleware 
} = (config: Config) => {
	let clientConfig: webpack.Configuration = createWebpackConfig(config)
	let compiler: webpack.Compiler = webpack(clientConfig)
	let middleware: webpackDevMiddleware.WebpackDevMiddleware = webpackDevMiddleware(compiler, {
		publicPath: <string>config.staticPath,
		stats: config.webpackLogger,
		serverSideRender: true,
		reporter: (middlewareOptions: webpackDevMiddleware.Options, options: webpackDevMiddleware.ReporterOptions) => {
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

interface SetupServerOptions {
	handleHotModule: (value: any) => void
}

export const setupServer: (config: Config, options: SetupServerOptions) => void = (config, options) => {
	let serverConfig: webpack.Configuration = createWebpackConfig(config, true)
	serverConfig.target = 'node'
	serverConfig.entry = {
		routes: path.join(<string>config.root, <string>config.src)
	}
	if (!serverConfig.output) {
		serverConfig.output = {
			filename: 'routes.js',
			libraryTarget: 'commonjs2'
		}
	} else {
		serverConfig.output.filename = 'routes.js'
		serverConfig.output.libraryTarget = 'commonjs2'
	}
	let externals: string[] = (serverConfig.externals = getExternals(config))
	delete serverConfig.optimization
	let serverCompiler: webpack.Compiler = webpack(serverConfig)
	let mfs: MFS = new MFS()
	let outputPath: string = path.join(
		<string>serverConfig.output.path,
		<string>serverConfig.output.filename
	)
	serverCompiler.outputFileSystem = mfs
	serverCompiler.watch({}, (err, stats) => {
		if (err) throw err
		let currentStats = stats.toJson()
		currentStats.errors.forEach(err => console.error(err))
		currentStats.warnings.forEach(err => console.warn(err))
		let sourceCode: string = mfs.readFileSync(outputPath, 'utf-8')
		let defaultModuleResult: Symbol = Symbol('default-module-result')
		let virtualRequire: (modulePath: string) => Symbol = modulePath => {
			if (matchExternals(externals, modulePath)) {
				return require(modulePath)
			}
			let filePath: string = modulePath
			if (serverConfig.output !== undefined && typeof serverConfig.output.path === 'string') {
				filePath = path.join(<string>serverConfig.output.path, modulePath)
			}
			let sourceCode: string = ''
			let moduleResult: Symbol = defaultModuleResult

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

			if (moduleResult === defaultModuleResult) {
				throw new Error(`${modulePath} not found in server webpack compiler`)
			}

			return moduleResult
		}
		let runCode = (sourceCode: string) => {
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

export const reporter: (
	middlewareOptions: webpackDevMiddleware.Options,
	options: webpackDevMiddleware.ReporterOptions
) => void = (middlewareOptions, options) => {
	const { log, state, stats } = options

	if (state && stats !== undefined) {
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
