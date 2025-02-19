# 组件

React-IMVC 有一些内置的 React Component，可以便利地实现某些特定需求，使用方法如下：

```ts
import { Link, Style } from 'react-imvc/component'
// your code here
```

## ControllerProxy

`ControllerProxy` 把 React 组件生命周期同步到 `ctrl` 里。根据 state 更新 document.title。

### Props

- controller

类型：Controller

所要代理的 Controller。

## ErrorBoundary

新增了 `ErrorBoundary` 组件，可以便捷地对单一组件进行特殊的错误处理。

注意：该组件包裹的元素，将脱离全局 `getComponentFallback` 生命周期，走它自身的 `fallback` 处理逻辑。但依然会内部上抛错误给 `ctrl.errorDidCatch`。

```tsx
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

## EventWrapper

`EventWrapper` 组件，提供传递事件 `handler` 的快捷通道。

所有以 `handle{EventName}` 为形式的 `props`，如果在 `controller[handle{EventName}]` 里也存在，将被替换为 `controller` 的事件处理方法。

```tsx
<EventWrapper onClick="handleClick" onTouchMove="handleTouchMove">
  我是一些内容
</EventWrapper>
```

## Input

`Input` 组件，用来将表单跟 `store` 联系起来。

```tsx
import React from 'react'
import Controller from 'react-imvc/controller'
import { Input } from 'react-imvc/component' // 加载 Input 组件

export default class extends Controller {
  View = View
  // 可以在 Controller 里直接写 initialState
  initialState = {
      // 多层次对象
    user: {
      name: {
        first: '',
        last: '',
      },
      email: '',
      age: 0
    },
    // 数组对象
    friends: [{
      name: 'friendA',
    }, {
      name: 'friendB',
    }],
    // 复合对象
    phone: {
      value: '',
      isValid: false,
      isWarn: false,
    },
    content: ''
  }
}

/**
* Input 组件支持 path 写法，支持数组
* 可以用 .:/ 三种分隔符书写 path
* 不需要写 value，Input 组件会
* 使用 transformer 属性，可以在更新 store 之前做数据处理
* 使用 check 属性，可以验证字段
* 使用 as 属性，可以自定义渲染标签
*/
function View({ state }) {
  return (
    <div>
      firstname: <Input name="user.name.first" />
      lastname: <Input name="user:name:last" />
      email: <Input name="user/email" />
      age: <Input name="user.age" transformer={Number} >
      friends: {
        state.friends.map((friend, index) => {
          return (
            <div>
              name: <Input name={`friends/${index}/name`} />
            </div>
          )
        })
      }
      phone: <Input name="phone" check={isValidPhone} />
      content: <Input as="textarea" name="content" />
    </div>
  )
}
```

`Input` 组件的 `transformer` 属性接受两个参数 `transformer(newValue, oldValue)`，其返回值将作为最后更新到 `store` 的 `value`。

当 `Input` 组件传入了 `check` 属性时，它将被视为复合对象 `{ value, isValid, isWarn }` 三个属性，它有以下行为：

- 当用户 `blur` 脱离表单焦点时，使用 `check` 函数检查 `value` 值，如果 `check` 函数返回 `true`，则 `isValid = true`，`isWarn = false`。
- 当用户 `focus` 聚焦表单时，取消 `isWarn = false` 的状态。
- 在将 `input.value` 更新到 `store` 时，会自动补全 `${name}.value` 更新 `state`。

`Input` 组件默认渲染为 `input` 标签，可以使用 `as` 属性将它渲染成 `textarea` 标签或其他可以触发 `onChange` 方法的组件。

## Link

`Link` 组件，可以用来实现页面的单页路由跳转效果。

```tsx
<Link to="/list">去列表页</Link>
<Link to="/list" prefetch>预加载列表页的 js 文件</Link>
<Link to="/list" replace>以替换历史记录的方式去列表页</Link>
<Link as='span' to="/list">默认展示为 a 标签，as 属性可以替换为 span 或其他标签或组件</Link>
<Link back>回退</Link>
<Link forward>前进</Link>
<Link go={-2}>回退到上上个页面</Link>
<a href="/path/to/tradition">传统风格的链接，直接用 a 标签即可</a>
```

> <b>TIP history</b>
>
> 以下提到的 history 皆为：[create-history](https://github.com/tqma113/history)。

### Props

所有属性都是可选的。

- as

类型：`keyof HTMLElementTagNameMap`

默认值：`a`

作为什么标签展示（如 div、button 等）。

- to

类型：`string | BaseLocation`

跳转目标路径。

- href

类型：`string`

当 `to` 属性无效视，使用当前属性的路径进行跳转。

- replace

类型：`boolean`

默认值：`false`

标识当前路径跳转时，使用的方式，默认使用方式是 `PUSH`（运行 `history.push()`），当当前属性为 `true` 时，使用 `REPLACE`（运行 `history.replace()`）。

- back

类型：`boolean`

默认值：`false`

当当前属性为真时，运行 `history.goback()`。

- forward

类型：`boolean`

默认值：`false`

当当前属性为真时，运行 `history.goforward()`。

- go

类型：`number`

默认值：`undefined`

当当前属性有效时，运行 `history.go()`。

- prefetch

类型：`boolean`

默认值：`undefined`

当当前属性有效时，当前组件会认为当前行为是一个静态资源在家行为呢，病加载 `to` 属性或 `href` 属性所指向的资源。

属性权重：`prefetch` > `back` > `forward` > `go` > `replace` > `to` > `href`。

## NavLink

`NavLink` 组件，跟 [Link](#link) 类似，可以用来实现页面的单页路由跳转效果。除此之外，它还具备响应当前 url 激活状态的能力。

使用示例：

```tsx
<NavLink
  to="/list"
  activeClassName="active"
  activeStyle={{ color: 'red' }}
  isActive={(path, location) => boolean}
>
  列表
</NavLink>
```

### Props

- isActive（可选）

类型：`{ (...args: any[]): boolean }`

- location

类型：`Location`

用于判断是否是当前的所在路由。

- className（可选）

类型：`string`

添加当前组件的类名。

- activeClassName

类型：`string`

当 `to` 属性跟当前 url 匹配时，添加到 DOM 元素上的 `className`。

- children（可选）

类型：`React.ReactChild`

将之添加至当前组件的 Children 中。

- style（可选）

类型：`object`

当前组件样式。

- activeStyle（可选）

类型：`object`

当 `to` 属性跟当前 url 匹配时，添加到 DOM 元素上的 `style` 样式

- to

类型：`string | BaseLocation`

跳转目标路径。

- activeClassName: 当 to 属性跟当前 url 匹配时，添加到 DOM 元素上的 className 名
- activeStyle: 当 to 属性跟当前 url 匹配时，添加到 DOM 元素上的 style 样式
- isActive: 可选，类型必须为 function，接受两个参数 path 和 location，返回 boolean
  当没有 isActive 属性时，匹配方式为 path === location.raw
  当提供了 isActive 函数是，匹配方式为 !!isActive(path, location)

## OuterClickWrapper

`OuterClickWrapper` 组件，提供特殊的 `onClick` 功能，只有当用户点击了该组件包裹的内容之外的区域时，`onClick` 事件才会触发。

```tsx
<OuterClickWrapper onClick={() => console.log('点击了外层区域')}>
  <div>我是内层区域，点击我不会触发 outer click 事件</div>
</OuterClickWrapper>
```

## Prefetch

`Prefetch` 组件，可以预加载特定页面的 js bundle 文件。

```tsx
import { Prefetch } from 'react-imvc/component'
;<Prefetch src="/detail" /> // 预加载详情页的 js 文件
```

### Props

- src

类型：`string`

要价在的资源地址。

## Script

`Script` 组件，用来防范 `querystring` 的 [XSS](https://developer.mozilla.org/zh-CN/docs/Glossary/Cross-site_scripting) 风险，放置 `window.__INITIAL_STATE` 里执行恶意代码。

```tsx
import React from 'react'
import Script from '../component/Script'
;<Script>
  {`
    (function() {
        window.__INITIAL_STATE__ = ${JSON.stringify(props.initialState)}
        window.__APP_SETTINGS__ = ${JSON.stringify(props.appSettings)}
        window.__PUBLIC_PATH__ = '${props.publicPath}'
    })()
`}
</Script>
```

### Props

- children

类型：`string`

要运行的代码。

## Style

`Style` 组件，用来将 `ctrl.preload` 里配置的 css，展示在页面上。

```tsx
import React from 'react'
import Controller from 'react-imvc/controller'
import { Style } from 'react-imvc/component' // 加载 Style 组件

export default class extends Controller {
  preload = {
    main: 'path/to/css', // 配置 css 文件路径
  }
  View = View
}

// 当组件渲染时，Style 标签会将 preload 里的同名 css 内容，展示为 style 标签。
function View() {
  return (
    <div>
      <Style name="main" />
    </div>
  )
}
```

### Props

- name

类型：`string`

对应的资源名。
