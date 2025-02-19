# 路由

React-IMVC 项目中的同构代码部分是以路由文件为入口，即默认 src 目录下的入口文件。并且采取配置路由的方式，格式如下：

```ts
export default [
  {
    path: '/static_view',
    controller: () => import('./static-view/Controller'),
  },
]
```

为数组的形式，单个路由中 path 对应时页面地址匹配字符串，controller 则是对应页面的 Controller，采用异步引入的方式（用于 Webpack 进行 Code split）。其中我们对 path 的匹配工具为 [path-to-regexp](https://github.com/pillarjs/path-to-regexp)，所以关于路由匹配的相关规则请参照 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 的相关规则。

由于这样的路由形式，所以页面之间的渲染和数据管理都是独立的。下面我们会详细介绍单个页面的开发模式。
