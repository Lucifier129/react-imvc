import ReactDOM from 'react-dom'
import createApp from 'create-app/lib/client'
import routes from '../../src'

__webpack_public_path__ = window.__PUBLIC_PATH__ + '/'
const __APP_SETTINGS__ = window.__APP_SETTINGS__ || {}

const getModule = module => module.default || module
const webpackLoader = loadModule => {
  if (typeof loadModule === 'function') {
    return new Promise(loadModule).then(getModule)
  }
  return getModule(loadModule)
}

const logRenderStart = () => {
  window.console && console.time && console.time('React#render')
}

const logRenderEnd = () => {
  window.console && console.timeEnd && console.timeEnd('React#render')
}

const viewEngine = {
  render (component, container) {
    logRenderStart()
    let result = ReactDOM.render(component, container)
    setTimeout(logRenderEnd, 0) // ReactDOM.render 未必立即更新，故异步 log End
    return result
  }
}

const appSettings = {
  ...__APP_SETTINGS__,
  hashType: 'hashbang',
  container: '#root',
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