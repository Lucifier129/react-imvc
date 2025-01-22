# 错误处理

从 React-IMVC v2.5.0 开始，增加了了错误处理相关的生命周期。

注意：使用错误处理机制后，每个组件都被 wrap 一层 `ErrorBoundary` 组件，损失了 react-devtools 的简洁性。

错误处理与视图降级被分成不同的生命周期去处理。

## errorDidCatch

这是 Controller 中的关于错误处理的生命周期函数。

类型：

```ts
(error: Error, str: string) => void
```

该生命周期捕获从 `ctrl`, `model`, `view` 里抛出的错误，第一个参数为错误对象，第二个参数为 `controller|model|view` 之一的字符串。

可以在该生命周期里，上报错误信息。

## getComponentFallback

类型：

```ts
(
  displayName: string,
  InputComponent: React.ComponentType
): React.ReactElement | string | undefined | null
```

该生命周期在 React 组件抛错时触发，返回的内容将作为该组件的 `fallback` 显示给用户。

第一个参数为错误组件的 displayName，它通常是 Class Component 的类名，或者 Function Component 的函数名（[Components and Props](https://reactjs.org/docs/components-and-props.html)）。

注意：`displayName` 会在压缩后，变成单字母，跟开发阶段不同。因此第二个参数 Component 可能更加有用。

Component 参数为发生错误的组件本身。

注意：`getComponentFallback` 依赖 React 组件的 `componentDidCatch` 生命周期。该生命周期在服务端不触发，因此 `getComponentFallback` 只在 client 端起作用。在 SSR 时无效，`getViewFallback` 在 SSR 时有效。

## getViewFallback

类型：

```ts
;(view?: string) => React.ReactElement | string | undefined | null
```

该生命周期在两种情况下起作用

- Controller 走初始化的生命周期期间发生错误
  - 将走 `getViewFallback` 返回的 view 展示给用户
  - 此时 `store` 里的数据没有渲染的保障
  - 客户端将会再次走一遍 Controller 的初始化流程
- 做 SSR 时，view 里存在错误
  - 将走 `getViewFallback` 返回的 view 展示给用户
  - 此时 Controller 已经初始化过，`store` 里的数据应该是完整的
  - 客户端不会从新走一遍 Controller 的初始化流程

## ErrorBoundary

新增了 `ErrorBoundary` 组件，可以便捷地对单一组件进行特殊的错误处理。

注意：该组件包裹的元素，将脱离全局 `getComponentFallback` 生命周期，走它自身的 fallback 处理逻辑。但依然会内部上抛错误给 `ctrl.errorDidCatch`。

```ts
import ErrorBoundary, { withFallback } from 'react-imvc/component/ErrorBoundary'

// render-props 模式，当 ErrorBoundary 组件的子元素发生错误时，展示 fallback 内容
const App = (props) => {
  return (
    <ErrorBoundary fallback={<span>发生错误，请重试</span>}>
      {() => {
        return <div>test</div>
      }}
    </ErrorBoundary>
  )
}

// hoc 模式，当 Test 组件出现错误时，展示 fallback 内容
const Test = () => <div>test</div>
const TestWithFallback = withFallback(<span>发生错误，请重试</span>)(Test)
```
