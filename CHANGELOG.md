# CHANGELOG

## 2.7.3

- fix: 重置 webpack config 的 resolve.modules 配置，不再指定特殊目录，走默认 resolve 路径

## 2.7.0

- feature: 支持禁用 gulp 任务

## 2.6.7
- fix: 'fetch is not a function' Error

## 2.6.6（不稳定）

- Error Handling 支持异步生命周期的处理
- 为 保护性复制功能加开关
- 支持使用者手动传入自定义的fetch方法替换window.fetch和node-fetch

## 2.6.1

- 增加 `ctr.fetch` 的 options 参数，options.timeoutErrorFormatter，支持自定义超时错误信息
- 升级 morgan 版本，解决安全隐患。

## 2.6.0

- 升级 create-app 到 v1.0.0，跟 react-imvc v1.x 的 create-app v0.8.x 依赖做明确的版本区分
- 新增 api `ctrl.renderView(ReactComponent)`，只在客户端生效，可以在 `componentWillCreate` 及之后的生命周期方法里执行

## 2.5.10

- fixed 劫持 React.createElement 的时机修改为 render 前，并在 render 后重置回去，防止内存泄漏

## 2.5.9

- fixed gulp/webpack 配置问题

## 2.5.8

- fixed 全局错误捕获，导致 KeepAlive 失效的问题

## 2.5.0

- 增加全局错误捕获的机制

## 2.4.0

- 增加对 `typescript` 的支持
- `util` 模块用 `typescript` 重构

## 2.3.0

- 增加对 `react-hooks` 的支持
  - `useCtrl` 获取当前 controller 的实例
  - `useModel` 获取当前的 global state
  - `useActions` 获取当前的 actions 对象

## 2.2.0

- 优化 `controller.redirect` 
  - 支持在更多生命周期里调用，如 `getInitialState`, `shouldComponentCreate`, `componentWillCreate` 等
  - 使用 `throw` 语句模拟浏览器跳转时中断代码执行的效果

## 2.1.0

- 升级 gulp 套件到 v4.x 版本
- 支持打包出 `server-bundle.js`

```javascript
// imvc.config.js
{
  useServerBundle: true, // 开启 serverBundle 模式
  serverBundleName: 'server.bunlde.js', // 如需修改 serverBundle 的文件名，配置该字段
}
```