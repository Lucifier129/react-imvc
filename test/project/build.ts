import path from 'path'
import build from '../../src/build/babel'
import { Config } from '../../src/'

let PORT = 3333
const ROOT = __dirname
const config: Partial<Config> = {
	root: ROOT, // 项目根目录
	port: PORT, // server 端口号
	routes: 'routes', // 服务端路由目录
	layout: 'Layout.tsx', // 自定义 Layout
	// bundleAnalyzer: true,
	staticEntry: 'index.html',
	publish: '../publish',
	output: {
		path: path.resolve(ROOT, '../publish/static')
	},
	gulp: {
		img: false
	}
}

async function main() {
	await build({ config })
}

main()
