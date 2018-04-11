import { Router } from "express";
import path from "path";
import ReactDOMServer from "react-dom/server";
import createApp from "create-app/lib/server";
import util from "../util";

const { getFlatList } = util
const commonjsLoader = module => module.default || module;

export default function createPageRouter(options) {
  let config = Object.assign({}, options);
  let routes = require(path.join(config.root, config.src));

  routes = routes.default || routes;
  if (!Array.isArray(routes)) {
    routes = Object.values(routes);
  }
  routes = getFlatList(routes);

  let router = Router();
  let serverAppSettings = {
    loader: commonjsLoader,
    routes: routes,
    viewEngine: {
      render: ReactDOMServer[config.renderMode]
    }
  };

  let app = createApp(serverAppSettings);
  let layoutView = config.layout || path.join(__dirname, "view");

  // 纯浏览器端渲染模式，用前置中间件拦截所有请求
  if (config.SSR === false) {
    router.all("*", (req, res) => {
      res.render(layoutView);
    });
  } else if (config.NODE_ENV === "development") {
    // 带服务端渲染模式的开发环境，需要动态编译 src/routes
    var setupDevEnv = require("../build/setup-dev-env");
    setupDevEnv.setupServer(config, {
      handleHotModule: $routes => {
        const routes = getFlatList(
          Array.isArray($routes) ? $routes : Object.values($routes)
        );
        app = createApp({
          ...serverAppSettings,
          routes
        });
      }
    });
  }

  // handle page
  router.all("*", async (req, res, next) => {
    let { basename, serverPublicPath, publicPath } = req;
    let context = {
      basename,
      serverPublicPath,
      publicPath,
      restapi: config.serverRestapi || config.restapi || "",
      ...config.context,
      preload: {},
      isServer: true,
      isClient: false,
      req,
      res
    };

    try {
      let { content, controller } = await app.render(req.url, context);

      /**
       * 如果没有返回 content
       * 不渲染内容，controller 可能通过 context.res 对象做了重定向或者渲染
       */
      if (!content) {
        return;
      }

      let initialState = controller.store
        ? controller.store.getState()
        : undefined;
      let htmlConfigs = initialState ? initialState.html : undefined;
      let data = {
        ...htmlConfigs,
        content,
        initialState
      };

      // 支持通过 res.locals.layoutView 动态确定 layoutView
      res.render(res.locals.layoutView || layoutView, data);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
