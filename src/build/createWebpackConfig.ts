import webpack from 'webpack'
import path from 'path'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ManifestPlugin from 'webpack-manifest-plugin'
import TerserPlugin from 'terser-webpack-plugin'
// @ts-ignore
import PnpWebpackPlugin from 'pnp-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import resolve from 'resolve'
import { getExternals } from './util'
import { Config } from '..'

export default function createWebpackConfig(
	options: Config,
	isServer: boolean = false
): webpack.Configuration {
	let result: webpack.Configuration = {}
	let config: Config = Object.assign({}, options)
	let root: string = path.join(config.root, config.src)
	let alias = Object.assign({}, config.alias, {
		'@routes': root
	})
	let indexEntry = isServer ? root : path.join(__dirname, '../entry/client')
	let NODE_ENV = config.NODE_ENV
	let isProd = NODE_ENV === 'production'
	let mode = NODE_ENV === 'test' ? 'development' : NODE_ENV || 'production'
	let entry = Object.assign({}, config.entry, {
		index: [!!config.hot && !isServer && 'webpack-hot-middleware/client', indexEntry].filter(
			Boolean
		)
	})
	let devtoolModuleFilenameTemplate = (info: webpack.DevtoolModuleFilenameTemplateInfo) =>
		path.relative(root, info.absoluteResourcePath).replace(/\\/g, '/')

	let defaultOutput: webpack.Output = {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: !isProd,
		// Point sourcemap entries to original disk location (format as URL on Windows)
		devtoolModuleFilenameTemplate,
		// Link the env to dom
		globalObject: 'this'
	}

	if (isServer) {
		defaultOutput = {
			...defaultOutput,
			libraryTarget: 'commonjs2',
			path: path.join(config.root, config.publish),
			filename: config.serverBundleName,
		}
	} else {
		defaultOutput = {
			...defaultOutput,
			path: path.join(config.root, config.publish, config.static),
			filename: `js/[name].js`,
			chunkFilename: `js/[name].js`,
		}
	}

	let output = Object.assign(defaultOutput, config.output)

	function ManifestPluginMap(
		file: ManifestPlugin.FileDescriptor
	): ManifestPlugin.FileDescriptor {
		// 删除 .js 后缀，方便直接使用 obj.name 来访问
		if (file.name && /\.js$/.test(file.name)) {
			file.name = file.name.slice(0, -3)
		}
		return file
	}
	let ManifestPluginOption: ManifestPlugin.Options = {
		fileName: config.assetsPath,
		map: ManifestPluginMap
	}
	let plugins = [
		!isServer && new ManifestPlugin(ManifestPluginOption),
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		!isServer && new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/ ),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
		}),

		// TypeScript type checking
		config.useTypeCheck && new ForkTsCheckerWebpackPlugin({
			typescript: resolve.sync('typescript', {
				basedir: path.join(config.root, 'node_modules'),
			}),
			async: !isProd,
			useTypescriptIncrementalApi: true,
			checkSyntacticErrors: true,
			tsconfig: path.join(config.root, 'tsconfig.json'),
			reportFiles: [
				'**',
				'!**/*.json',
				'!**/__tests__/**',
				'!**/?(*.)(spec|test).*',
				'!**/src/setupProxy.*',
				'!**/src/setupTests.*',
			],
			watch: config.root
		})
	].filter(Boolean)

	// 添加热更新插件
	if (!isServer && config.hot) {
		plugins.push(new webpack.HotModuleReplacementPlugin())
	}

	if (Array.isArray(config.webpackPlugins)) {
		plugins = plugins.concat(config.webpackPlugins)
	}

	let watch = NODE_ENV !== 'test'
	let postLoaders: webpack.Rule[] = []
	let optimization: webpack.Options.Optimization = {
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
			defaultOutput,
			!isServer && {
				filename: 'js/[name]-[contenthash:6].js',
				chunkFilename: 'js/[name]-[contenthash:6].js',
				devtoolModuleFilenameTemplate
			},
			config.productionOutput
		)
		watch = false
		if (!isServer) {
			optimization = Object.assign(optimization, {
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
								// ecma: 5, // 默认为5，但目前ts似乎不支持该参数
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
		} else {
			optimization = {
				minimize: false
			}
		}
	}

	if (!isServer && config.bundleAnalyzer) {
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

	const babelOptions: webpack.RuleSetQuery = {
		// include presets|plugins
		babelrc: false,
		configFile: false,
		cacheDirectory: true,
		...config.babel(isServer),
		// Save disk space when time isn't as important
		cacheCompression: isProd,
		compact: isProd
	}
	let moduleRulesConfig: webpack.Rule[] = [
		// Disable require.ensure as it's not a standard language feature.
		{ parser: { requireEnsure: false } },
		// Process application JS with Babel.
		// The preset includes JSX, Flow, TypeScript and some ESnext features.
		{
			test: /\.(js|mjs|jsx|ts|tsx)$/,
			exclude: '/node_modules/',
			loader: 'babel-loader',
			options: babelOptions
		}
	]
	moduleRulesConfig = moduleRulesConfig.concat(config.webpackLoaders, postLoaders)
	const moduleConfig: webpack.Module = {
		// makes missing exports an error instead of warning
		strictExportPresence: true,
		rules: moduleRulesConfig
	}
	const performanceConfig = {
		hints: false,
		maxEntrypointSize: 400000,
		...config.performance
	}
	const resolveConfig = {
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
	}
	const resolveLoaderConfig: webpack.ResolveLoader = {
		plugins: [
			// Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
			// from the current package.
			PnpWebpackPlugin.moduleLoader(module)
		]
	}
	result = Object.assign(result, {
		target: isServer ? 'node' : 'web',
		mode: mode,
		// Don't attempt to continue if there are any errors.
		bail: true,
		watch: watch,
		devtool: isServer ? 'source-map' : config.devtool,
		entry: entry,
		output: output,
		module: moduleConfig,
		plugins: plugins,
		optimization,
		performance: performanceConfig,
		resolve: resolveConfig,
		context: root,
		resolveLoader: resolveLoaderConfig,
		externals: isServer ? getExternals(config) : undefined
	})

	return config.webpack ? config.webpack(result, isServer) : result
}
