const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin
const ManifestPlugin = require('webpack-manifest-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const PnpWebpackPlugin = require('pnp-webpack-plugin')

module.exports = function createWebpackConfig(options) {
	let result = {}
	let config = Object.assign({}, options)
	let alias = Object.assign({}, config.alias, {
		'@routes': path.join(config.root, config.src)
	})
	let indexEntry = path.join(__dirname, '../entry/client')
	let root = path.join(config.root, config.src)
	let NODE_ENV = config.NODE_ENV
	let isProd = NODE_ENV === 'production'

	let mode = NODE_ENV === 'test' ? 'development' : NODE_ENV || 'production'
	let entry = Object.assign({}, config.entry, {
		index: [!!config.hot && 'webpack-hot-middleware/client', indexEntry].filter(
			Boolean
		)
	})

	let defaultOutput = {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: !isProd,
		path: path.join(config.root, config.publish, config.static),
		filename: `js/[name].js`,
		chunkFilename: `js/[name].js`,
		// Point sourcemap entries to original disk location (format as URL on Windows)
		devtoolModuleFilenameTemplate: info =>
			path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
	}

	let output = Object.assign(defaultOutput, config.output)

	let plugins = [
		new ManifestPlugin({
			fileName: config.assetsPath,
			map: file => {
				// 删除 .js 后缀，方便直接使用 obj.name 来访问
				if (/\.js$/.test(file.name)) {
					file.name = file.name.slice(0, -3)
				}
				return file
			}
		}),
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
		})
	]

	// 添加热更新插件
	if (config.hot) {
		plugins.push(new webpack.HotModuleReplacementPlugin())
	}

	if (Array.isArray(config.webpackPlugins)) {
		plugins = plugins.concat(config.webpackPlugins)
	}

	let watch = NODE_ENV !== 'test'
	let postLoaders = []
	let optimization = {
		// Automatically split vendor and commons
		// https://twitter.com/wSokra/status/969633336732905474
		// https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
		splitChunks: {
			chunks: 'all',
			name: 'vendor'
		}
	}

	if (isProd) {
		output = Object.assign(
			{},
			defaultOutput,
			{
				filename: 'js/[name]-[contenthash:6].js',
				chunkFilename: 'js/[name]-[contenthash:6].js',
				devtoolModuleFilenameTemplate: info =>
					path.relative(root, info.absoluteResourcePath).replace(/\\/g, '/')
			},
			config.productionOutput
		)
		watch = false
		optimization = Object.assign({}, optimization, {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						parse: {
							// we want terser to parse ecma 8 code. However, we don't want it
							// to apply any minfication steps that turns valid ecma 5 code
							// into invalid ecma 5 code. This is why the 'compress' and 'output'
							// sections only apply transformations that are ecma 5 safe
							// https://github.com/facebook/create-react-app/pull/4234
							ecma: 8
						},
						compress: {
							ecma: 5,
							drop_console: true,
							warnings: false,
							// Disabled because of an issue with Uglify breaking seemingly valid code:
							// https://github.com/facebook/create-react-app/issues/2376
							// Pending further investigation:
							// https://github.com/mishoo/UglifyJS2/issues/2011
							comparisons: false,
							// Disabled because of an issue with Terser breaking valid code:
							// https://github.com/facebook/create-react-app/issues/5250
							// Pending futher investigation:
							// https://github.com/terser-js/terser/issues/120
							inline: 2
						},
						mangle: {
							safari10: true
						},
						output: {
							ecma: 5,
							comments: false,
							// Turned on because emoji and regex is not minified properly using default
							// https://github.com/facebook/create-react-app/issues/2488
							ascii_only: true
						}
					},
					// Use multi-process parallel running to improve the build speed
					// Default number of concurrent runs: os.cpus().length - 1
					parallel: true,
					// Enable file caching
					cache: true,
					sourceMap: false
				})
			]
		})
	}

	if (config.bundleAnalyzer) {
		plugins = plugins.concat([
			new BundleAnalyzerPlugin(
				Object.assign(
					{
						// Automatically open analyzer page in default browser
						openAnalyzer: true,
						// Analyzer HTTP-server port
						analyzerPort: 8090
					},
					config.bundleAnalyzer
				)
			)
		])
	}

	const babelOptions = {
		// include presets|plugins
		babelrc: false,
		configFile: false,
		cacheDirectory: true,
		...config.babel(false),
		// Save disk space when time isn't as important
		cacheCompression: isProd,
		compact: isProd
	}

	result = Object.assign(result, {
		mode: mode,
		// Don't attempt to continue if there are any errors.
		bail: true,
		watch: watch,
		devtool: config.devtool,
		entry: entry,
		output: output,
		module: {
			// makes missing exports an error instead of warning
			strictExportPresence: true,
			rules: [
				// Disable require.ensure as it's not a standard language feature.
				{ parser: { requireEnsure: false } },
				// Process application JS with Babel.
				// The preset includes JSX, Flow, TypeScript and some ESnext features.
				{
					test: /\.(js|mjs|jsx|ts|tsx)$/,
					exclude: /(node_modules|bower_components)/,
					loader: 'babel-loader',
					options: babelOptions
				}
			].concat(config.webpackLoaders, postLoaders)
		},
		plugins: plugins,
		optimization,
		performance: {
			hints: false,
			maxEntrypointSize: 400000,
			...config.performance
		},
		resolve: {
			modules: [
				path.resolve('node_modules'),
				path.join(config.root, 'node_modules'),
				path.join(__dirname, '../node_modules')
			],
			extensions: ['.js', '.jsx', '.json', '.mjs', '.ts', '.tsx'],
			alias: alias,
			plugins: [
				// Adds support for installing with Plug'n'Play, leading to faster installs and adding
				// guards against forgotten dependencies and such.
				PnpWebpackPlugin
			]
		},
		context: root,
		resolveLoader: {
			plugins: [
				// Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
				// from the current package.
				PnpWebpackPlugin.moduleLoader(module)
			]
		}
	})

	return config.webpack ? config.webpack(result) : result
}
