# 静态资源

处理数据的获取，我们还提供了静态资源的获取接口。

## 静态资源路由

## preload

我们在 Controller 中 提供了 `preload` 字段，类型为：

```ts
Record<string, string>
```

该对象用来在页面显示前，预加载 css, json 等数据。使用方式为：

```ts
export default class extends Controller<any, any> {
  preload = {
      'main': '/path/to/css'
  }

  ...
}
```

然后结合 我们提供的 [Style 组件](./components.md#style) 来加载该资源：

```ts
import { Style } from 'react-imvc/components'
function View() {
  <div>
    <Style name="main">

    ...
  </div>
}
```

### controller.disablePublicPathForPreload -> boolean

是否在 preload 里禁用 publicPath，默认为 false，只对 CRS 生效。如果为 true，会直接使用 node.js 服务端的静态资源路径

### controller.publicPathPlaceholder -> string

如果 preload 里的 css 文件里的图片等资源需要使用 publicPath，但是又不想在 preload 里写死 publicPath，可以使用该字段，

默认为 `@public_path`，在 preload 里写 `@public_path`，会在运行时被替换为 controller.context.publicPath

## prefetch

除了上述的 `preload` 字段，我们还提供了一个 Controller 的内置函数，用以预加载其他页面的 JavaScript bundle 文件。

其中 url 为该项目其他页面的单页地址（即不包括 `basename` 的部分），跟 `this.history.push(url)` 的字符串参数形式一样。

除了使用 `prefetch` 方法以外，还可以使用 `<Link prefetch to={url} />` 的 prefetch 布尔属性，或者 `<Prefetch src={url} />` 组件（见 [Prefetch](./components.md#prefetch)）。
