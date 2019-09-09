import path from 'path'
import build from '../../build/babel'
import IMVC from '../../index'

let PORT = 3333
const ROOT = __dirname
const config: Partial<IMVC.Config> = {
	root: ROOT, // 项目根目录
	port: PORT, // server 端口号
	routes: 'routes', // 服务端路由目录
	layout: 'Layout', // 自定义 Layout
	// bundleAnalyzer: true,
	staticEntry: 'index.html',
	publish: '../publish',
	output: {
		path: path.resolve(ROOT, '../publish/static')
	}
}

async function main() {
	await build({ config })
}

main()
