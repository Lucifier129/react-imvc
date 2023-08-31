process.env.NODE_ENV = 'production'
const build = require('../build/babel')
let PORT = 3333
const ROOT = __dirname
const config = {
	root: ROOT, // 项目根目录
	port: PORT, // server 端口号
	routes: 'routes', // 服务端路由目录
	layout: 'Layout', // 自定义 Layout
	// bundleAnalyzer: true,
	// staticEntry: 'index.html',
	gulp: {
		img: false
	}
}

async function main() {
	await build({ config })
}

main()
