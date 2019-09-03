import "core-js/stable"
import "regenerator-runtime/runtime"
import "../polyfill"
import "whatwg-fetch"
import ReactDOM from "react-dom"
import createApp from "create-app/client"
import util from "../util"
// @ts-ignore
import $routes from "@routes"
import IMVC from "../index"

__webpack_public_path__ = window.__PUBLIC_PATH__ + "/"
const __APP_SETTINGS__: IMVC.AppSettings = window.__APP_SETTINGS__ || {}

const getModule = module => module.default || module
const webpackLoader: createApp.Loader = (loadModule, location, context) => {
  return ((loadModule as createApp.LoadController)(
    location,
    context
  ) as Promise<createApp.ControllerConstructor>).then(getModule)
}

let shouldHydrate = !!window.__INITIAL_STATE__

const render: IMVC.Render<React.ReactElement> = (
  view: React.ReactElement,
  controller?: IMVC.Controller,
  container?: Element | null
) => {
  try {
    if (shouldHydrate) {
      shouldHydrate = false
      ReactDOM.hydrate([view], container)
    } else {
      ReactDOM.render([view], container)
    }
  } catch (error) {
    if (!controller) throw error

    if (controller.errorDidCatch) {
      controller.errorDidCatch(error, "view")
    }

    if (controller.getViewFallback) {
      render(controller.getViewFallback(), undefined, container)
    } else {
      throw error
    }
  }
}
const viewEngine = { render }

const routes = util.getFlatList(
  Array.isArray($routes) ? $routes : Object.values($routes)
)

const appSettings: IMVC.AppSettings = {
  hashType: "hashbang",
  container: "#root",
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
const preload: IMVC.Preload = {}
Array.from(document.querySelectorAll("[data-preload]")).forEach(elem => {
  let name = elem.getAttribute("data-preload")
  let content = elem.textContent || elem.innerHTML
  if (name) {
    preload[name] = content
  }
})
if (typeof appSettings.context !== "undefined") {
  appSettings.context.preload = preload
}

const app = createApp(appSettings)
app.start()

// 热更新
if (typeof module !== "undefined" && (module as IMVC.NativeModule).hot) {
  if ((module as IMVC.NativeModule).hot) {
    let hot = (module as IMVC.NativeModule).hot
    if (hot && hot.accept) {
      hot.accept()
    }
  }
}
