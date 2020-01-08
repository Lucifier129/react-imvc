const babel = require('./babel')

let cwd = process.cwd()
let port = process.env.PORT || 3000
let NODE_ENV = process.env.NODE_ENV || 'development'
let isDev = NODE_ENV === 'development'
let isProd = NODE_ENV === 'production'

module.exports = {
	/**
	 * node.js 应用部署的 basename，默认是空字符串
	 * 支持传入字符串 如，'/my/basename'
	 * 支持传入数组，当传入为数组时，在运行时动态确定所匹配的 basename
	 */
	basename: '',
	/**
	 * html 文档的 title
	 */
	title: 'react-imvc',
	/**
	 * html 文档的 description
	 */
	description: 'An Isomorphic-MVC Framework',
	/**
	 * html 文档的 keywords
	 */
	keywords: 'react mvc isomorphic server-side-rendering',
	/**
	 * 服务端渲染的 content，默认为空
	 */
	content: '',
	/**
	 * client app settings
	 * {
	 *   hashType: 'hashbang', hash history 显示的起点缀，默认是 !
	 *   container: '#root' // react 组件渲染的容器
	 * }
	 */
	appSettings: undefined,
	/**
	 * react-imvc app 所在的根目录
	 * 默认是 cwd
	 */
	root: cwd,
	/**
	 * page 源代码的目录
	 * 默认是 src
	 */
	src: 'src',
	/**
	 * server 源代码的目录
	 * 默认为空
	 * 注意：express view path 也将被设置成 config.routes
	 */
	routes: 'routes',
	/**
	 * 源码构建后的目录名（生产环境跑的代码目录）
	 * 默认是 publish
	 */
	publish: 'publish',
	/**
	 * 源码里的静态资源构建后的目录名，该目录会出现在 publish 字段配置的目录下
	 * 默认是 static，即静态资源会出现在 /publish/static 目录下
	 */
	static: 'static',
	/**
	 * node.js 静态资源服务的路径
	 * 默认是 /static
	 */
	staticPath: '/static',
	/**
	 * hash history 的 spa 入口文件名，它将出现在 /static 目录下
	 * 如果设置了 staticEntry，react-imvc 在 build 阶段，使用关闭 SSR 的模式启动一次 react-imvc app
	 * 并访问 /__CREATE_STATIC_ENTRY__ 路径，将它的 html 响应内容作为静态入口 html 文件内容生成。
	 */
	staticEntry: false && 'index.html',

	/**
	 * express.static(root, options) 的 options 参数
	 * http://expressjs.com/en/4x/api.html#express.static
	 */
	staticOptions: {},
	/**
	 * 静态资源的发布路径，默认为空，为空时运行时修改为 basename + staticPath
	 * 可以将 /publish/static 目录发布到 CDN，并将 CDN 地址配置成 publicPath
	 */
	publicPath: '',
	/**
	 * restapi basename
	 * 默认为空
	 * 如果配置了这个属性，controller.fetch 方法将为非绝对路径 url 参数，补上 restapi 作为前缀。
	 */
	restapi: '',
	/**
	 * webpack 资源表所在的路径，相对于 webpack 的 output.path
	 * react-imvc 默认使用 hash 作为静态资源 js 的文件名
	 * 所以它需要生成一份 assets.json 表，匹配 vendor, index 等文件的 mapping 关系
	 */
	assetsPath: '../assets.json',
	/**
	 * webpack output 自定义配置
	 * 默认为空
	 */
	output: {},
	/**
	 * webpack 生产环境构建时的自定义 output 配置
	 * 默认为空
	 */
	productionOutput: {},
	/**
	 * webpack alias 自定义配置
	 */
	alias: {},
	/**
	 * webpack devtool 配置
	 */
	devtool: isDev ? 'cheap-module-eval-source-map' : '',

	/**
	 * 是否开启 webpack 的构建产物进行可视化分析
	 * 默认不开启
	 */
	bundleAnalyzer: false,
	/**
	 * 是否使用 webpack-dev-middleware 代理静态资源
	 * 默认在开发模式时开启
	 */
	webpackDevMiddleware: isDev,

	/**
	 * webpack plugins 自定义配置
	 * 默认为空
	 */
	webpackPlugins: [],
	/**
	 * webpack loaders 自定义配置
	 * 默认为空
	 */
	webpackLoaders: [],

	/**
	 * 是否输出 webpack log 日志
	 */
	webpackLogger: {
		chunks: false, // Makes the build much quieter
		colors: true
	},

	// babel config
	babel: babel,

	gulp: {
		// 需要压缩到 static 目录的 css
		css: [],
		// 需要压缩到 static 目录的 html
		html: [],
		// 需要压缩到 static 目录的 js
		js: [],
		// 需要复制到 static 目录的非 html, css, js 文件
		copy: [],
		// 需要复制到 publish 目录的额外文件
		publishCopy: [],
		// 需要编译到 publish 目录的额外文件
		publishBabel: []
	},

	/**
	 * express 中间件 cookie-parser 的自定义配置
	 * 默认为空
	 */
	cookieParser: {},

	/**
	 * express 中间件 helmet 的自定义配置
	 * 默认为空 frameguard = true
	 */
	helmet: {
		frameguard: false,
		hsts: {
			// https://helmetjs.github.io/docs/hsts/
			// 关闭默认的 Strict-Transport-Security
			maxAge: 0
		}
	},

	/**
	 * express 中间件 compression 的自定义配置
	 * 默认为空
	 */
	compression: {},

	/**
	 * express view engine 的自定义配置
	 */
	ReactViews: {
		beautify: false, // 是否美化 html 响应内容
		transformViews: false // 默认不转换 view，已经有 babel 做处理
	},
	/**
	 * express 中间件 bodyParse 配置
	 */
	bodyParser: {
		json: {
			limit: '10MB'
		},
		urlencoded: {
			extended: false
		}
	},
	/**
	 * express logger 配置
	 * 默认在开发阶段使用 dev，生产阶段不使用
	 */
	logger: isDev ? 'dev' : null,
	/**
	 * express favicon 中间件的配置
	 * 默认没有 favicon
	 */
	favicon: '',
	/**
	 * 是否开启 IMVC SSR 功能
	 * 默认开启
	 */
	SSR: true,
	/**
	 * node.js server 监听的端口号
	 * 默认跟着 ENV 环境变量走，或者 3000
	 */
	port: port,
	/**
	 * node.js 的环境变量备份
	 */
	NODE_ENV: NODE_ENV,

	/**
	 * IMVC 的 layout 组件所在的路径
	 * 默认为空
	 * 当设置为相对路径时，基于 routes 配置的 path
	 */
	layout: '',
	/**
	 * React SSR 时采用的渲染模式：renderToString || renderToNodeStream
	 *
	 */
	renderMode: 'renderToNodeStream',
	/**
	 * IMVC APP 里的 context 参数
	 * server 端和 client 端都会接收到 config.context 里的配置
	 * 默认为空
	 */
	context: {},

	/**
	 *  是否开启开发阶段的系统提示功能
	 */
	notifier: false,
	/**
	 * 热更新开关 默认关闭
	 */
	hot: false,
	/**
	 * 是否使用 server.bundle.js 代替 src/index 作为服务端访问的代码入口
	 * 默认 false 兼容以前的默认行为
	 */
	useServerBundle: false,

	/**
	 * 使用 fork-ts-checker-webpack-plugin 进行类型检查
	 */
	useTypeCheck: false,

	/**
	 * 打包出来的服务端 bundle 的文件名
	 */
	serverBundleName: 'server.bundle.js'
}
