# 缓存

为了提高页面加载速度和效率，我们也提供了一些缓存的功能。

## 属性设置

### KeepAlive

类型：`boolean`

默认值：`false`

当 `ctrl.KeepAlive = true` 时，开启缓存模式。默认为 `false|undefined`

`KeepAlive` 会缓存 `view`，`ctrl` 及其 `store`。

当页面前进或后退时，不再实例化一个新的 `ctrl`，而是从缓存里取出上次的 `ctrl`，并展示它的 `view` （通过设置 `dispaly`）。并触发 `pageDidBack` 生命周期。

### KeepAliveOnPush

类型：`boolean`

默认值：`false`

当 `ctrl.KeepAliveOnPush = true` 时，当页面通过 `history.push` 到另一个页面时，缓存当前页面。当页面回退到上一个页面时，清除当前页面的缓存。

该属性可以实现只为下一个新页面的提供缓存功能。

注：浏览器把前进/后退都视为 POP 事件，因此 A 页面 `history.push` 到 B 页面，B 页面 `history.back` 回到 A 时为 POP，A 页面再 `history.forward` 到 B 页面，也是 POP。`KeepAliveOnPush` 无法处理该场景，只能支持一次性来回的场景。

## 内置函数

### saveToCache

`ctrl.saveToCache` 方法只在客户端存在，用以手动将 `ctrl` 加入 KeepAlive 缓存里。

### removeFromCache

`ctrl.removeFromCache` 方法只在客户端存在，用以手动将 `ctrl` 从 KeepAlive 缓存里清除。
