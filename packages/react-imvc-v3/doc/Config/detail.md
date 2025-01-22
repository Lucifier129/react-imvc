# 配置详情

配置内容主要分五个部分：静态资源配置、上下文环境配置、渲染模式配置、开发流程配置、打包构建配置。

## 静态资源配置

- title

类型：`string`

默认值：`'react-imvc'`

设置默认的 `document.title`。

- description

类型：`string`

默认值：`'An Isomorphic-MVC Framework'`

设置默认 `document.description`。

- keyword

类型：`string`

默认值：`'react mvc isomorphic server-side-rendering'`

- favicon

类型：`string`

默认值：空字符串

设置 [favicon](https://developer.mozilla.org/en-US/docs/Glossary/Favicon) 图标。

- root

类型：`string`

默认值：`process.cwd`

项目根目录。

- src

类型：`string`

默认值：`'src'`

同构代码目录（相对于 root），默认文件为路由配置文件。

- routes

类型：`string`

默认值：`'routes'`

服务端代码目录（相对于 root），默认文件为中间件设置文件。注意：express view path 也将被设置成 routes。

- layout

类型：`string`

默认值：空字符串

渲染模板文件（相对于 routes），导出对象为 JSX.Element。

- publish

类型：`string`

默认值：`'publish'`

打包生成资源目录（相对于 root）。

- static

类型：`string`

默认值：`'static'`

打包同构代码生成资源目录（相对于 publish）。

- staticEntry

类型：`string`

默认值：`'index.html'`

静态资源默认入口文件（相对于 static）。hash history 的 spa 入口文件名，它将出现在 /static 目录下，如果设置了 staticEntry，react-imvc 在 build 阶段，使用关闭 SSR 的模式启动一次 react-imvc app，并访问 /**CREATE_STATIC_ENTRY** 路径，将它的 html 响应内容作为静态入口 html 文件内容生成。

- staticOptions

类型：`serveStatic.ServeStaticOptions`

默认值：`{}`

express 静态资源服务配置项（`express.static(path, options)` 中的 `options`）。

- assetsPath

类型：`string`

默认值：`'../assets.json'`

Webpack 打包 manifest 映射文件。

- serverBundleName

类型：`string`

默认值：`'server.bundle.js'`

服务器端渲染时，服务器端同构代码打包文件名。

- output

类型：`webpack.Output`

默认值：

```ts
{
  pathinfo: !isProd,
  devtoolModuleFilenameTemplate: (info: webpack.DevtoolModuleFilenameTemplateInfo) =>
    path.relative(root, info.absoluteResourcePath).replace(/\\/g, '/'),
  globalObject: 'this'
}
```

Webpack 打包 output 默认配置。

- productionOutput

类型：`webpack.Output`

默认值：`{}`

生产环境下，Webpack 打包默认配置。

- port

类型：`string | number`

默认值：`3000`

服务启用端口号。

## 上下文环境配置

- staticPath

类型：`string`

默认值：`'/static'`

静态资源访问路径。

- publicPath

类型：`string`

默认值：空字符串

静态资源的发布路径，默认为空，为空时运行时修改为 basename + staticPath，可以将 /publish/static 目录发布到 CDN，并将 CDN 地址配置成 publicPath。

- basename

类型：`string`

默认值：空字符串

Node.js 应用部署的 basename，默认是空字符串，支持传入字符串 如，'/my/basename'，支持传入数组，当传入为数组时，在运行时动态确定所匹配的 basename。

- restapi

类型：`string`

默认值：空字符串

restapi basename，如果配置了这个属性，controller.fetch 方法将为非绝对路径 url 参数，补上 restapi 作为前缀。。

- content

类型：`string`

默认值：空字符串

默认渲染内容。

- context

类型：`object`

默认值：`{}`

默认上下文环境。

- initialState

类型：`object`

默认值：`undefined`

默认初始数据。

- appSettings

类型：`react-imvc.AppSettings`

默认值：`undefined`

默认应用启动设置。

## 渲染模式配置

- SSR

类型：`boolean`

默认值：`true`

是否开启服务器端渲染。

- renderMode

类型：`"renderToNodeStream" | "renderToString"`

默认值：`renderToNodeStream`

渲染模式。

## 打包构建配置

- useContentHash

类型：`boolean`，默认值：`false`，开启后会对 gulp 打包的文件名进行 hash 处理，用于缓存控制。配合 webpack 自己的 hash 一起使用，可以实现静态资源的长期缓存。

- useFileLoader

类型：`boolean`，默认值：`false`，开启后支持 `import` 静态资源，如 `import logo from './logo.png'`，logo 的值为打包后的文件名。

```typescript
import style from './style.css'

export default class extends Controller {
  preload = {
    style: style,
  }
}
```

对于 `TypeScript 项目`，需在 `src/type.d.ts` 中添加以下声明：

```typescript
/// <reference types="react-imvc/imvc-types" />
```

引入 `react-imvc/imvc-types` 类型声明，以便获得类型提示。

- compileNodeModules

编译 node_modules 模块选项，可选，对象类型，

- `rules`: 数组类型，支持 `string | RegExp | ((filename: string) => boolean)`

命中该配置的模块将被 babel 编译，因此可以通过该配置支持 esm 模块。

请注意，使用正则时需兼容处理 Windows 和 Mac/Linux 的路径差异（`(\/|\\)` 同时支持了两者）。

```js
{
  compileNodeModules: {
        rules: [
            // 将 @antv/g2 加入编译
            /@antv(\/|\\)g2/
        ]
    },
}
```

- bundleAnalyzer

类型：`BundleAnalyzerPlugin.Options | false`

默认值：`false`

是否开启 webpack 的构建产物进行可视化分析。

- alias

类型：`{ [key: string]: string; }`

默认值：`{}`

Webpack 模块解析别名自定义配置。

- logger

类型：`"dev" | null`

默认值：`isDev ? "dev" : null`

express logger 配置，默认在开发阶段使用 dev，生产阶段不使用。

- notifier

类型：`boolean`

默认值：`false`

是否开启开发阶段的系统提示功能，默认不开启。

- webpackPlugins

类型：`webpack.Plugin[]`

默认值：`[]`

Webpack plugin 自定义配置。

- webpackLoaders

类型：`webpack.RuleSetRule[]`

默认值：`[]`

Webpack loader 自定义配置。

- webpackLogger

类型：`webpack.Stats.ToStringOptions`

默认值：`{ chunks: false, colors: true }`

webpack log 日志配置。

- babel

类型：`() => TransformOptions`

默认值：[babel.ts](https://github.com/tqma113/react-imvc/blob/master/src/config/babel.ts)

babel config。

- cookieParser

类型：

```ts
cookieParser.CookieParseOptions & {
  secret?: string | string[]
}
```

默认值：`{}`

express 中间件 cookie-parser 的自定义配置，默认为空。

- helmet

类型：`helmet.IHelmetConfiguration`

默认值：

```ts
{
  frameguard: false,
  hsts: {
    maxAge: 0
  }
}
```

express 中间件 helmet 的自定义配置.

- compression

类型：`compression.CompressionOptions`

默认值：`{}`

express 中间件 compression 的自定义配置，默认为空。

- ReactViews

类型：

```ts
{
  beautify?: boolean // 是否美化 html 响应内容
  transformViews?: boolean // 默认不转换 view，已经有 babel 做处理
  babel?: TransformOptions
}
```

默认值：

```ts
{
  beautify: false, // 是否美化 html 响应内容
  transformViews: false // 默认不转换 view，已经有 babel 做处理
}
```

express view engine 的自定义配置。

- bodyParser

类型：

```ts
{
  raw: bodyParser.Options,
  json: bodyParser.OptionsJson,
  text: bodyParser.OptionsText,
  urlencoded: bodyParser.OptionsUrlencoded
}
```

默认值：`{}`

express 中间件 bodyParse 的自定义配置。

- useServerBundle

类型：`boolean`

默认值：`false`

是否使用 server.bundle.js 代替 src/index 作为服务端访问的代码入口，默认 false 兼容以前的默认行为。

- useTypeCheck

类型：`boolean`

默认值：`false`

使用 fork-ts-checker-webpack-plugin 进行类型检查。

- useBabelRuntime

类型：`boolean`

默认值：`true`

使用 babel-runtime 减少编译产物体积。

- gulp

类型：

```ts
{
  // 需要压缩到 static 目录的 css
  css?: string[] | false
  // 需要压缩到 static 目录的 html
  html?: string[] | false
  // 需要压缩到 static 目录的 js
  js?: string[] | false

  es5?: string[] | false
  // 需要复制到 static 目录的非 html, css, js 文件
  copy?: string[] | false
  // 需要复制到 publish 目录的额外文件
  publishCopy?: string[] | false
  // 需要编译到 publish 目录的额外文件
  publishBabel?: string[] | false

  [propName: string]: string[] | false
}
```

默认值：

```ts
{
  // 需要压缩到 static 目录的 css
  css: [],
  // 需要压缩到 static 目录的 html
  html: [],
  // 需要压缩到 static 目录的 js
  js: [],
  // 需要复制到 static 目录的非 html, css, js 文件
  copy: [],
  // 需要复制到 publish 目录的额外文件
  publishCopy: [],
  // 需要编译到 publish 目录的额外文件
  publishBabel: []
}
```

gulp 打包自定义配置。

## 开发流程配置

- devtool

类型：`webpack.Options.Devtool`

默认值：`isDev ? "cheap-module-eval-source-map" : ""`

开发模式工具，在开发模式下启用，再生产环境下不启用。

- webpackDevMiddleware

类型：`boolean`

默认值：`isDev`

是否开启 webpackDevMiddleware 中间件，在开发模式下启用，再生产环境下不启用。

- hot

类型：`boolean`

默认值：`false`

是否开启热模块替换。
