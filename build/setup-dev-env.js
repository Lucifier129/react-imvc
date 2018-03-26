var path = require('path')
var vm = require('vm')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var MFS = require('memory-fs')
var notifier = require('node-notifier')
var createWebpackClientConfig = require('./createWebpackClientConfig')
var createWebpackServerConfig = require('./createWebpackServerConfig')

exports.setupClient = function setupClient(config) {
	var clientConfig = createWebpackClientConfig(config)
	var clientDevMiddleware = webpackDevMiddleware(webpack(clientConfig), {
		publicPath: config.staticPath,
		stats: config.webpackLogger,
		serverSideRender: true,
		reporter: (options) => {
			reporter(options)
			if (config.notifier) {
				notifier.notify({
					title: 'React-IMVC',
					message: 'Webpack 编译结束'
				})
			}
		}
	})
	return clientDevMiddleware
}

exports.setupServer = function setupServer(config, options) {
	var serverConfig = createWebpackServerConfig(config)
	var serverCompiler = webpack(serverConfig)
	var mfs = new MFS()
	var outputPath = path.join(serverConfig.output.path, serverConfig.output.filename)
	serverCompiler.outputFileSystem = mfs
	serverCompiler.watch({}, (err, stats) => {
		if (err) throw err
		stats = stats.toJson()
		stats.errors.forEach(err => console.error(err))
		stats.warnings.forEach(err => console.warn(err))
		var sourceCode = mfs.readFileSync(outputPath, 'utf-8')

		// 构造一个 commonjs 的模块加载函数，拿到 newModule
		var newModule = vm.runInThisContext(
			`
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
		`
		)(require)

		if (newModule) {
			options.handleHotModule(newModule.default || newModule)
		}
	})
}

function reporter(reporterOptions) {
	var time = ''
	var state = reporterOptions.state
	var stats = reporterOptions.stats
	var options = reporterOptions.options

	if (!!options.reportTime) {
		time = '[' + timestamp('HH:mm:ss') + '] '
	}
	if (state) {
		var displayStats = !options.quiet && options.stats !== false
		if (displayStats && !(stats.hasErrors() || stats.hasWarnings()) && options.noInfo) displayStats = false
		if (displayStats) {
			if (stats.hasErrors()) {
				options.error(stats.toString(options.stats))
			} else if (stats.hasWarnings()) {
				options.warn(stats.toString(options.stats))
			} else {
				options.log(stats.toString(options.stats))
			}
		}
		if (!options.noInfo && !options.quiet) {
			var msg = 'Compiled successfully.'
			if (stats.hasErrors()) {
				msg = 'Failed to compile.'
			} else if (stats.hasWarnings()) {
				msg = 'Compiled with warnings.'
			}
			options.log(time + 'webpack: ' + msg)
		}
	} else {
		options.log(time + 'webpack: Compiling...')
	}
}
