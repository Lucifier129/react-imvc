import path from 'path'


let cwd = process.cwd()
let port = process.env.PORT || 3000
let NODE_ENV = process.env.NODE_ENV || 'development'
let isDev = NODE_ENV === 'development'
let isProd = NODE_ENV === 'production'

export default {
	// node.js 应用部署的 basename
	basename: '',
	// html title
	title: 'react-imvc',
	// html description
	description: 'An Isomorphic-MVC Framework',
	// html keywords
	keywords: 'react mvc isomorphic server-side-rendering',
	// ssr content
	content: '',
	// initialState
	initialState: undefined,
	// client app settings
	appSettings: undefined,
	// 根目录
	root: cwd,
	// 源码目录
	src: 'src',
	// 源码构建后的目录名
	publish: 'publish',
	// 源码里的静态资源构建后的目录名，该目录会出现在 publish 字段配置的目录下
	static: 'static',
	// node.js 静态资源服务的路径
	staticPath: '/static',
	// hash history 的 spa 入口文件
	staticEntry: 'index.html',
	// 静态资源的发布路径，默认为空，为空时运行时修改为 basename + staticPath
	publicPath: '',
	// 默认的 restapi basename
	restapi: '',
	// webpack 资源表所在的路径，相对于 webpack 的 output.path
	assetsPath: '../assets.json',
	// webpack output 配置
	output: {},
	// webpack entry 配置
	entry: {},
	// webpack 生产环境构建时的 output 配置
	productionOutput: {},
	// webpack alias 配置
	alias: {},
	// webpack devtool
	devtool: isDev ? '#source-map' : '',
	// 是否开启代码切割
	codeSpliting: isProd,
	// 是否对 webpack 的构建产物进行可视化分析
	bundleAnalyzer: false,
	// 是否使用 webpack-dev-middleware
	webpackDevMiddleware: isDev,
	// webpack commentsChunkPlugin 的 chilren 配置
	CommonsChunkChildren: {
		children: true,
	},
	// webpack 插件配置
	webpackPlugins: [],

	// cookie-parser options
	cookieParser: {},

	// express 中间件 helmet 配置
	helmet: {
		frameguard: false,
	},
	// express 中间件 compression 配置
	compression: {},
	// express-react-views 配置
	ReactViews: {
		beautify: isDev,
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
	routes: 'routes',
	// express logger 的命名空间
	logger: isDev ? 'dev' : null,
	// express favicon 中间件的配置
	favicon: '',
	// 是否开启 IMVC SSR 功能，默认开启
	SSR: true,
	// node.js server 监听的端口号
	port: port,
	// node.js 的环境变量
	NODE_ENV: NODE_ENV,

	// 是否用 fetch-ie8
	fetchIE8: true,

	// IMVC 的 layout 组件所在的路径
	layout: '',
	// React SSR 时采用的渲染模式：renderToString || renderToStaticMarkup
	renderMode: 'renderToString',
	// IMVC APP 里的 context 参数
	context: {},
}