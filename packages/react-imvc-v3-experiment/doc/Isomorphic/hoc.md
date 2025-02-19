# 高阶组件

React-IMVC 提供了高阶组件，可以便利地实现一些特殊需求。

## connect

类型：

```ts
<S extends (props: any) => any>(selector?: S | undefined): With<ReturnType<S>>
```

`connect` 是一个高阶函数，第一次调用时接受 `selector` 函数作为参数，返回 `withData` 函数。

`withData` 函数接受一个 React 组件作为参数，返回新的 React 组件。`withData` 会将 `selector` 函数返回的数据，作为 `props` 传入新的 React 组件。

`selector({ state, ctrl, actions })` 函数将得到一个 `data` 参数，其中包含三个字段 `state`, `ctrl`, `acitons`，分别对应 ctrl 里的 global state, this 和 actions 对象。

```ts
import React from 'react'
import connect from 'react-imvc/hoc/connect'

const withData = connect(({ state }) => {
  return {
    content: state.loadingText,
  }
})

export default withData(Loading)

function Loading(props) {
  if (!props.content) {
    return null
  }
  return (
    <div id="wxloading" className="wx_loading">
      <div className="wx_loading_inner">
        <i className="wx_loading_icon" />
        {props.content}
      </div>
    </div>
  )
}
```

### lazy(loader)

类似于 `React.lazy`，但不需要 `Suspense` 组件包裹，它暴露了 `load` 方法，调用时会加载目标组件，否则渲染 `props.fallback`，如果没有 fallback，则默认为 null。

任何时候调用 load，都会在加载组件后，更新所有当前活跃的相关 Lazy 组件。

配合 `ctrl.componentWillCreate` 和 `ctrl.viewWillHydrate`，可以实现支持 SSR 的异步组件。

```tsx
import React from 'react'
import { lazy } from 'react-imvc/hoc/lazy'

const LazySidebar = lazy(() => import('./sidebar'))

const View = () => {
  const handleClick = () => {
    // 加载完成后，自动刷新 LazySideBar
    LazySideBar.load()
  }
  return (
    <div>
      <button onClick={}>load</button>
      <LazySidebar fallback={<div>占位</div>} />
    </div>
  )
}

class Async extends Controller {
  View = View
  async componentWillCreate() {
    // SSR 时提前加载 LazySideBar
    await LazySideBar.load()
  }

  async viewWillHydrate() {
    // hydrate 前，提前加载 LazySideBar
    await LazySideBar.load()
  }
}
```
