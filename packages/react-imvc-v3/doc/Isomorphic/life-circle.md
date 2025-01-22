# 生命周期

在 Controller 中有两种生命周期，一种是页面渲染流程中普通的生命周期，还有一种是特殊的生命周期。

## 普通生命周期

Controller 具有以下生命周期方法，执行顺序为：

```ts
getInitialState
shouldComponentCreate
componentWillCreate
componentDidFirstMount
componentDidMount
pageWillLeave
componentWillUnmount
pageDidBack
componentDidMount
pageWillLeave
componentWillUnmount
windowWillUnload
```

> <b>TIP</b>
>
> 关闭 SSR 后，不执行 `componentWillCreate` 和 `shouldComponentCreate`，直接返回 [Loading](./render.md#loading) 界面

### getInitialState

类型：

```ts
;(state: S & BaseState) => any
```

`ctrl.getInitialState` 方法会在 `createStore` 之前执行，它应该返回一个对象，作为 `createStore` 的 `initialState` 参数。

该方法将得到一个 `initialState` 参数，为当前 Controller 的 `initialState`。

该方法的作用是，提供在运行时确定 `initialState` 的能力。比如从 `cookie`、`storage`、或者 `server` 里获取数据。

该方法内，不可以使用 `this.store.acitons`，因为 `store` 还未创建。

该方法支持 `promise`，如果使用了 `async/await` 语法，或者 `return promise`，后面的生命周期方法将会等待它们 `resolve`。

### getFinalActions

类型：

```ts
;(actions: AS) => any
```

`ctrl.getFinalActions` 方法在 `createStore` 之前执行，它应该返回一个对象，作为 `createStore` 的 `actions` 参数。

该方法将得到 `actions` 参数，为当前 Controller 的 `actions`。

该方法的作用是，提供在运行时确定 `actions` 的能力，比如讲多个页面共享的 `shared-actions` 合并进来。

该方法内，不可以使用 `this.store.acitons`，因为 `store` 还未创建。

该方法不支持 `promise`，必须立刻返回 `actions`。

### shouldComponentCreate

类型：

```ts
() => boolean | void | Promise<boolean | void>
```

`ctrl.shouldComponentCreate` 方法触发时，`view` 还未被创建和渲染，如果该方法返回 `false`，将终止后续的生命周期活动。

该方法的设计目的，是鉴定权限，如果用户没有权限访问该页面，可以通过 `this.redirect` 方法，重定向到其他页面。

该方法内，可以使用 `this.store.actions`，调用 `action` 函数只会更新 `store` 里的 `state`，不会引起 `view` 的渲染。

该方法支持 `promise`，如果使用了 `async/await` 语法，或者 `return promise`，后面的生命周期方法将会等待它们 `resolve`。

注：React-IMVC v2.2.0 开始，改变了 `this.redirect` 的行为（见其文档描述），在 `shouldComponentCreate` 里 `return false` 变得无意义(它不会被执行到)。

将来可能废弃该生命周期，建议使用 v2.2.0 以上的朋友们，尽量不使用这个 `shouldComponentCreate` 生命周期。

### componentWillCreate

类型：

```ts
() => void | Promise<void>
```

`ctrl.componentWillCreate` 方法触发时，`view` 还未被创建和渲染，可以在该方法内调用接口，获取首屏数据，以便实现 SSR 服务端渲染。

该方法内，可以使用 `this.store.actions`，调用 `action` 函数只会更新 `store` 里的 `state`，不会引起 `view` 的渲染。

该方法支持 `promise`，如果使用了 `async/await` 语法，或者 `return promise`，后面的生命周期方法将会等待它们 `resolve`。

注意：在该生命周期 `fetch` 数据时，需要 `await fetch(xxx)` 否则不会等待请求结果。

### componentDidFirstMount

类型：

```ts
() => void | Promise<void>
```

`ctrl.componentDidFirstMount` 方法触发时，用户已经看到了首屏，可以在该方法内，调用接口，获取非首屏数据。

该方法内，可以使用 `this.store.actions`，调用 `action` 函数除了更新 `store` 里的 `state`，还会引起 `view` 的渲染。

该方法以及之后的所有生命周期方法里，返回 `promise` 不再会影响后续生命周期的执行。

### componentDidMount

类型：

```ts
() => void | Promise<void>
```

`ctrl.componentDidMount` 方法触发时，react component 已经 mount 到页面上。

可以在该方法内，进行 DOM 操作，绑定定时器等浏览器里相关的活动。

需要注意的是，该方法在 Controller 的生命周期内，可能不止运行一次。

### pageWillLeave

类型：

```ts
(location: ILWithBQ) => void
```

`ctrl.pageWillLeave` 方法在页面即将跳转到其他 page 前触发，如果该方法返回一个 `string` 类型，将作为提示给用户的话术出现。

如果用户点击「取消」，页面不会跳转，继续停留在当前页面。

该方法的设计目的是

- 提示用户有表单未填写
- 将用户信息缓存在 localStorage 或者 server 端

### componentWillUnmount

类型：

```ts
() => void | Promise<void>
```

`ctrl.componentWillUnmount` 方法触发时，react component 即将从页面里 unmount。

可以在该方法内，完成解绑定时器等跟 `componentDidMount` 相关的逆操作。

需要注意的是

- 该方法在 Controller 的生命周期内，可能不止运行一次。
- `pageWillLeave` 比 `componentWillUnmount` 更早执行
- 当 next page 的 view/component 要渲染时，才会触发 prev page 的 `componentWillUnmount`
- 可以在 `pageWillLeave` 里 `showLoading`，直到它被 next page 替换。

### pageDidBack

类型：

```ts
(location: HistoryLocation, context?: Context | undefined) => void
```

`ctrl.pageDidBack` 方法在 `ctrl.KeepAlive` 为 `true` 时，才会生效，在用户通过 history 回退/前进时触发。

`pageDidBack` 里同步的执行 `action` 将不会引起 view 渲染，此时 view 还未渲染，异步执行 `action` 则会引起 view 渲染。

该方法比（第二次或第二次以上的） `componentDidMount` 生命周期更早执行。

### windowWillUnload

类型：

```ts
(location: ILWithBQ) => void
```

`ctrl.windowWillUnload` 方法跟 `pageWillLeave` 方法性质类似，只是触发时机为用户关闭窗口。

在该方法内返回一个 `string` 类型，将作为提示给用户的话术出现。不同的浏览器可能有不同的限制，用户看到的话术有可能是浏览器默认的，而非自定义的。

## 特殊生命周期

### stateDidChange

类型：

```ts
(data?: Data<S & BaseState, AS & typeof shareActions> | undefined) => void
```

`ctrl.stateDidChange` 是一个特殊的生命周期，当 `store` 里的 `state` 发生变化，并且 view 也根据 `state` 重新渲染后，该方法将被触发。

该方法会接收到一个 `data` 参数，记录了 `action` 的 `type`、`payload`、`currentState`、`previousState` 等信息，可查阅文档

该方法并不常用。设计目的为，当某个 `action` 触发时，固定执行某些操作。

比如，当某个 `SHOW_POP` 触发时，1 秒后触发 `HIDE_POP`。

比如，当 `UPDATE_USER` 触发时，调用 `fetch` 方法，更新数据到 `server` 端等等。

### stateDidReuse

类型：

```ts
(state: S & BaseState) => void
```

`ctrl.stateDidReuse` 是一个特殊的生命周期。当服务端完成过渲染时，它会将 `html` 接口和 `state` 对象都返回给浏览器端；React-IMVC 内部将会尝试复用服务端提供的 `state`，不再调用 `getInitialState`、`shouldComponentCreate` 和 `componentWillCreate` 三个生命周期方法，而是调用 `stateDidReuse` 生命周期方法。

由于服务端的 `context` 和浏览器端的 `context` 只有少数几个基础数据是共享的，其它数据则不共享。该方法可以方便地将 `state` 里需要缓存的对象，放进 `context` 对象里。
