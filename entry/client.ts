import "core-js/stable"
import "regenerator-runtime/runtime"
import "../polyfill"
import "whatwg-fetch"
import ReactDOM from "react-dom"
import createApp, { Loader, LoadController, ControllerConstructor } from "create-app/client"
import util from "../util"
// @ts-ignore
import $routes from "@routes"
import { AppSettings, Render, Preload, NativeModule } from "../type"
import Controller from '../controller'

__webpack_public_path__ = window.__PUBLIC_PATH__ + "/"
const __APP_SETTINGS__: AppSettings = window.__APP_SETTINGS__ || {}

const getModule = (module: any) => module.default || module
const webpackLoader: Loader = (loadModule, location, context) => {
  return ((loadModule as LoadController)(
    location,
    context
  ) as Promise<ControllerConstructor>).then(getModule)
}

let shouldHydrate = !!window.__INITIAL_STATE__

const render: Render<React.ReactElement> = (
  view: React.ReactElement,
  controller?: Controller<any, any, any>,
  container?: Element | null
) => {
  try {
    if (container) {
      if (shouldHydrate) {
        shouldHydrate = false
        ReactDOM.hydrate([view], container)
      } else {
        ReactDOM.render([view], container)
      }
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

const appSettings: AppSettings = {
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
const preload: Preload = {}
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
if (typeof module !== "undefined" && (module as NativeModule).hot) {
  if ((module as NativeModule).hot) {
    let hot = (module as NativeModule).hot
    if (hot && hot.accept) {
      hot.accept()
    }
  }
}
