# 设置方式

上面提到需要设置两份配置：一份在项目配置文件 `imvc.config.js` 中，另一份在 `start.js` 中。

## 配置文件

目前配置文件支持五种类型文件：JS、TS、JSX、TSX、JSON。在 JS、TS、JSX、TSX 文件中最终要以 CommonJS 或 ES6 的方式导出配置信息。推荐使用 TS 文件，一遍对配置信息进行类型约束。示例如下：

```ts
import path from 'path'
import { defineConfig } from 'react-imvc'

let PORT = 33336
const ROOT = __dirname

const config = defineConfig({
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  routes: 'routes', // 服务端路由目录
  layout: 'Layout', // 自定义 Layout
  staticEntry: 'index.html',
  publish: '../publish',
  output: {
    path: path.resolve(ROOT, '../publish/static'),
  },
  webpackDevMiddleware: true,
})

export default config
```

或者 JSON 文件：

```json
{
  "root": "", // 项目根目录
  "port": "3000", // server 端口号
  "routes": "routes", // 服务端路由目录
  "layout": "Layout", // 自定义 Layout
  "staticEntry": "index.html",
  "publish": "../publish",
  "output": {
    "path": "../publish/static"
  },
  "webpackDevMiddleware": true
}
```

## 启动文件

启动文件中需要使用 React-IMVC 中暴露的接口启动，使用方式如下：

```ts
import { start, defineConfig } from 'react-imvc'

const PORT: number = 3333
const ROOT = __dirname
const config = defineConfig({
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  routes: 'routes', // 服务端路由目录
  layout: 'Layout', // 自定义 Layout
})

async function main() {
  let { app, server } = await start({ config })
  console.log('started')
}

main()
```

> <b>TIP</b>
>
> 启动文件中也可以引用配置文件 `imvc.config.ts` 中的配置。
