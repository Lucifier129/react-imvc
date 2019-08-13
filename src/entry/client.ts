import 'core-js/stable'
import 'regenerator-runtime/runtime'
import '../polyfill'
import 'whatwg-fetch'
import ReactDOM from 'react-dom'
import CA from 'create-app'
import util from '../util'
// @ts-ignore
import $routes from '@routes'
import Controller from '../controller'
import RIMVC from '../index'

(global as RIMVC.Global).__webpack_public_path__ = (window as RIMVC.WindowNative).__PUBLIC_PATH__ + '/'
const __APP_SETTINGS__: RIMVC.AppSettings = (window as RIMVC.WindowNative).__APP_SETTINGS__ || {}

const webpackLoader: CA.Loader = (loadModule, location, context) => {
  return (<CA.LoadController>loadModule)(location, context)
}

let shouldHydrate = !!(window as RIMVC.WindowNative).__INITIAL_STATE__

const render: RIMVC.Render = (
  view: React.ReactElement,
  container: Element | null,
  controller?: Controller
) => {
  try {
    if (shouldHydrate) {
      shouldHydrate = false
      ReactDOM.hydrate(<React.ReactElement>view, container)
    } else {
      ReactDOM.render(<React.ReactElement>view, container)
    }
  } catch (error) {
    if (!controller) throw error

    if (controller.errorDidCatch) {
      controller.errorDidCatch(error, 'view')
    }

    if (controller.getViewFallback) {
      render(controller.getViewFallback(), container)
    } else {
      throw error
    }
  }
}
const viewEngine = { render }

const routes = util.getFlatList(
  Array.isArray($routes) ? $routes : Object.values($routes)
)

const appSettings: RIMVC.AppSettings = {
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
const preload: RIMVC.Preload = {}
Array.from(document.querySelectorAll('[data-preload]')).forEach(elem => {
  let name = elem.getAttribute('data-preload')
  let content = elem.textContent || elem.innerHTML
  if (name) {
    preload[name] = content
  }
});
if(typeof appSettings.context !== 'undefined')
  appSettings.context.preload = preload

const app = CA.client(appSettings);
(app.start as CA.Start)()

// 热更新
if (typeof module !== 'undefined' && (module as RIMVC.NativeModule).hot) {
  if ((module as RIMVC.NativeModule).hot) {
    let hot = (module as RIMVC.NativeModule).hot
    if (hot && hot.accept) {
      hot.accept()
    }
  }
}
