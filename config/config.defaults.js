var path = require('path')

var cwd = process.cwd()
var port = process.env.PORT || 3000
var NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
	// 根目录
	root: cwd,
	// 源码目录
	src: 'src',
	// 源码构建后的目录名
	publish: 'publish',
	// 源码里的静态资源构建后的目录名，该目录会出现在 publish 字段配置的目录下
	static: 'static',
	// node.js 静态资源服务的路径
	publicPath: '/static',
	// webpack 资源表所在的路径，相对于 webpack 的 output.path
	statsPath: '../stats.json',
	// webpack output 配置
	output: {},
	// webpack entry 配置
	entry: {},
	// webpack 生产环境构建时的 output 配置
	productionOutput: {},
	// webpack alias 配置
	alias: {},
	// 是否开启代码切割
	codeSpliting: NODE_ENV === 'production',
	// 是否对 webpack 的构建产物进行可视化分析
	bundleAnalyzer: false,
	// 是否使用 webpack-dev-middleware
	webpackDevMiddleware: NODE_ENV === 'development',
	// webpack commentsChunkPlugin 的 chilren 配置
	CommonsChunkChildren: {
		children: true,
	},
	// webpack 插件配置
	webpackPlugins: [],

	// node.js 应用部署的 basename
	basename: '',
	// express 中间件 helmet 配置
	helmet: {
		frameguard: false,
	},
	// express 中间件 compression 配置
	compression: {},
	// express-react-views 配置
	ReactViews: {
		beautify: NODE_ENV === 'development',
		transformViews: false
	},
	// express 中间件 bodyParse 配置
	bodyParser: {
		json: {
			limit: '10MB'
		},
		urlencoded: {
			extended: false
		}
	},
	// express routes 所在的路径
	routesPath: 'routes',
	// express logger 的命名空间
	logger: NODE_ENV === 'development' ? 'dev' : null,
	// express favicon 中间件的配置
	favicon: '',
	// 是否开启 IMVC SSR 功能，默认开启
	SSR: true,
	// node.js server 监听的端口号
	port: port,
	// node.js 的环境变量
	NODE_ENV: NODE_ENV,

	// IMVC 的 layout 组件所在的路径
	layout: '',
	// React SSR 时采用的渲染模式：renderToString || renderToStaticMarkup
	renderMode: 'renderToString',
	// IMVC APP 里的 context 参数
	context: {},
}