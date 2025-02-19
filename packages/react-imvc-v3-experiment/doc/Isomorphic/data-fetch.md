# 数据获取

为了方便获取数据，我们在 Controller 中内置了 `fetch` 函数，而且也对其他特定情况的使用方式进行了封装。

## fetch

类型：

```ts
;(url: string, options?: FetchOptions) => Promise<any>
```

`fetch` 方法用来跟服务端进行 http 或 https 通讯，它的用法和参数跟浏览器里自带的 `fetch` 函数一样。全局 `fetch` 函数的 [使用文档](https://github.github.io/fetch/)。

- `ctrl.fetch` 默认为 `headers` 设置 `Content-Type` 为 `application/json`

- `ctrl.fetch` 默认设置 `credentials` 为 `include`，即默认发送 `cookie`

- `ctrl.fetch` 默认内部执行 `response.json()`，最终返回的是 `json` 数据

  - 当 `options.json === false` 时，取消上述行为，最终返回的是 `response` 对象

- `ctrl.API` 属性存在时，`ctrl.fetch(url, options)` 会有以下行为

  - 内部会对 `url` 进行转换 `url = ctrl.API[url] || url`
  - 该特性可以将 `url` 简化为 `this.fetch(api_name)`

- 当全局配置 `config.restapi` 存在，且 `url` 为非绝对路径时，`ctrl.fetch(url, options)` 会有以下行为

  - 内部会对 `url` 进行转换 `url = config.restapi + url`
  - 当 `options.raw === true` 时，不做上述转换，直接使用 `url`

- 当 `options.fetch` 存在，且时 `function` 类型时

  - 框架使用自定义的 `options.fetch` 方法替换原本的 fetch 方法
  - 建议自定义的 `options.fetch` 方法的 `interface` 与浏览器自带的 `fetch` 保持一致

- 当 `options.timeout` 为数字时，`ctrl.fetch` 将有以下行为

  - `options.timeout` 时间内，服务端没有响应，则 `reject` 一个 `timeout error`
  - 超时 reject 不会 abort 请求，内部用 Promise.race 忽略服务端请求的结果

- 当 `options.timeoutErrorFormatter` 和 `optons.timeout` 同时存在时，有以下行为：

  - 当 `timeoutErrorFormatter` 为字符串，它将作为超时 `reject` 的 `error.message`
  - 当 `timeoutErrorFormatter` 为函数是，它将接受一个参数 `{ url, options }` 包含 `fetch` 方法最终发送的 `url` 和 `options` 等信息。该函数的返回值，作为超时 `reject` 的 `error.message`。

- 当 `url` 以 `/mock/` 开头时

  - 内部会对 `url` 进行转换 `url = config.basename + url`
  - 该特性提供在本地简单地用 `json` 文件 `mock` 数据的功能
  - 当 `options.raw === true` 时，不做上述转换，直接使用 `url`

## get

类型：

```ts
;(
  url: string,
  params?: Record<string, string | number | boolean> | undefined,
  options?: FetchOptions | undefined
) => Promise<any>
```

`ctrl.get` 方法是基于 `ctrl.fetch` 封装的方法，更简便地发送 `get` 请求。

`url` 参数的处理，跟 `ctrl.fetch` 方法一致。

`params` 参数将在内部被 `querystring.stringify` ，拼接在 `url` 后面。

`options` 参数将作为 `fetch` 的 `options` 传递。

## post

类型：

```ts
;(url: string, data?: any, options?: FetchOptions | undefined) => Promise<any>
```

`ctrl.post` 方法是基于 `ctrl.fetch` 封装的方法，更简便地发送 `post` 请求。

`url` 参数的处理，跟 `ctrl.fetch` 方法一致。

`data` 参数将在内部被 `JSON.stringify`，然后作为 request payload 发送给服务端

`options` 参数将作为 `fetch` 的 `options` 传递。
