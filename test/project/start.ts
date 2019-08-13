process.env.NODE_ENV = 'development'
import start from '../../src/start/babel'
import RIMVC from '../../src'
const PORT: number = 3333
const ROOT = __dirname
const config: Partial<RIMVC.Config> = {
	root: ROOT, // 项目根目录
	port: PORT, // server 端口号
	routes: 'routes', // 服务端路由目录
	layout: 'Layout', // 自定义 Layout
	// bundleAnalyzer: true
}

async function main() {
	let { app, server } = await start({ config })
	console.log('started')
}

main()
