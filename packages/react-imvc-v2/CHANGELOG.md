# CHANGELOG

## 2.9.9

-   fix: 修改 webpack 配置的 resolve.mainFields 指定为 ['browser', 'main']，避免引入 esm 模块引发的问题

## 2.9.8

-   fix: fix bug when lazy component is loaded before useEffect called

## 2.9.7

-   fix: 修复写死 express ~v.4.14.0 的问题

## 2.8.0 & 2.8.1

-   feat: 新增 `lazy` 高阶组件，支持 SSR 的异步组件
-   feat: 新增 `viewWillHydrate` 生命周期，可以在 SSR 后，CSR 之前，为 hydrate 做准备工作，如加载异步组件等

## 2.7.14

-   fix: 固定 core-js 版本为 v3.19.3，其 v3.20 版本改写 Error 导致其它库报错

## 2.7.11

-   revert: 回滚 Script 组件的处理

## 2.7.9

-   fixed：build 任务里强制退出进程，避免悬挂

## 2.7.8

-   fixed: 修复 hot reload 在 build 阶段也开启了的问题

## 2.7.7

-   fixed：修复 webpack externals 配置错误的问题，引入 webpack-node-externals

## 2.7.6

-   fixed: 修复多 basename 场景下，服务端重复匹配的问题

## 2.7.5

-   deprecated: 废弃 imvc.config 的 initialState 配置，它会导致浏览器端误判已经做过 SSR，跳过 getInitialState 等生命周期。可以通过 initialState.js 这种模块方式去共享状态。

## 2.7.4

-   feature: 忽略 preload css 时渲染终止的问题，改为渲染一个不带样式的页面，并输出错误日志

## 2.7.3

-   fix: 重置 webpack config 的 resolve.modules 配置，不再指定特殊目录，走默认 resolve 路径

## 2.7.0

-   feature: 支持禁用 gulp 任务

## 2.6.7

-   fix: 'fetch is not a function' Error

## 2.6.6（不稳定）

-   Error Handling 支持异步生命周期的处理
-   为 保护性复制功能加开关
-   支持使用者手动传入自定义的 fetch 方法替换 window.fetch 和 node-fetch

## 2.6.1

-   增加 `ctr.fetch` 的 options 参数，options.timeoutErrorFormatter，支持自定义超时错误信息
-   升级 morgan 版本，解决安全隐患。

## 2.6.0

-   升级 create-app 到 v1.0.0，跟 react-imvc v1.x 的 create-app v0.8.x 依赖做明确的版本区分
-   新增 api `ctrl.renderView(ReactComponent)`，只在客户端生效，可以在 `componentWillCreate` 及之后的生命周期方法里执行

## 2.5.10

-   fixed 劫持 React.createElement 的时机修改为 render 前，并在 render 后重置回去，防止内存泄漏

## 2.5.9

-   fixed gulp/webpack 配置问题

## 2.5.8

-   fixed 全局错误捕获，导致 KeepAlive 失效的问题

## 2.5.0

-   增加全局错误捕获的机制

## 2.4.0

-   增加对 `typescript` 的支持
-   `util` 模块用 `typescript` 重构

## 2.3.0

-   增加对 `react-hooks` 的支持
    -   `useCtrl` 获取当前 controller 的实例
    -   `useModel` 获取当前的 global state
    -   `useActions` 获取当前的 actions 对象

## 2.2.0

-   优化 `controller.redirect`
    -   支持在更多生命周期里调用，如 `getInitialState`, `shouldComponentCreate`, `componentWillCreate` 等
    -   使用 `throw` 语句模拟浏览器跳转时中断代码执行的效果

## 2.1.0

-   升级 gulp 套件到 v4.x 版本
-   支持打包出 `server-bundle.js`

```javascript
// imvc.config.js
{
  useServerBundle: true, // 开启 serverBundle 模式
  serverBundleName: 'server.bunlde.js', // 如需修改 serverBundle 的文件名，配置该字段
}
```
