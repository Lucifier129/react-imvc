# BOM

这一部分我们将介绍浏览器相关的属性和功能。

## Location

类型：`Location`（[HistoryLocation](https://github.com/tqma113/create-app/blob/master/src/share/type.d.ts)）

这是用于记录当前页面在浏览器中的信息的对象，类似于 [location](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/location)。

存在于 Controller 中 `ctrl.location`。

## History

类型：`HistoryWithBFOL<BLWithBQ, ILWithBQ>`

用于管理浏览器会话就，详情请见 [create-history](https://github.com/tqma113/history)。

存在于 Controller 中 `ctrl.history`。

## reload

`ctrl.reload` 方法可实现刷新当前页面的功能，相当于单页应用的 `window.location.reload()`，通常整个页面不会刷新，而是重新实例化了一份 Controller。

## redirect

`ctrl.redirect` 方法可实现重定向功能。

如果 url 是绝对路径，直接使用 url
如果 url 不是绝对路径，对 url 调用 `ctrl.prependBasename` 补前缀
如果 `isRaw` 为 `true`，则不进行补前缀
注意

重定向功能不是修改 `location` 的唯一途径，只有在需要的时候使用，其它情况下，考虑用 `ctrl.history` 里的跳转方法。
在服务端调用 `this.redirect` 时，内部会通过 `throw` 中断执行，模拟浏览器跳转时的中断代码效果
如果在 `try-catch` 语句里使用 `this.redirect`，会有一个副作用，必须判断 `catch` 的是不是 `Error` 的实例

```ts
try {
  // do something
  this.redirect(targetUrl)
} catch (error) {
  if (error instanceof Error) {
    // catch error
  }
}
```
