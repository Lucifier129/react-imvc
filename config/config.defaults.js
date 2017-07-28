var path = require('path')

var cwd = process.cwd()
var port = process.env.PORT || 3000
var NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
	// build
	root: cwd,
	src: 'src',
	publish: 'publish',
	static: 'static',
	statsPath: '../stats.json',
	output: {},
	entry: {},
	productionOutput: {},
	alias: {},
	codeSpliting: false,
	bundleAnalyzer: false,
	webpackDevMiddleware: true,

	// server
	basename: '',
	helmet: {},
	compression: {},
	ReactViews: {
		beautify: NODE_ENV === 'development',
		transformViews: false
	},
	bodyParser: {
		json: {
			limit: '10MB'
		},
		urlencoded: {
			extended: false
		}
	},
	routesPath: 'routes',
	logger: 'dev',
	favicon: '',
	SSR: true,
	port: port,
	NODE_ENV: NODE_ENV,

	clientContext: {},
	serverContext: {},
}