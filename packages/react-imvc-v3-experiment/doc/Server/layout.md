# Layout

React-IMVC 内置一个默认的 layout，可以满足最简单的需求，但对于部分应用来说，自定义 layout 是非常重要的。

可以在 `imvc.config.js` 里配置 `layout` 字段，促使 React-IMVC 渲染页面时，使用自定义的 Layout。

Layout 的计算规则是：`path.join(config.root, config.routes, config.layout)`

点击查看 [默认 layout](https://github.com/tqma113/react-imvc/blob/master/src/page/view.tsx)，可以参考它进行修改。
