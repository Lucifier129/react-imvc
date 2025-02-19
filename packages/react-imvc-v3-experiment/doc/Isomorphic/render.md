# 页面渲染

在这一部分我会介绍 React-IMVC 中页面渲染的基本过程和几个页面渲染的相关参数。

## View

这里的 View 指的就是 MVC 中的 V，但它不仅仅指的是 View 组建，而是在 React-IMVC 中页面渲染相关流程的所有内容（包括 View 组件）。

### View 组件

在这一部分，我们仅仅是要提供 React 渲染的部分，就如：

```ts
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  ...
}

ReactDom.render(
  <App />,
  document.getElementById('root')
)
```

中的 `App` 组件一样。但不同的是，我们会向 `View` 组件传入 三个参数：`state`、`actions` 和 `ctrl`。其中 `state` 和 `actions` 是数据管理的内容，详细介绍可以看 [数据管理](./data-manage.md)。而 `ctrl` 是当前 `View` 组件所在 Controller 的实例，我们可以通过该实例，调用 Controller 中的内置方法和自定义方法。

## SSR

这是 Controller 中的字段：

类型：`boolean`

默认值：`true`

之前在 [配置详情](../config/detail.md) 中也提到了该字段，它们的功能相同，但作用范围不同，项目配置中的 SSR 字段控制的是所有页面的渲染方式，而 `ctrl.SSR` 只控制当前页面的渲染方式。可以通过以下方式进行设置：

```ts
import Controller from 'react-imvc/ctrl'
import React from 'react'

export default class Home extends Controller {
  SSR = false

  ...
}
```

除了直接设置，我们还支持在 url 的 query 部分控制 SSR，如 [location:3000/foo?SSR=1]、[location:3000/foo?SSR=false]。

当然，`Controller.SSR` 的默认值是 `true`，即服务器端渲染默认开启。

## Loading

这是 Controller 中的字段：

类型：`React.ReactElement`

默认值：`null`

当 `ctrl.SSR == false` 时，如果 `ctrl.Loading` 有值，将渲染 `ctrl.Loading` 组件

## refreshView

这也是 Controller 中内置的函数，`ctrl.refreshView` 方法只在客户端存在，用当前的 `state` 刷新视图。

从 v2.6.0 版本开始，接受一个 `React.ReactElement` 作为参数，如果没有传递，则调用 `ctrl.render()`。

可以使用 `ctrl.refreshView(<div>test</div>)` 直接将 `View` 渲染到页面上。

## renderView

这也是 Controller 中内置的函数，`ctrl.renderView` 方法只在客户端生效，从参数 `ReactComponent` 作为 `View` 渲染，如果没有传递该参数，它默认为 `this.View`。

`renderView` 和 `refreshView` 的差别在于

`refreshView` 接受的参数是 `React.ReactElement`，而不是组件。
`renderView` 接受的参数是 `React.Component`，而不是元素。
`refreshView` 只在客户端里存在，需要判断环境再调用
`renderView` 只在客户端里生效，但这个方法一直存在
`renderView` 的使用场景通常是：我需要渲染一个 `View`，它不是 `ctrl.View`，但它需要接受跟 `ctrl.View` 一样的 `props`。

比如根据 tab 进行单页切换时，新页面可能需要一定时间才能获取到数据，而我们需要及时的响应用户。可以在 `componentWillCreate` 里添加 `renderView`，渲染一个加载动画或者骨架屏。

```js
class Controller extends BaseController {
  componentWillCreate() {
    this.renderView(LoadingView)
    // ...other code
  }
}
```
