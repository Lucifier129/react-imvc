# 介绍

[![License](https://img.shields.io/npm/v/react-imvc.svg)](https://www.npmjs.com/package/react-imvc)
[![Action Status](https://github.com/Front-End-Resort/react-imvc/workflows/IMVC/badge.svg)](https://github.com/Front-End-Resort/react-imvc/actions)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://www.npmjs.com/package/react-imvc)
[![PRs-welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Front-End-Resort/react-imvc/pull/new/master)

**React-IMVC** 是 Isomorphic MVC 的 [React](https://reactjs.org/) 实现，它是一个 [Web 框架](https://en.wikipedia.org/wiki/Web_framework)。通过 **React-IMVC**，我们可以更便利地实现同构 [Web 应用](https://en.wikipedia.org/wiki/Web_application) 的开发。

## 什么是 IMVC

IMVC 的 "I" 是 _Isomorphic_ 的缩写，意思是同构，在这里是指，一份 JavaScript 代码，既可以在 [Node.js](https://nodejs.org/zh-cn/) 里运行，也可以在 [浏览器](https://zh.wikipedia.org/zh/%E7%BD%91%E9%A1%B5%E6%B5%8F%E8%A7%88%E5%99%A8) 里运行。

IMVC 的 "M" 是 _Model_ 的缩写，意思是模型，在这里是指，状态及其状态变化函数的集合，由 `initialState` 状态和 `actions` 函数组成。

IMVC 的 "V" 是 _View_ 的缩写，意思是视图，在这里是指 React 组件。

IMVC 的 "C" 是指 _Controller_ 的缩写，意思是控制器，在这里是指，包含生命周期方法、事件处理器、同构工具方法以及负责同步 _View_ 和 _Model_ 的中间媒介。

**React-IMVC** 里的 MVC 三个部分都是 _Isomorphic_ 的，所以它可以做到：只编写一份代码，在 NodeJS 里做 [服务端渲染](https://zh.wikipedia.org/wiki/%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E6%B8%B2%E6%9F%93)（Server-Side-Rendering，简称 SSR），在 [浏览器](https://zh.wikipedia.org/zh/%E7%BD%91%E9%A1%B5%E6%B5%8F%E8%A7%88%E5%99%A8) 里做客户端渲染（Client-Side-Rendering）。

## 它是如何工作的

在 **React-IMVC** 的 _Model_ 里， _state_ 是 [不可变数据](https://redux.js.org/faq/immutable-data/)（immutable data），_action_ 是 [纯函数](https://en.wikipedia.org/wiki/Pure_function)（pure function），不建议包含 [副作用](https://en.wikipedia.org/wiki/Side_effect)（side effect）。

**React-IMVC** 的 _View_ 是 React 组建，建议尽可能使用无状态函数组件（functional stateless component）写法，不建议包含副作用。

然而，副作用是跟外界交互的必然产物，只可能被隔离，不可能被消灭。所以，我们需要一个承担 副作用的对象，它就是 _Controller_。

生命周期函数（Life-Cycle method）是副作用来源，[Ajax](https://zh.wikipedia.org/wiki/AJAX)/[Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) 也是副作用来源，事件处理器（Event Handler）也是副作用来源，[localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage) 也是副作用来源，它们都应该在 _Controller_ 这个 `class` 中，用面向对象的方式来处理。

使用 **React-IMVC** 开发的应用，包含多个页面（page），每个页面都由 _MVC_ 三个部分组成。

每个页面都对应一个文件夹，里面必须包含一个 `Controller.ts` 文件，作为该页面的入口文件。

```javascript
// /my_page/Controller.js

// Controller 基类里实现了许多方法，子类 Controller 要避免使用同名方法
import Controller from 'react-imvc/controller'

export default class extends Controller {
  // your code
}
```

## Feature

**React-IMVC** 有一些优秀的特性，如下：

- 一条命令启动完整的开发环境。
- 一条命令编译和构建源代码。
- 一份代码，既可以在 Node.js 做服务端渲染（SSR），也可以在浏览器端复用后继续渲染（CSR & SPA）。
- 既是多页应用，也是 [单页应用](https://zh.wikipedia.org/wiki/%E5%8D%95%E9%A1%B5%E5%BA%94%E7%94%A8)，还可以通过配置自由切换两种模式，用「同构应用」打破「单页 VS 多页」的两难抉择。
- 构建时可以生成一份 _hash history_ 模式的静态文件，当做普通单页应用的入口文件（如示例所示）。
- 构建时可以根据路由切割代码，按需加载 JavaScript 文件。
- 支持在 IE9 及更高版本浏览器里，使用包括 `async/await` 在内的 [ES2015+](http://www.ecma-international.org/ecma-262/6.0/) 语言新特性。
- 丰富的生命周期，让业务代码有更清晰的功能划分。
- 内部自动解决在浏览器端复用服务端渲染的 HTML 和数据，无缝过渡。
- 好用的同构方法 `fetch`、`redirect` 和 `cookie` 等，贯通前后端的请求、[重定向](https://en.wikipedia.org/wiki/Wikipedia:Redirect) 和 [cookie](https://zh.wikipedia.org/zh-hans/Cookie) 等操作。

> <b>TIP</b>
>
> 下面我们将主要使用 JavaScript 来展示，当提到类型时，会使用 TypeScript 来展示，请注意区分。

## 目录

- [配置详情](./Config/detail.md)
- [配置用法](./Config/usage.md)
- [路由](./Isomorphic/route.md)
- [渲染](./Isomorphic/render.md)
- [事件处理](./Isomorphic/event-handle.md)
- [数据管理](./Isomorphic/data-manage.md)
- [Fetch](./Isomorphic/data-fetch.md)
- [API](./Isomorphic/api.md)
- [持久化](./Isomorphic/persistence.md)
- [静态资源](./Isomorphic/static-file.md)
- [缓存](./Isomorphic/cache.md)
- [生命周期](./Isomorphic/life-circle.md)
- [错误处理](./Isomorphic/error-handle.md)
- [组件](./Isomorphic/components.md)
- [HOC](./Isomorphic/hoc.md)
- [BOM](./Isomorphic/bom.md)
- [Context](./Isomorphic/context.md)
- [HOOK](./Isomorphic/hooks.md)
- [Sass](./Isomorphic/sass.md)
- [serverRenderer](./Isomorphic/serverRenderer.md)
- [中间件](./Server/middleware.md)
- [布局](./Server/layout.md)
