import ReactDOM from 'react-dom'
import createApp from 'create-app/lib/client'
import util from '../util'
import $routes from '@routes'

__webpack_public_path__ = window.__PUBLIC_PATH__ + '/'
const __APP_SETTINGS__ = window.__APP_SETTINGS__ || {}

const getModule = module => module.default || module
const webpackLoader = loadModule => {
	if (typeof loadModule === 'function') {
		return new Promise(loadModule).then(getModule)
	}
	return getModule(loadModule)
}

const viewEngine = {
	render: (component, container) => {
		ReactDOM.render(component, container)
	}
}

const routes = util.getFlatList(
	Array.isArray($routes) ? $routes : Object.values($routes)
)

const appSettings = {
	hashType: 'hashbang',
	container: '#root',
	...__APP_SETTINGS__,
	context: {
		preload: {},
		...__APP_SETTINGS__.context,
		isClient: true,
		isServer: false
	},
	loader: webpackLoader,
	routes,
	viewEngine
}

/**
 * 动态收集服务端预加载的内容
 */
const preload = {}
Array.from(document.querySelectorAll('[data-preload]')).forEach(elem => {
	let name = elem.getAttribute('data-preload')
	let content = elem.textContent || elem.innerHTML
	preload[name] = content
})
appSettings.context.preload = preload

const app = createApp(appSettings)

app.start()

// 热更新
if (typeof module !== 'undefined' && module.hot) module.hot.accept()
