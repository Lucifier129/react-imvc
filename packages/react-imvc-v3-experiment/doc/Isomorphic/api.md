# 接口路由

除了 fetch 相关的功能，我们还提供了接口路径自定义的功能。

## 属性设置

### API

类型：`Record<string, string>`

默认值：`{}`

当 `ctrl.API` 存在时，将影响 `ctrl.fetch|get|post` 的行为，见 [ctrl.fetch](./data-fetch.md#fetch)

### restapi

类型：`string`

默认值：空字符串

当 `ctrl.restapi` 存在时，用 `restapi` 覆盖全局配置的 `restapi`，作为 `fetch` 方法的前缀补全

## 内置方法

### prependBasename

类型：

```ts
;(pathname: string) => string
```

`ctrl.prependBasename` 方法，在 url 不是绝对路径时，把全局 `config.basename` 拼接在 url 的前头。

`url = config.basename + url`

### prependPublicPath

类型：

```ts
;(pathname: string) => string
```

`ctrl.prependPublicPath` 方法，在 url 不是绝对路径时，把全局配置 `config.publicPath` 拼接在 url 的前头。

`url = config.publicPath + url`

### prependRestapi

类型：

```ts
;(url: string) => string
```

`ctrl.prependRestapi` 方法，在 url 不是绝对路径时，把全局配置 `config.restapi` 拼接在 url 的前头。

`url = config.restapi + url`

如果 url 是以 `/mock/` 开头，将使用 `ctrl.prependBasename` 方法。

注：`ctrl.fetch` 方法内部对 url 的处理，即是用到了 `ctrl.prependRestapi` 方法。
