# Context

这是用于应用中用于记录当前页面信息的对象，贯穿页面的整个生命周期，它存放于 `ctrl.context`。

## isServer

类型：`boolean`

是否在服务器端。

## isClient

类型：`boolean`

是否在浏览器端。

## basename

类型：`string`

配置文件中设置的 `basename`。

## publicPath

配置文件中的 `publicPath`。

## restapi

类型：`string`

Controller 中设置的 restapi 的接口路径。

## preload

类型：`Record<string, string>`

预加载资源，以键值对的形式。

## prevLocation

类型：`HistoryLocation`（[HistoryLocation](https://github.com/tqma113/create-app/blob/master/src/share/type.d.ts)）

当前页面之前的 `Location`。
