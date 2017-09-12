# React-IMVC 文档

## 目录索引

- [What is IMVC](#what-is-imvc)
- [Why Controller](#why-controller)
- [Controller Property](#controller-property)
- [Controller API](#controller-api)
- [Controller Life Cycle Method](#controller-life-cycle-method)
- [Userful Components](#useful-components)

## What is IMVC

IMVC 的 I 是`Isomorphic`的缩写，意思是同构，在这里是指，一份 `JavaScript` 代码，既可以在 `Node.js` 里运行，也可以在 `Browser` 里运行。

IMVC 的 M 是 `Model` 的缩写，意思是模型，在这里是指，状态及其状态变化函数的集合，由 `initialState` 状态和 `actions` 函数组成。

IMVC 的 V 是 `View` 的缩写，意思是视图，在这里是指，`React` 组件。

IMVC 的 C 是指 `Controller` 的缩写，意思是控制器，在这里是指，包含生命周期方法、事件处理器、同构工具方法以及负责同步 `View` 和 `Model` 的中间媒介。

react-imvc 里的 MVC 三个部分都是 `Isomorphic` 的，所以它可以做到：只编写一份代码，在 `Node.js` 里做 `Server-Side-Rendering` 服务端渲染，在 `Browser` 里做 `Client-Side-Rendering` 客户端渲染。

## Why Controller

在 react-imvc 的 `Model` 里， `state` 是 `immutable data`，`action` 是 `pure function`，不建议包含 `side effect` 副作用。

react-imvc 的 `View` 是 React.js，建议尽可能使用 `functional stateless component` 写法，不建议包含 `side effect` 副作用。

然而，`side effect` 副作用是跟外界交互的必然产物，只可能被隔离，不可能被消灭。所以，我们需要一个承担 `side effect` 的对象，它就是 `Controller`。

`Life-Cycle method` 是副作用来源，`Ajax/Fetch` 也是副作用来源，`Event Handler` 事件处理器也是副作用来源，`localStorage` 也是副作用来源，它们都应该在 `Controller` 这个 `ES2015 classes` 里，用面向对象的方式来处理。

一个 `web app` 包含多个 `page` 页面，每个 `page` 都由 MVC 三个部分组成。

每个 `page` 都是一个文件夹，里面必须包含一个 `Controller.js` 文件，作为该页面的入口文件。

```javascript
// /my_page/Controller.js
import Controller from 'react-imvc/controller' // Controller 基类里实现了许多方法，子类 Controller 要避免使用同名方法

export default class extends Controller {
    // your code
} 
```

## Controller Property

### controller.name -> string

controller 的 name 属性，用以显示在 logger 里，方便区分不同 controller 的 action logger。

如果没有这个 name 属性，action logger 里将显示跟 controller 匹配的 router path pattern。

### controller.location -> object

controller.location 是 react-imvc 里自动根据 url 和 router path pattern 生成的类 window.location 对象。

其文档为：https://github.com/Lucifier129/history/blob/master/docs/Location.md

除了上述文档介绍的 { pathname ,search, hash, action, state } 以外，还有下面几个拓展属性

- location.query 为当前 url 的查询字符串反序列化之后的对象
    - 当 url 为 `/list?search=test&type=1` 时
    - location.query 为 { search: 'test', type: '1' }

- location.pattern 跟当前 controller 对应的 router path pattearn，写法来自 [path-to-regexp](https://github.com/pillarjs/path-to-regexp)

- location.params 是用 path-to-regexp 解析出来的路径参数
    - 当 pattern 为 `/user/:id`，url 为 `/user/123` 时
    - location.params 为 { id: '123' }

- location.raw 是 pathname + search 的拼接结果

### controller.history -> object

controller.history 是一个类 window.history 的对象，可查看其[文档](https://github.com/Lucifier129/history)

controller.history 包含的 push/replace/goBack/goForward 等方法，可以用在 Event Handler 事件处理器里手动进行页面跳转。

### controller.context -> object

controller.context 是一个特殊对象，所有 controller 实例都共享同一个 context 对象，可以利用 context 对象储存一些跨页面共享的数据。

不过，不建议滥用 context 对象。

react-imvc 默认把一些基本信息填充在 context 对象里，比如

- context.isClinet 是否在客户端

- context.isServer 是否在服务端

- context.basename 当前 web app 的 basename

- context.publicPath 当前 web app 的静态资源的发布路径，默认是 basename + '/static'

- context.restapi 当前 web app 的 restfull api 的 url 前缀

- context.preload 缓存预加载资源的对象

- context.prevLocation 上一个页面的 location 对象，方便当前页面判断来源

### controller.View -> React Component

controller.View 属性，应该是一个 React Component 组件。该组件的 props 结构如下

- props.state 是 controller.store.getState() 里的 global state 状态树
- props.handlers 是 controller 实例里，以 handleXXX 形式定义的事件处理器的集合对象
- props.actions 是 controller.store.actions 里的 actions 集合对象

React 的用法可以查阅其[官方文档](https://facebook.github.io/react/)

### controller.BaseView -> React Component

controller.BaseView 属性，会在渲染时作为 controller.View 组件的父组件。

当两个 page 共享同一个 BaseView 组件时，可以在 BaseView 组件内通过 `props.children` 和 `nextProps.children` 拿到两个 view，做一些转场动画。

### controller.Model -> object -> { initialState, ...actions }

controller.Model 属性，是一个对象，除了 initialState 属性之外，其余属性都是 pure function。

Model 属性将被用来创建 controller.store, `store = createStore(actions, initialState)`

创建 store 使用的是 redux-like 的库 relite。可以查阅其[文档](https://github.com/Lucifier129/relite)

### controller.initialState -> object

如果不使用 controller.Model 属性，可以把 intialState 直接赋值给 controller

### controller.actions -> object

如果不使用 controller.Model 属性，可以把 actions 直接赋值给 controller

### controller.store -> object

由 controller.Model 创建出来的 store，内部用的是 relite，可以查阅其[文档](https://github.com/Lucifier129/relite)

store 里的 global state，默认数据有几个来源

- controller.initialState 或 controller.Model.initialState

- react-imvc 会把 context 里的 { basename, publicPath, restapi, isClient, isServer } 对象填充进 state

- react-imvc 会把 controller.location 对象填充至 state.location 里。

### controller.preload -> object

controller.preload 对象用来在页面显示前，预加载 css, json 等数据。

```javascript
class extends Controller {
    preload = {
        'main': '/path/to/css'
    }
}
```

### controller.SSR -> boolean

当 controller.SSR = true 时，开启服务端渲染的特性。默认为 true。

如果全局配置 config.SSR === false，则全局关闭服务端渲染，controller.SSR 不会起作用。

### controller.KeepAlive -> boolean

当 controller.KeepAlive = true 时，开启缓存模式。默认为 false|undefined

KeepAlive 不会缓存 view，而是缓存 controller 及其 store。

当页面前进或后退时，不再实例化一个新的 controller，而是从缓存里取出上次的 controller，用它的 store 重新渲染 view。并触发 `pageDidBack` 生命周期。

### controller.handlers -> object

controller.handlers 是在初始化时，从 controller 的实例里收集的以 handle 开头，以箭头函数形式定义的方法的集合对象。用来传递给 controller.View 组件。

### controller.Loading -> React Component

当 controller.SSR = false 时，如果 controller.Loading 有值，将渲染 controller.Loading 组件

## Controller API

### controller.fetch(url=string, options=object)

fetch 方法用来跟服务端进行 http 或 https 通讯，它的用法和参数跟浏览器里自带的 fetch 函数一样。全局 fetch 函数的[使用文档](https://github.github.io/fetch/)

- controller.fetch 默认为 headers 设置 Content-Type 为 application/json

- controller.fetch 默认设置 credentials 为 include，即默认发送 cookie

- controller.fetch 默认内部执行 response.json()，最终返回的是 json 数据
    - 当 options.json === false 时，取消上述行为，最终返回的是 response 对象

- controller.API 属性存在时，controller.fetch(url, options) 会有以下行为
    - 内部会对 url 进行转换 `url = controller.API[url] || url` 
    - 该特性可以将 url 简化为 this.fetch(api_name)

- 当全局配置 config.restapi 存在，且 url 为非绝对路径时，controller.fetch(url, options) 会有以下行为
    - 内部会对 url 进行转换 `url = config.restapi + url`
    - 当 options.raw === true 时，不做上述转换，直接使用 url

 - 当 options.timeout 为数字时，controller.fetch 将有以下行为
    - options.timeout 时间内，服务端没有响应，则 reject 一个 timeout error
    - 超时 reject 不会 abort 请求，内部用 `Promise.race` 忽略服务端请求的结果

- 当 url 以 /mock/ 开头时
     - 内部会对 url 进行转换 `url = config.basename + url`
     - 该特性提供在本地简单地用 json 文件 mock 数据的功能
     - 当 options.raw === true 时，不做上述转换，直接使用 url

### controller.post(url=string, data=object)

controller.post 方法是基于 controller.fetch 封装的方法，更简便地发送 post 请求。

url 参数的处理，跟 controller.fetch 方法一致。

data 参数将在内部被 JSON.stringify ，然后作为 request payload 发送给服务端

### controller.prependBasename(url=string)

controller.prependBasename 方法，在 url 不是绝对路径时，把全局 config.basename 拼接在 url 的前头。

url = config.basename + url

### controller.prependPublicPath(url=string)

controller.prependPublicPath 方法，在 url 不是绝对路径时，把全局配置 config.publicPath 拼接在 url 的前头。

url = config.publicPath + url


### controller.prependRestapi(url=string)

controller.prependRestapi 方法，在 url 不是绝对路径时，把全局配置 config.restapi 拼接在 url 的前头。

url = config.restapi + url

如果 url 是以 /mock/ 开头，将使用 controller.prependBasename 方法。

注：controller.fetch 方法内部对 url 的处理，即是用到了 controller.prependRestapi 方法

### controller.redirect(url=string, isRaw=boolean)

controller.redirect 方法可实现重定向功能。

- 如果 url 是绝对路径，直接使用 url
- 如果 url 不是绝对路径，对 url 调用 controller.prependBasename 补前缀
- 如果 isRaw 为 true，则不进行补前缀

注意，重定向功能不是修改 location 的唯一途径，只有在需要的时候使用，其它情况下，考虑用 controller.history 里的跳转方法。

### controller.getCookie(key=string)

controller.getCookie 用以获取 cookie 里跟 key 参数对应的 value 值。

### controller.setCookie(key=string, value=string, options=object)

controller.setCookie 用以设置 cookie 里跟 key 参数对应的 value 值。第三个参数 options 为对象，可查看[使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)

### controller.removeCookie(key=string, options=object)

controller.removeCookie 用以删除 cookie 里跟 key 参数对应的 value 值。第三个参数 options 为对象，可查看[使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)

### controller.cookie(key=string, [value=string], [options=object])

controller.cookie 方法是上述 `getCookie`、`setCookie` 方法的封装。

- 当只有一个 key 参数时，内部调用 `getCookie` 方法。

- 当有两个或两个以上的参数时，内部调用 `setCookie` 方法。

### controller.saveToCache()

controller.saveToCache 方法只在客户端存在，用以手动将 controller 加入 KeepAlive 缓存里。

### controller.removeFromCache()

controller.removeFromCache 方法只在客户端存在，用以手动将 controller 从 KeepAlive 缓存里清除。

### controller.refreshView()

controller.refreshView 方法只在客户端存在，用当前的 state 刷新视图。


## Controller Life Cycle Method

Controller 具有以下生命周期方法，执行顺序为：

```shell
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

### Controller.getInitialState(initialState)

controller.getInitialState 方法会在 createStore 之前执行，它应该返回一个对象，作为 createStore 的 initialState 参数。

该方法的作用是，提供在运行时确定 initialState 的能力。比如从 cookie、storage、或者 server 里获取数据。

该方法内，不可以使用 `this.store.acitons`，因为 store 还未创建。

该方法支持 promise，如果使用了 async/await 语法，或者 return promise，后面的生命周期方法将会等待它们 resolve。

### Controller.shouldComponentCreate()

controller.shouldComponentCreate 方法触发时，view 还未被创建和渲染，如果该方法返回 false，将终止后续的生命周期活动。

该方法的设计目的，是鉴定权限，如果用户没有权限访问该页面，可以通过 `this.redirect` 方法，重定向到其他页面。

该方法内，可以使用 `this.store.actions`，调用 action 函数只会更新 store 里的 state，不会引起 view 的渲染。

该方法支持 promise，如果使用了 async/await 语法，或者 return promise，后面的生命周期方法将会等待它们 resolve。

### Controller.componentWillCreate()

controller.componentWillCreate 方法触发时，view 还未被创建和渲染，可以在该方法内调用接口，获取首屏数据。

该方法内，可以使用 `this.store.actions`，调用 action 函数只会更新 store 里的 state，不会引起 view 的渲染。

该方法支持 promise，如果使用了 async/await 语法，或者 return promise，后面的生命周期方法将会等待它们 resolve。

### Controller.componentDidFirstMount()

controller.componentDidFirstMount 方法触发时，用户已经看到了首屏，可以在该方法内，调用接口，获取非首屏数据。

该方法内，可以使用 `this.store.actions`，调用 action 函数除了更新 store 里的 state，还会引起 view 的渲染。

该方法以及之后的所有生命周期方法里，返回 promise 不再会影响后续生命周期的执行。

### Controller.componentDidMount()

controller.componentDidMount 方法触发时，react component 已经 mount 到页面上。

可以在该方法内，进行 DOM 操作，绑定定时器等浏览器里相关的活动。

需要注意的是，该方法在 controller 的生命周期内，可能不止运行一次。

### Controller.componentWillUnmount()

controller.componentWillUnmount 方法触发时，react component 即将从页面里 unmount。

可以在该方法内，完成解绑定时器等跟 `componentDidMount` 相关的逆操作。

需要注意的是

    - 该方法在 controller 的生命周期内，可能不止运行一次。
    - pageWillLeave 比 componentWillUnmount 更早执行
    - 当 next page 的 view/component 要渲染时，才会触发 prev page 的 componentWillUnmount
    - 可以在 pageWillLeave 里 showLoading，知道它被 next page 替换。

### Controller.pageWillLeave()

controller.pageWillLeave 方法在页面即将跳转到其他 page 前触发，如果该方法返回一个 string 类型，将作为提示给用户的话术出现。

如果用户点击「取消」，页面不会跳转，继续停留在当前页面。

该方法的设计目的是

    - 提示用户有表单未填写
    - 将用户信息缓存在 localStorage 或者 server 端

### Controller.pageDidBack()

controller.pageDidBack 方法在 controller.KeepAlive 为 true 时，才会生效，在用户通过 history 回退/前进时触发。

pageDidBack 里同步的执行 action 将不会引起 view 渲染，此时 view 还未渲染，异步执行 action 则会引起 view 渲染。

该方法比（第二次或第二次以上的） `componentDidMount` 生命周期更早执行。


### Controller.windowWillUnload()

controller.windowWillUnload() 方法跟 `pageWillLeave` 方法性质类似，只是触发时机为用户关闭窗口。

在该方法内返回一个 string 类型，将作为提示给用户的话术出现。不同的浏览器可能有不同的限制，用户看到的话术有可能是浏览器默认的，而非自定义的。

### Controller.stateDidChange(data)

controller.stateDidChange 是一个特殊的生命周期，当 store 里的 state 发生变化，并且 view 也根据 state 重新渲染后，该方法将被触发。

该方法会接收到一个 data 参数，记录了 action 的 type、payload、currentState、previousState 等信息，可查阅[文档](https://github.com/Lucifier129/relite#create-store-by-actions-and-initialstate)

该方法并不常用。设计目的为，当某个 action 触发时，固定执行某些操作。

比如，当某个 `SHOW_POP` 触发时，1 秒后触发 `HIDE_POP`。

比如，当 `UPDATE_USER` 触发时，调用 fetch 方法，更新数据到 server 端等等。