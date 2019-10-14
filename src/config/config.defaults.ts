import Babel from "./babel"
let cwd = process.cwd()
let port = process.env.PORT || 3000
let NODE_ENV = process.env.NODE_ENV || "development"
let isDev = NODE_ENV === "development"
import IMVC from ".."

const defaultConfig: IMVC.Config = {
	basename: "",
	title: "react-imvc",
	description: "An Isomorphic-MVC Framework",
	keywords: "react mvc isomorphic server-side-rendering",
	content: "",
	initialState: undefined,
	appSettings: undefined,
	root: cwd,
	src: "src",
	routes: "routes",
	publish: "publish",
	static: "static",
	staticPath: "/static",
	staticEntry: "", // 'index.html'
	staticOptions: {},
	publicPath: "",
	restapi: "",
	assetsPath: "../assets.json",
	output: {},
	productionOutput: {},
	alias: {},
	devtool: isDev ? "cheap-module-eval-source-map" : "",
	bundleAnalyzer: false,
	webpackDevMiddleware: isDev,
	webpackPlugins: [],
	webpackLoaders: [],
	webpackLogger: {
		chunks: false, // Makes the build much quieter
		colors: true
	},
	babel: Babel,
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
	cookieParser: {},
	helmet: {
		frameguard: false,
		hsts: {
			// https://helmetjs.github.io/docs/hsts/
			// 关闭默认的 Strict-Transport-Security
			maxAge: 0
		}
	},
	compression: {},
	ReactViews: {
		beautify: false, // 是否美化 html 响应内容
		transformViews: false // 默认不转换 view，已经有 babel 做处理
	},
	bodyParser: {
		json: {
			limit: "10MB"
		},
		urlencoded: {
			extended: false
		}
	},
	logger: isDev ? "dev" : null,
	favicon: "",
	SSR: true,
	port: port,
	NODE_ENV: NODE_ENV,
	layout: "",
	renderMode: "renderToNodeStream",
	context: {},
	notifier: false,
	hot: false,
	useServerBundle: false,
	useTypeCheck: false,
	serverBundleName: "server.bundle.js"
}

export default defaultConfig
