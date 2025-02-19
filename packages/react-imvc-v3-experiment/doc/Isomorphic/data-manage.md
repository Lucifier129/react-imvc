# 数据管理

这一部分即是数据管理的部分，我们采用了类 [Redux](https://redux.js.org/) 的数据管理工具：[Relite](https://github.com/tqma113/relite)。

## 构建

在 Relite 中只需要编写两个部分的内容：初始状态（initialState）和状态变动函数（actions），其中状态变动函数，即 actions 均需要编写为纯函数，它们有两种形式：

```ts
// 无参
<S extends State>(state: S) => S

// 有参
<S extends State>(state: S, payload: Payload) => S
```

其中，`state` 为当前状态，`State` 为状态的类型，`payload` 为额外参数，`Payload` 为额外参数的类型，它们都返回一个新的数据作为新的状态。

在 React-IMVC 中，为了约束使用者的代码风格和类型正确，我们提供了 `Action` 类型，它的使用方式如下：

```ts
import { Action } from '../../../../src'

const ADD_FOO: Action<State> = (state) => {
  return {
    ...state,
    foo: state.foo + 1,
  }
}

const UPDATE_FOO: Action<State, number> = (state, foo) => {
  return {
    ...state,
    foo,
  }
}
```

将相关类型作为泛型传入，它可以自动识别当前 action 是否包含额外参数，并返回对应的类型。

而这一部分的内容，通常建议写在 `Model.ts` 文件中。以下是示例：

```ts
// Model.ts
import { BaseState, Action } from 'react-imvc'

export type State = BaseState & {
  foo: number
}

export const initialState = {
  foo: 0,
}

export const ADD_FOO: Action<State> = (state) => {
  return {
    ...state,
    foo: state.foo + 1,
  }
}

export const UPDATE_FOO: Action<State, number> = (state, foo) => {
  return {
    ...state,
    foo,
  }
}
```

## 使用

在使用时，我们也通常只会使用两个部分的内容：`state` 和 `actions`，它们均为 Relite 处理后的结果。其中 `state` 保存当前数据状态，但你直接对它进行修改是无效的，想要修改数据必须通过 `actions`，这里的 `actions` 并不是我们编写的 `actions`， 而是它们柯里化之后的函数，调用这些函数时，不需要再传 `state`，而只需要传 `payload`，使用示例如下：

```ts
// get the `foo`
let foo = state.foo

// change the `foo`
actions.ADD_FOO()
actions.UPDATE_FOO(0)
```

而 `state` 和 `actions` 我们可以通过三种方式获取。

- 在 Controller 中，我们在 Controller 中我们存有 Relite 处理的后的直接产物 `store` 对象，所以我们可以直接通过以下方式拿到 `state` 和 `actions`：

```ts
import Controller from 'react-imvc/controller'

class Some extends Controller<Model.State, Actions> {

  doSomethings() {
    const state = this.store.getState()
    const actions = this.store.actions

    ...
  }
}
```

- 在 View 中，我们会以参数的形式将 `state` 和 `actions` 传入 View 组件中，即：

```ts
type Props = {
  state: State,
  ctrl: Controller
}
function View({ state, actions }) {
  ...
}
```

- 当 View 中组建嵌套层次太深，使用第二种方法，就必须将 `state` 和 `actions` 层层传递，这带来了很大的不便和代码量，所以我们提供了 hooks 的方式来获得它们：

```ts
import {
  useModelActions,
  useModelState,
  useModel
} from 'react-imvc/hook'

function View() {
  const model = useModel<Model.State, Actions>()
  const actions = useModelActions<Model.State, Actions>()
  const state = useModelState<Model.State>()

  ...
}
```
