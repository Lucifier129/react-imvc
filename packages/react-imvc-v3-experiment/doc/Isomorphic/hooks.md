# Hooks

react-imvc v2.3.0 版本增加了对 react-hooks 的支持，需要同步安装 react 和 react-dom v16.8.0 或以上版本。

## useCtrl

类型：

```ts
;<Ctrl extends Controller<any, any>>() => Ctrl
```

在 React 组件里获取到当前 Controller 的实例。

使用该 hooks-api，可以减少传递 `ctrl` 的负担。

```ts
import React from 'react'
import { useCtrl } from 'react-imvc/hook'

export default function Counter() {
  let ctrl = useCtrl()

  return <button onClick={ctrl.handleIncre} />
}
```

## useModel

类型：

```ts
;<S extends {}, AS extends {}>() =>
  readonly[(S & BaseState, Currings<S & BaseState, AS & BaseActions>)]
```

在 React 组件里获取到当前 `model` 对应的 `state` 状态和 `actions` 行为。

使用该 hooks-api，可以减少传递 `state` 的负担。

```ts
import React from 'react'
import { useModel } from 'react-imvc/hook'

export default function Counter() {
  let [state, actions] = useModel()

  return <div onClick={() => actions.INCRE()}>count:{state.count}</div>
}
```

## useModelState

类型：

```ts
;<S extends {}>() => S & BaseState
```

在 React 组件里获取倒当前 `model` 对应的 `state` 状态。

```ts
import React from 'react'
import { useModelState } from 'react-imvc/hook'

const Counter = () => {
  let state = useModelState()
  return state.count
}
```

## useModelActions

类型：

```ts
;<S extends {}, AS extends {}>() => Currings<S & BaseState, AS & BaseActions>
```

在 React 组件里获取到当前 `store` 里的 `actions` 对象。

使用该 hooks-api，可以减少在 Controller 里添加 handler 方法。

```ts
import React, { useEffect } from 'react'
import { useModelActions } from 'react-imvc/hook'

export default function Counter() {
  let { INCRE_COUNT } = useModelActions()

  let handleClick = () => {
    INCRE_COUNT()
  }

  useEffect(() => {
    let timer = setInterval(() => {
      INCRE_COUNT()
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <button onClick={handleClick} />
}
```
