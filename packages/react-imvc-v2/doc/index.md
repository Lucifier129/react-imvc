# React-IMVC 文档

## 目录索引

-   [What is IMVC](#what-is-imvc)
-   [Why Controller](#why-controller)
-   [Controller Property](#controller-property)
-   [Controller API](#controller-api)
-   [Controller Life Cycle Method](#controller-life-cycle-method)
-   [Controller Method Name You Should Not Use](#controller-method-name-you-should-not-use)
-   [Event Handler](#event-handler)
-   [Useful Components](#useful-components)
-   [Hooks Api](#hooks-api)
-   [Use Typescript](#use-typescript)
-   [Npm Scripts](#npm-scripts)
-   [Nodejs API](#nodejs-api)
-   [IMVC Configuration](#imvc-configuration)
-   [Title Keywords Description](#title-keywords-description)
-   [Server Development](#server-development)
-   [Custom Layout](#custom-layout)
-   [High Order Component](#high-order-component)
-   [Config Babel](#config-babel)
-   [Config Webpack](#config-webpack)
-   [Error Handling](#error-handling)
-   [FAQ](#faq)

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

### controller.location -> object

controller.location 是 react-imvc 里自动根据 url 和 router path pattern 生成的类 window.location 对象。

其文档为：https://github.com/Lucifier129/history/blob/master/docs/Location.md

除了上述文档介绍的 { pathname ,search, hash, action, state } 以外，还有下面几个拓展属性

-   location.query 为当前 url 的查询字符串反序列化之后的对象

    -   当 url 为 `/list?search=test&type=1` 时
    -   location.query 为 { search: 'test', type: '1' }

-   location.pattern 跟当前 controller 对应的 router path pattearn，写法来自 [path-to-regexp](https://github.com/pillarjs/path-to-regexp)

-   location.params 是用 path-to-regexp 解析出来的路径参数

    -   当 pattern 为 `/user/:id`，url 为 `/user/123` 时
    -   location.params 为 { id: '123' }

-   location.raw 是 pathname + search 的拼接结果

### controller.history -> object

controller.history 是一个类 window.history 的对象，可查看其[文档](https://github.com/Lucifier129/history)

controller.history 包含的 push/replace/goBack/goForward 等方法，可以用在 Event Handler 事件处理器里手动进行页面跳转。

### controller.context -> object

controller.context 是一个特殊对象，所有 controller 实例都共享同一个 context 对象，可以利用 context 对象储存一些跨页面共享的数据。

不过，不建议滥用 context 对象。

react-imvc 默认把一些基本信息填充在 context 对象里，比如

-   context.isClient 是否在客户端

-   context.isServer 是否在服务端

-   context.basename 当前 web app 的 basename

-   context.publicPath 当前 web app 的静态资源的发布路径，默认是 basename + '/static'

-   context.restapi 当前 web app 的 restful api 的 url 前缀

-   context.preload 缓存预加载资源的对象（server 的 preload 不会传递给 client，而是由 client 端使用 DOM 收集 [data-preload] 节点的内容，比如 css。）

-   context.prevLocation 上一个页面的 location 对象，方便当前页面判断来源（只在 client 端存在）

`publicPath` 在开发模式下指向 `src` 目录，在生产环境默认指向编译后的目录 `static`，可以使用 `publicPath` 引入本地静态资源。

```javascript
<img src={`${state.publicPath}/page/home/image/logo.png`} />
<script src={`${state.publicPath}/lib/jquery.min.js`} />
```

注意：除了上述列举的几个字段外，在 context 里的其余字段不会从 server 端被传递到 client 端，这样可以保证 client 端不依赖服务端的 context，可以独立工作。

### controller.View -> React Component

controller.View 属性，应该是一个 React Component 组件。该组件的 props 结构如下

-   props.state 是 controller.store.getState() 里的 global state 状态树
-   props.handlers 是 controller 实例里，以 handleXXX 形式定义的事件处理器的集合对象
-   props.actions 是 controller.store.actions 里的 actions 集合对象

React 的用法可以查阅其[官方文档](https://facebook.github.io/react/)

### controller.Model -> object -> { initialState, ...actions }

controller.Model 属性，是一个对象，除了 initialState 属性之外，其余属性都是 pure function。

Model 属性将被用来创建 controller.store, `store = createStore(actions, initialState)`

创建 store 使用的是 redux-like 的库 relite。可以查阅其[文档](https://github.com/Lucifier129/relite)

### controller.initialState -> object

如果不使用 controller.Model 属性，可以把 intialState 直接赋值给 controller。

当同时使用 Model 和 initialState 属性时，以 Model 的 initialState 为准。

### controller.actions -> object

如果不使用 controller.Model 属性，可以把 actions 直接赋值给 controller

当同时使用 Model 和 actions 属性时，以 Model 里的 actions 为准。

### controller.store -> object

由 controller.Model 创建出来的 store，内部用的是 relite，可以查阅其[文档](https://github.com/Lucifier129/relite)

store 里的 global state，默认数据有几个来源

-   controller.initialState 或 controller.Model.initialState

-   react-imvc 会把 context 里的 { basename, publicPath, restapi, isClient, isServer } 对象填充进 state

-   react-imvc 会把 controller.location 对象填充至 state.location 里。

### controller.preload -> object

controller.preload 对象用来在页面显示前，预加载 css, json 等数据。

`preload` 的根目录是 `src` 目录，在 css 文件中，可以使用 `@public_path/` 占位符，它会被替换成 context.publicPath 的值。

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

controller.SSR 可以是函数，当它是函数时，它会得到两个参数: location 和 context 对象（你也可以直接用 `this.location` 或 `this.context` 访问到）。

此时，`controller.SSR(location, context)` 应当返回一个 boolean 值，返回 true 则是服务端渲染，返回 false 则不做服务端渲染。

注：`controller.SSR` 函数可以是 async function（异步函数）。

通过这个特性，可以对一个页面进行异步的条件判断，决定是否服务端渲染。

```javascript
class extends Controller {
    // 这个判断可以实现，当 url 里的查询字符串参数 ssr=1 时，才做服务端渲染。
    SSR = this.location.query.ssr === '1'
}
```

### controller.KeepAlive -> boolean

当 controller.KeepAlive = true 时，开启缓存模式。默认为 false|undefined

KeepAlive 会缓存 view，controller 及其 store。

当页面前进或后退时，不再实例化一个新的 controller，而是从缓存里取出上次的 controller，并展示它的 view （通过设置 dispaly）。并触发 `pageDidBack` 生命周期。

### controller.KeepAliveOnPush -> boolean

当 controller.KeepAliveOnPush = true 时，当页面通过 history.push 到另一个页面时，缓存当前页面。当页面回退到上一个页面时，清除当前页面的缓存。

该属性可以实现只为下一个新页面的提供缓存功能。

注：浏览器把前进/后退都视为 POP 事件，因此 A 页面 history.push 到 B 页面，B 页面 history.back 回到 A 时为 POP，A 页面再 history.forward 到 B 页面，也是 POP。KeepAliveOnPush 无法处理该场景，只能支持一次性来回的场景。

### controller.handlers -> object

controller.handlers 是在初始化时，从 controller 的实例里收集的以 handle 开头，以箭头函数形式定义的方法的集合对象。用来传递给 controller.View 组件。

### controller.Loading -> React Component

当 controller.SSR = false 时，如果 controller.Loading 有值，将渲染 controller.Loading 组件

### controller.API -> object

当 controller.API 存在时，将影响 controller.fetch|get|post 的行为，见[controller.fetch](#controllerfetchurlstring-optionsobject)

### controller.restapi -> string

当 controller.restapi 存在时，用 restapi 覆盖全局配置的 restapi，作为 fetch 方法的前缀补全

### controller.resetScrollOnMount -> boolean

当 controller.resetScrollOnMount = true 时，在页面 DidMount 时将自动引入滚动至顶部的副作用。不想引入此副作用，请给置为 false。默认为 true

### controller.disablePublicPathForPreload -> boolean

是否在 preload 里禁用 publicPath，默认为 false，只对 CRS 生效。如果为 true，会直接使用 node.js 服务端的静态资源路径

### controller.publicPathPlaceholder -> string

如果 preload 里的 css 文件里的图片等资源需要使用 publicPath，但是又不想在 preload 里写死 publicPath，可以使用该字段，

默认为 `@public_path`，在 preload 里写 `@public_path`，会在运行时被替换为 controller.context.publicPath

## Controller API

### controller.fetch(url=string, options=object)

fetch 方法用来跟服务端进行 http 或 https 通讯，它的用法和参数跟浏览器里自带的 fetch 函数一样。全局 fetch 函数的[使用文档](https://github.github.io/fetch/)

-   controller.fetch 默认为 headers 设置 Content-Type 为 application/json

-   controller.fetch 默认设置 credentials 为 include，即默认发送 cookie

-   controller.fetch 默认内部执行 response.json()，最终返回的是 json 数据

    -   当 options.json === false 时，取消上述行为，最终返回的是 response 对象

-   controller.API 属性存在时，controller.fetch(url, options) 会有以下行为

    -   内部会对 url 进行转换 `url = controller.API[url] || url`
    -   该特性可以将 url 简化为 this.fetch(api_name)

-   当全局配置 config.restapi 存在，且 url 为非绝对路径时，controller.fetch(url, options) 会有以下行为

    -   内部会对 url 进行转换 `url = config.restapi + url`
    -   当 options.raw === true 时，不做上述转换，直接使用 url

-   当 options.fetch 存在，且时 function 类型时

    -   框架使用自定义的 options.fetch 方法替换原本的 fetch 方法
    -   建议自定义的 options.fetch 方法的 interface 与浏览器自带的 fetch 保持一致

-   当 options.timeout 为数字时，controller.fetch 将有以下行为

    -   options.timeout 时间内，服务端没有响应，则 reject 一个 timeout error
    -   超时 reject 不会 abort 请求，内部用 `Promise.race` 忽略服务端请求的结果

-   当 options.timeoutErrorFormatter 和 optons.timeout 同时存在时，有以下行为：

    -   当 timeoutErrorFormatter 为字符串，它将作为超时 reject 的 error.message
    -   当 timeoutErrorFormatter 为函数是，它将接受一个参数 `{ url, options }` 包含 fetch 方法最终发送的 url 和 options 等信息。该函数的返回值，作为超时 reject 的 error.message。

-   当 url 以 /mock/ 开头时
    -   内部会对 url 进行转换 `url = config.basename + url`
    -   该特性提供在本地简单地用 json 文件 mock 数据的功能
    -   当 options.raw === true 时，不做上述转换，直接使用 url

### controller.get(url=string, params=object, options=object)

controller.get 方法是基于 controller.fetch 封装的方法，更简便地发送 get 请求。

url 参数的处理，跟 controller.fetch 方法一致。

params 参数将在内部被 querystring.stringify ，拼接在 url 后面。

options 参数将作为 fetch 的 options 传递。

### controller.post(url=string, data=object, options=object)

controller.post 方法是基于 controller.fetch 封装的方法，更简便地发送 post 请求。

url 参数的处理，跟 controller.fetch 方法一致。

data 参数将在内部被 JSON.stringify ，然后作为 request payload 发送给服务端

options 参数将作为 fetch 的 options 传递。

### controller.prefetch(url=string)

controller.prefetch 用以预加载其他页面的 js bundle 文件。

其中 url 为该项目其他页面的单页地址（即不包括 basename 的部分），跟 this.history.push(url) 的字符串参数形式一样。

除了使用 prefetch 方法以外，还可以使用 `<Link prefetch to={url} />` 的 prefetch 布尔属性，或者 `<Prefetch src={url} />` 组件（见下方这两个组件的文档描述）。

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

-   如果 url 是绝对路径，直接使用 url
-   如果 url 不是绝对路径，对 url 调用 controller.prependBasename 补前缀
-   如果 isRaw 为 true，则不进行补前缀

注意

-   重定向功能不是修改 location 的唯一途径，只有在需要的时候使用，其它情况下，考虑用 controller.history 里的跳转方法。
-   在服务端调用 `this.redirect` 时，内部会通过 `throw` 中断执行，模拟浏览器跳转时的中断代码效果
-   如果在 `try-catch` 语句里使用 `this.redirect`，会有一个副作用，必须判断 catch 的是不是 `Error` 的实例

```javascript
try {
    // do something
    this.redirect(targetUrl)
} catch (error) {
    if (error instanceof Error) {
        // catch error
    }
}
```

### controller.reload

controller.reload 方法可实现刷新当前页面的功能，相当于单页应用的 window.location.reload()，通常整个页面不会刷新，而是重新实例化了一份 controller。

### controller.getCookie(key=string)

controller.getCookie 用以获取 cookie 里跟 key 参数对应的 value 值。

### controller.setCookie(key=string, value=string, options=object)

controller.setCookie 用以设置 cookie 里跟 key 参数对应的 value 值。第三个参数 options 为对象，可查看[使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)

### controller.removeCookie(key=string, options=object)

controller.removeCookie 用以删除 cookie 里跟 key 参数对应的 value 值。第三个参数 options 为对象，可查看[使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)

### controller.cookie(key=string, [value=string], [options=object])

controller.cookie 方法是上述 `getCookie`、`setCookie` 方法的封装。

-   当只有一个 key 参数时，内部调用 `getCookie` 方法。

-   当有两个或两个以上的参数时，内部调用 `setCookie` 方法。

### controller.saveToCache()

controller.saveToCache 方法只在客户端存在，用以手动将 controller 加入 KeepAlive 缓存里。

### controller.removeFromCache()

controller.removeFromCache 方法只在客户端存在，用以手动将 controller 从 KeepAlive 缓存里清除。

### controller.refreshView(ReactElement)

controller.refreshView 方法只在客户端存在，用当前的 state 刷新视图。

从 `v2.6.0` 版本开始，接受一个 ReactElement 作为参数，如果没有传递，则调用 `ctrl.render()`。

可以使用 `ctrl.refreshView(<div>test</div>)` 直接将 view 渲染到页面上。

### controller.renderView(ReactComponent)

controller.renderView 方法只在客户端生效，从参数 ReactComponent 作为 View 渲染，如果没有传递该参数，它默认为 `this.View`。

`renderView` 和 `refreshView` 的差别在于

-   refreshView 接受的参数是 `react-element`，而不是组件。
-   renderView 接受的参数是 `react-component`，而不是元素。
-   refreshView 只在客户端里存在，需要判断环境再调用
-   renderView 只在客户端里生效，但这个方法一直存在

`renderView` 的使用场景通常是：我需要渲染一个 View，它不是 ctrl.View，但它需要接受跟 ctrl.View 一样的 props。

比如根据 tab 进行单页切换时，新页面可能需要一定时间才能获取到数据，而我们需要及时的响应用户。可以在 `componentWillCreate` 里添加 `renderView`，渲染一个加载动画或者骨架屏。

```javascript
class Controller extends BaseController {
    componentWillCreate() {
        this.renderView(LoadingView)
        // ...other code
    }
}
```

### controller.combineHandlers(handlers)

controller.combineHandlers 方法被用来收集 controller 的 handleXXX 开头的实例方法，放入 controller.handlers 属性中。

除此之外，也可以通过手动调用 controller.combineHandlers 的形式，将其它需要合并进 handlers 的方法集弄进去。

## Controller Life Cycle Method

Controller 具有以下生命周期方法，执行顺序为：

```shell
getInitialState
shouldComponentCreate
componentWillCreate
viewWillHydrate
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

该方法将得到一个 initialState 参数，为当前 Controller 的 initialState。

该方法的作用是，提供在运行时确定 initialState 的能力。比如从 cookie、storage、或者 server 里获取数据。

该方法内，不可以使用 `this.store.acitons`，因为 store 还未创建。

该方法支持 promise，如果使用了 async/await 语法，或者 return promise，后面的生命周期方法将会等待它们 resolve。

### Controller.getFinalActions(actions)

controller.getFinalActions 方法在 createStore 之前执行，它应该返回一个对象，作为 createStore 的 actions 参数。

该方法将得到 actions 参数，为当前 Controller 的 actions。

该方法的作用是，提供在运行时确定 actions 的能力，比如讲多个页面共享的 shared-actions 合并进来。

该方法内，不可以使用 `this.store.acitons`，因为 store 还未创建。

该方法不支持 promise，必须立刻返回 actions

### Controller.shouldComponentCreate()

controller.shouldComponentCreate 方法触发时，view 还未被创建和渲染，如果该方法返回 false，将终止后续的生命周期活动。

该方法的设计目的，是鉴定权限，如果用户没有权限访问该页面，可以通过 `this.redirect` 方法，重定向到其他页面。

该方法内，可以使用 `this.store.actions`，调用 action 函数只会更新 store 里的 state，不会引起 view 的渲染。

该方法支持 promise，如果使用了 async/await 语法，或者 return promise，后面的生命周期方法将会等待它们 resolve。

注：react-imvc v2.2.0 开始，改变了 `this.redirect` 的行为（见其文档描述），在 `shouldComponentCreate` 里 return false 变得无意义(它不会被执行到)。

将来可能废弃该生命周期，建议使用 v2.2.0 以上的朋友们，尽量不使用这个 `shouldComponentCreate` 生命周期。

### Controller.componentWillCreate()

controller.componentWillCreate 方法触发时，view 还未被创建和渲染，可以在该方法内调用接口，获取首屏数据，以便实现 SSR 服务端渲染。

该方法内，可以使用 `this.store.actions`，调用 action 函数只会更新 store 里的 state，不会引起 view 的渲染。

该方法支持 promise，如果使用了 async/await 语法，或者 return promise，后面的生命周期方法将会等待它们 resolve。

注意：在该生命周期 fetch 数据时，需要 `await fetch(xxx)` 否则不会等待请求结果。

### Controller.viewWillHydrate()

Controller.viewWillHydrate 方法触发时，view 已经做过 SSR，但还没有做 hydrate，即还没有首次渲染。

可以在这个生命周期里，调用接口，或其它异步操作，获取 hydrate 所需的数据或组件。确保 hydrate 时，SSR/CSR 渲染结果是一致的。

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
    - 可以在 pageWillLeave 里 showLoading，直到它被 next page 替换。

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

### Controller.stateDidReuse(state)

controller.stateDidReuse 是一个特殊的生命周期。当服务端完成过渲染时，它会将 html 接口和 state 对象都返回给浏览器端；react-imvc 内部将会尝试复用服务端提供的 state，不再调用 `getInitialState`、`shouldComponentCreate` 和 `componentWillCreate` 三个生命周期方法，而是调用 `stateDidReuse` 生命周期方法。

由于服务端的 context 和浏览器端的 context 只有少数几个基础数据是共享的，其它数据则不共享。该方法可以方便地将 state 里需要缓存的对象，放进 context 对象里。

## Controller Method Name You Should Not Use

除了上述 controller 的 Properties，API 和 Life-Cycle Method 的名字以外，react-imvc 的 Controller 类还具有一些内部方法，不应在业务开发中使用它们。

它们分别是

-   meta
-   handlers
-   fetchPreload
-   init
-   destroy
-   restore
-   attachLogger
-   bindStoreWithView
-   render

## Event handler

react-imvc 建议除了把 state 从 component 里抽离出来，组成 global state 以外，也应该把 event handler 从 component 里抽离出来，写在 controller 里面，组成 global handlers 传入 View 组件内。

event handler 必须是 arrow function 箭头函数的语法，这样可以做到内部的 this 值永远指向 controller 实例，不需要 bind this，在 view 组件里直接使用即可。

```javascript
import React from 'react'
import Controller from 'react-imvc/controller'

export default class extends Controller {
    View = View
    initialState = {
        count: 0,
    }
    actions = {
        INCREMENT: (state) => ({ ...state, count: state.count + 1 }),
        DECREMENT: (state) => ({ ...state, count: state.count - 1 }),
        CHANGE_BY_NUM: (state, num) => ({
            ...state,
            count: state.count + Number(num),
        }),
    }
    // 事件处理器必须使用 arrow function 箭头函数的语法
    handleIncre = () => {
        let { INCREMENT } = this.store.actions
        INCREMENT()
    }
    // 事件处理器里使用 action 更新 global state
    handleDecre = () => {
        let { DECREMENT } = this.store.actions
        DECREMENT()
    }
    // 将特殊的索引如 index, id 或者其他信息，缓存在 DOM attribute 里
    // 在事件处理器里，从 DOM attribute 里取回
    handleCustomNum = (event) => {
        let { CHANGE_BY_NUM } = this.store.actions
        let num = event.currentTarget.getAttribute('data-num')
        CHANGE_BY_NUM(num)
    }
}

/**
 * 在 view 组件里，可以从 props 里拿到 global state 和 global event handlers
 */
function View({ state, handlers }) {
    let { handleIncre, handleDecre, handleCustomNum } = handlers
    return (
        <div>
            <h1>Count: {state.count}</h1>
            <button onClick={handleIncre}>+1</button>
            <button onClick={handleDecre}>-1</button>
            <button onClick={handleCustomNum} data-num={10}>
                +10
            </button>
        </div>
    )
}
```

### handleInputChange(path, value, oldValue) -> final value

注意：react-imvc 为 Controller 提供了一个功能性的事件处理器： `handleInputChange`。请不要用`handleInputChange`命名你的事件处理器，防止错误调用。

该方法必须跟 `Input` 组件配合，当 Input 即将要更新 global state 对象时，handleInputChange 将被触发。

该方法接受三个参数：

-   path: 当前要更新的字段的 path 路径
-   value: 当前最新的 value 值
-   oldValue：上一个 value 值

该方法的返回值将作为最终的 value 值，更新给 state。

## Useful Components

react-imvc 有一些内置的 React Component，可以便利地实现某些特定需求，使用方法如下：

```javascript
import { Link, Style } from 'react-imvc/component'
// your code here
```

### Link

Link 组件，可以用来实现页面的单页路由跳转效果。

```javascript
<Link to="/list">去列表页</Link>
<Link to="/list" prefetch>预加载列表页的 js 文件</Link>
<Link to="/list" replace>以替换历史记录的方式去列表页</Link>
<Link as='span' to="/list">默认展示为 a 标签，as 属性可以替换为 span 或其他标签或组件</Link>
<Link back>回退</Link>
<Link forward>前进</Link>
<Link go={-2}>回退到上上个页面</Link>
<a href="/path/to/tradition">传统风格的链接，直接用 a 标签即可</a>
```

### NavLink

NavLink 组件，跟 Link 类似，可以用来实现页面的单页路由跳转效果。除此之外，它还具备响应当前 url 激活状态的能力

```javascript
<NavLink to="/list" activeClassName="active" activeStyle={{ color: 'red' }} isActive={(path, location) => boolean}>
    列表
</NavLink>
```

-   activeClassName: 当 to 属性跟当前 url 匹配时，添加到 DOM 元素上的 className 名
-   activeStyle: 当 to 属性跟当前 url 匹配时，添加到 DOM 元素上的 style 样式
-   isActive: 可选，类型必须为 function，接受两个参数 path 和 location，返回 boolean
    -   当没有 isActive 属性时，匹配方式为 path === location.raw
    -   当提供了 isActive 函数是，匹配方式为 `!!isActive(path, location)`

### Script

Script 组件，用来防范 querystring 的 XSS 风险，放置 window.\_\_INITIAL_STATE 里执行恶意代码。

```javascript
import React from 'react'
import Script from 'react-imvc/component/Script'
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

### Prefetch

Prefetch 组件，可以预加载特定页面的 js bundle 文件。

```javascript
import { Prefetch } from 'react-imvc/component'
;<Prefetch src="/detail" /> // 预加载详情页的 js 文件
```

### Style

Style 组件，用来将 controller.preload 里配置的 css，展示在页面上。

```javascript
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

### Input

Input 组件，用来将表单跟 store 联系起来。

```javascript
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

Input 组件的 transformer 属性接受两个参数 `transformer(newValue, oldValue)`，其返回值将作为最后更新到 store 的 value。

当 Input 组件传入了 check 属性时，它将被视为复合对象 { value, isValid, isWarn } 三个属性，它有以下行为：

    - 当用户 blur 脱离表单焦点时，使用 check 函数检查 value 值，如果 check 函数返回 true，则 isValid = true，isWarn = false。
    - 当用户 focus 聚焦表单时，取消 isWarn = false 的状态。
    - 在将 input.value 更新到 store 时，会自动补全 `${name}.value` 更新 state。

Input 组件默认渲染为 input 标签，可以使用 `as` 属性将它渲染成 `textarea` 标签或其他可以触发 `onChange` 方法的组件。

### OuterClickWrapper

OuterClickWrapper 组件，提供特殊的 onClick 功能，只有当用户点击了该组件包裹的内容之外的区域时，onClick 事件才会触发。

```javascript
<OuterClickWrapper onClick={() => console.log('点击了外层区域')}>
    <div>我是内层区域，点击我不会触发 outer click 事件</div>
</OuterClickWrapper>
```

### EventWrapper

EventWrapper 组件，提供传递事件 handler 的快捷通道。

所有以 `handle{EventName}` 为形式的 props，如果在 controller[`handle{EventName}`] 里也存在，将被替换为 controller 的事件处理方法。

```javascript
<EventWrapper onClick="handleClick" onTouchMove="handleTouchMove">
    我是一些内容
</EventWrapper>
```

## Hooks Api

`react-imvc` v2.3.0 版本增加了对 `react-hooks` 的支持，需要同步安装 `react` 和 `react-dom` v16.8.0 或以上版本。

### useCtrl

在 react 组件里获取到当前 controller 的实例。

使用该 hooks-api，可以减少传递 handlers 的负担。

```javascript
import React from 'react'
import { useCtrl } from 'react-imvc/hook'

export default function Counter() {
    let ctrl = useCtrl()

    return <button onClick={ctrl.handleIncre} />
}
```

### useModel

在 react 组件里获取到当前 model 对应的 state 状态和 actions 行为。

使用该 hooks-api，可以减少传递 state 的负担。

```javascript
import React from 'react'
import { useModel } from 'react-imvc/hook'

export default function Counter() {
    let [state, actions] = useModel()

    return <div onClick={() => actions.INCRE()}>count:{state.count}</div>
}
```

### useModelState

在 react 组件里获取倒当前 model 对应的 state 状态。

```javascript
import React from 'react'
import { useModelState } from 'react-imvc/hook'

const Counter = () => {
    let state = useModelState()
    return state.count
}
```

### useModelActions

在 react 组件里获取到当前 store 里的 actions 对象。

使用该 hooks-api，可以减少在 controller 里添加 handler 方法。

```javascript
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

## Use Typescript

从 `v2.4.0` 版本开始，`react-imvc` 增加了对 `Typescript` 的支持。

可以在项目里添加 `.ts` 后缀的文件，即可开始编写 `Typescript` 代码。

-   可以在项目根目录下添加 `tsconfig.json` 配置 `Typescript` 编译选项（可选）
-   在 `imvc.config.js` 里添加 `useTypeCheck` 为 `true`，可以开启在命令行里输出类型检查的 LOG 信息（可选）。
    -   设置 `useTypeCheck` 为 `true` 后，必须添加 `tsconfig.json`
    -   可参考下方基础配置

```json
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["dom", "dom.iterable", "esnext"],
        "allowJs": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "preserve"
    },
    "include": ["src", "routes"]
}
```

## Npm Scripts

react-imvc 可以作为 npm scripts 里的命令来使用，总共有三个

```javascript
{
    // 最简用法
    "start": "react-imvc start",
    // 使用 querystring 将 start?{search} 的参数传递给 node 启动命令里
    "start:inspect": "react-imvc start?inspect",
    // 使用 chrome dev tool 来 inspect 你的应用，并且在执行你的代码之前就自动断点
    "start:inspect-brk": "react-imvc start?inspect-brk",
    // 使用 --config 参数，为你的应用指定一个配置文件
    "start-with-config": "react-imvc start --config ./imvc.config.js",
    // build 命令用法跟 start 类似，也可以用 --config 指定配置文件
    "build": "react-imvc build --config ./imvc.config.js",
    // test 命令使用 mocha 来运行以 -test.js 结尾的单元测试文件
    "test": "react-imvc test"
}
```

## Nodejs API

react-imvc 也提供了 node.js 里可用的 api。

通常用在部署时，用 `pm2 start ./start.js -i 4` 来启动 react-imvc 应用。

```javascript
// 设置环境变量为生产模式
process.env.NODE_ENV = 'production'
// 引入 react-imvc
var ReactIMVC = require('react-imvc')
// 引入配置
var config = require('./imvc.config')
// 将配置部分修改为生产模式
var productionConfig = {
    ...config,
    root: __dirname,
    logger: 'dev',
}
// 启动 react-imvc 应用
ReactIMVC.start({
    config: productionConfig,
})

// 除了 start 方法以外，还有 build 方法，可以对 react-imvc 项目进行构建
ReactIMVC.build({
    config: productionConfig,
})
```

### ReactIMVC.start(options)

start 方法接受一个对象参数 options

    - 如果 options.config 是一个字符串，将用 `require(options.config)` 的方式引入 config 模块
    - 如果 options.config 是一个对象，将直接使用它作为 react-imvc 的配置

### ReactIMVC.build(options)

build 方法接受一个对象参数 options

    - 如果 options.config 是一个字符串，将用 `require(options.config)` 的方式引入 config 模块
    - 如果 options.config 是一个对象，将直接使用它作为 react-imvc 的配置

## IMVC Configuration

IMVC 支持开发者自定义配置，实现灵活的功能。

默认配置及其说明，[请点击这里访问](../config/config.defaults.js)

## Title Keywords Description

有两个途径可以设置 html 文档的 Title Keywords Description 三个属性。

    - 在 imvc.config.js 文件里配置 title keywords description 的值，对所有页面生效。
    - 在 controller.store.getState() 里，存在特殊字段 `html`，其中
        * state.html.title 将作为 html 的 title 出现
        * state.html.keywords 将作为 html 的 keywords 出现
        * state.html.description 将作为 html 的 description 出现

## Server Development

如果需要为 react-imvc 开发一些 server 端的中间件，可以在根目录下新建文件夹 `routes`，新增 `routes/index.js` 文件

```javascript
// routes/index.js
export test from './test'
```

react-imvc 将会 `require(routes)` 并把它们 apply 到 express app 里。

每个路由应该是一个文件夹，然后输出到 `routes/index.js` 文件里。

一个典型的中间件写法如下：

```javascript
// routes/test/index.js

// 引入 express router
import { Router } from 'express'
// 创建 router
const router = Router()

// 输出一个函数，该函数可以拿到 expres app 和 http server 两个参数
export default function (app, server) {
    app.use('/restapi', router) // 将 router 挂载到 express app 里
    server.on('error', (error) => {
        // 对 server 进行一些处理
        console.log('error', error)
    })
}

// 编写 router 中间件
router.get('/admin', (req, res) => {
    res.render('test/view', {
        // view path 在 routes 目录下，所以 test/view 就是 routes/test/view.js 文件
        name: 'Jade Gu',
    })
})
```

react-imvc 里采用 `express` 作为服务端框架，采用 `express-react-views` 作为 view engine，并将 view path 设置成 `config.routes` 目录。

view 文件可以采用 react 组件的写法。

查阅 [express doc](expressjs.com) 和 [express-react-views](https://github.com/reactjs/express-react-views) 了解更多内容。

## Custom Layout

react-imvc 内置一个默认的 layout，可以满足最简单的需求，但对于部分应用来说，自定义 layout 是非常重要的。

可以在 `imvc.config.js` 里配置 layout 字段，促使 react-imvc 渲染页面时，使用自定义的 Layout。

Layout 的计算规则是：`path.join(config.root, config.routes, config.layout)`

[点击查看默认的 layout，可以参考它进行修改](../page/view.js)。

## High Order Component

react-imvc 提供了高阶组件，可以便利地实现一些特殊需求。

### connect(selector)(ReactComponent)

connect 是一个高阶函数，第一次调用时接受 selector 函数作为参数，返回 withData 函数。

withData 函数接受一个 React 组件作为参数，返回新的 React 组件。withData 会将 selector 函数返回的数据，作为 props 传入新的 React 组件。

selector({ state, handlers, actions }) 函数将得到一个 data 参数，其中包含三个字段 state, handlers, acitons，分别对应 controller 里的 global state, global handlers 和 actions 对象。

```javascript
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

## Config Babel

配置 babel 的方式，是设置 imv.config.js 的 babel 字段。它是一个函数，它接受一个参数 isServer。

请注意，如果添加的 plugins/presets 配置，不支持服务端或客户端运行，可根据 isServer 参数来动态配置。

```javascript
// imvc.config.js
// 引入 react-imvc 内置的 babel 配置函数
const defaultBabel = require('react-imvc/config/babel')

module.exports = {
    ...otherConfigs,
    babel: (isServer) => {
        let babelOptions = defaultBabel(isServer)
        babelOptions.presets.push() // 添加 presets 配置
        babelOptions.plugins.push() // 添加 plugins 配置
        return babelOptions
    },
}
```

## 支持编译 ESM 模块

可以通过 `imvc.config.js` 的 `compileNodeModules` 配置，支持编译 node_modules 模块。

该配置为可选配置，对象类型。

-   `rules`: 数组类型，支持 `string | RegExp | ((filename: string) => boolean)`

命中该配置的模块将被 babel 编译，因此可以通过该配置支持 esm 模块。

请注意，使用正则时需兼容处理 Windows 和 Mac/Linux 的路径差异（`(\/|\\)` 同时支持了两者）。

```js
{
  compileNodeModules: {
        rules: [
            // 将 @antv/g2 加入编译
            /@antv(\/|\\)g2/
        ]
    },
}
```

## 自定义服务端渲染器

react-imvc 支持在 `imvc.config.js` 中配置 `serverRenderer` 字段，来自定义服务端渲染器。

以 `styled-component` 的 SSR 为例：

```js
const { renderToNodeStream, renderToString } = require('react-dom/server')
const { ServerStyleSheet } = require('styled-components')

const env = process.env.NODE_ENV

// via renderToString
const serverRenderer = (view) => {
    const sheet = new ServerStyleSheet()
    const html = renderToString(sheet.collectStyles(view))
    const styleTags = sheet.getStyleTags() // or sheet.getStyleElement();
    return styleTags + html
}

// via renderToNodeStream
const streamingServerRenderer = (view) => {
    const sheet = new ServerStyleSheet()
    const jsx = sheet.collectStyles(view)
    const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))
    return stream
}

module.exports = {
    context: {
        env,
    },
    serverRenderer: streamingServerRenderer, // or serverRenderer
}
```

## Config Webpack

imvc.config.js 里，除了一些相关的 webpackPlugins 等配置以外，还新增了一个 config.webpack 配置，它的类型为一个函数

```javascript
module.exports = {
    ...otherConfigs,
    webpack: (webpackConfig) => {
        webpackConfig.module.rules.push() // 添加 loader
        return webpackConfig
    },
}
```

## Error Handling

从 react-imvc v2.5.0 开始，增加了了错误处理相关的生命周期。

注意：使用错误处理机制后，每个组件都被 wrap 一层 ErrorBoundary 组件，损失了 react-devtools 的简洁性。

`错误处理`与`视图降级`被分成不同的生命周期去处理。

### errorDidCatch(error, type)

该生命周期捕获从 controller, model, view 里抛出的错误，第一个参数为错误对象，第二个参数为 `controller|model|view` 之一的字符串。

可以在该生命周期里，上报错误信息。

### getComponentFallback(displayName, Component)

该生命周期在 react 组件抛错时触发，返回的内容将作为该组件的 fallback 显示给用户。

第一个参数为错误组件的 displayName，它通常是 class-component 的类名，或者 function-component 的函数名。

注意：displayName 会在压缩后，变成单字母，跟开发阶段不同。因此第二个参数 Component 可能更加有用。

Component 参数为发生错误的组件本身。

注意：getComponentFallback 依赖 react 组件的 componentDidCatch 生命周期。该生命周期在服务端不触发，因此 getComponentFallback 只在 client 端起作用。在 SSR 时无效，getViewFallback 在 SSR 时有效。

### getViewFallback()

该生命周期在两种情况下起作用

-   controller 走初始化的生命周期期间发生错误
    -   将走 getViewFallback 返回的 view 展示给用户
    -   此时 store 里的数据没有渲染的保障
    -   客户端将会再次走一遍 controller 的初始化流程
-   做 SSR 时，view 里存在错误
    -   将走 getViewFallback 返回的 view 展示给用户
    -   此时 controller 已经初始化过， store 里的数据应该是完整的
    -   客户端不会从新走一遍 controller 的初始化流程

### ErrorBoundary 组件

新增了 ErrorBoundary 组件，可以便捷地对单一组件进行特殊的错误处理。

注意：该组件包裹的元素，将脱离全局 `getComponentFallback` 生命周期，走它自身的 fallback 处理逻辑。但依然会内部上抛错误给 `controller.errorDidCatch`。

```javascript
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

### useContentHash

类型：`boolean`，默认值：`false`，开启后会对 gulp 打包的文件名进行 hash 处理，用于缓存控制。配合 webpack 自己的 hash 一起使用，可以实现静态资源的长期缓存。

### useFileLoader

类型：`boolean`，默认值：`false`，开启后支持 `import` 静态资源，如 `import logo from './logo.png'`，logo 的值为打包后的文件名。

```typescript
import style from './style.css'

export default class extends Controller {
    preload = {
        style: style,
    }
}
```

对于 `TypeScript 项目`，需在 `src/type.d.ts` 中添加以下声明：

```typescript
/// <reference types="react-imvc/imvc-types" />
```

引入 `react-imvc/imvc-types` 类型声明，以便获得类型提示。

## FAQ

### 为什么页面跳转后，preload 的样式没有加载？

所有 controller.preload 共享一个缓存对象，如果两个 controller 的 preload 对象拥有相同的 key 名，后加载的 controller 会受到缓存影响，出现未请求样式或者渲染错误的样式的情况。

解决方式：项目中所有 preload 的 key 都是唯一的。

### 为什么 vendor.js 体积越来越大？

webpack 的智能拆包功能，会扫描模块间的依赖，如果 A 页面依赖了 B 页面的某个模块的某个方法，B 页面的该模块可能进入 vendor.js 里，增加了 vendor.js 的体积，减少了 A 和 B 页面的 chunkfile 的体积。

可以通过自定义 webpack 配置，手动配置 vendor.js 里包含的模块规则，控制 vendor.js 的体积。（同时 A 和 B 页面各自的 chunckfile 将包含部分重复的代码，通常这是可接受的，因为 A 和 B 的 chunkfile 不会阻塞其它页面的加载，而是在进入 A 和 B 页面时，按需加载）。

```javascript
// imvc.config.js
module.exports = {
    webpack: (webpackConfig) => {
        webpackConfig.optimization.splitChunks = {
            cacheGroups: {
                groupindex: {
                    test: /[\\/]group-index[\\/]/,
                    name: 'groupindex',
                    minSize: 0,
                    minChunks: 1,
                },
                vendor: {
                    test(mod, chunks) {
                        // 只包含 node_modules 下的模块，和 share, components 目录
                        return (
                            (mod.context.includes('node_modules') && !mod.context.includes('group-index')) ||
                            /src[\\/]\w+[\\/](share|components)|src[\\/]shared/.test(mod.context)
                        )
                    },
                    chunks: 'all', //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
                    name: 'vendor', //拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
                },
            },
        }
        return webpackConfig
    },
}
```

### 如何让组件的错误不被捕获?

这是一个逃生出口，只在必要的情况下使用。

设置组件的 ignoreErrors 属性为 true，它将不被全局监控。

### 为什么 initialState 中的方法丢失了?

首先，不建议在 globalState 中存放函数。

目前框架在 init 阶段默认有以下行为：`JSON.parse(JSON.stringify(initialState))`，目的是防止篡改原数据

此外，我们提供了开关 `controller.deepCloneInitialState: Boolean`, 设为 false 即可跳过这个默认行为

### 如何关闭 gulp 任务？

在一些场景中，可能需要关闭 gulp 任务，比如禁用图片压缩等。

可以通过在 `imvc.config.js` 中配置：

```javascript
module.exports = {
    gulp: {
        img: false,
    },
}
```

所有 gulp 任务可点击[查看](../config/config.defaults.js#L156-L169)
