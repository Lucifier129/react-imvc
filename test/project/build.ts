import build from '../../src/build/babel'
import RIMVC from '../../src'
let PORT = 3333
const ROOT = __dirname
const config: Partial<RIMVC.Config> = {
	root: ROOT, // 项目根目录
	port: PORT, // server 端口号
	routes: 'routes', // 服务端路由目录
	layout: 'Layout', // 自定义 Layout
	// bundleAnalyzer: true,
	staticEntry: 'index.html'
}

async function main() {
	await build({ config })
}

main()
