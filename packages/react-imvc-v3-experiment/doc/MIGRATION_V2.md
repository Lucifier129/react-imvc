# react-imvc v2.0 升级指南

react-imvc v1.0 依赖

- react/react-dom v15.x 版本
- webpack v1.x 版本
- babel v6.x 版本

升级 v2.0 后：

- react/react-dom v16.x 版本
- webpack v4.x 版本
- babel v7.x 版本。

总体 api 和用法保持不变，有少数微调的地方，会在下方一一给出。开发者可通过一一比对进行升级。

## 需要自行 install react react-dom

### 修改前

react-imvc v1.x 将 react/react-dom 内置，只需要 install react-imvc，即可把 react/react-dom 也一并 install 进来。

### 修改后

react-imvc v2.0 将 react/react-dom 视为 peerDependencies，install react-imvc 不会自动 install react/react-dom

### 修改原因或目的

开发者可自行决定使用指定版本的 react/react-dom。

### 修改方式

方式一

- 删除 node_modules 目录
- 手动 `npm install --save react react-dom` 安装 v16.x 版本
- 修改 `package.json` 里的 `react-imvc` 版本为 `^2.0.0`
- 手动 `npm install`

方式二

- 删除 node_modules 目录
- 删除 `package.json` 里的 `react-imvc`
- 手动 `npm install --save react react-dom react-imvc` 下载
- 手动 `npm install` 下载其它依赖

## 删除 .babelrc 文件

### 修改前

react-imvc v1.x 里，用户需要自行在项目文件夹下准备 `.babelrc` 文件。

### 修改后

react-imvc v2.x 里，内置了 babel 配置，通过 `imvc.config.js` 里的 `babel` 字段来自定义（通常不需要）

### 修改的原因或目的

babel v7.x 版本去掉了简便的 `stage-0` 的 `preset`，需要把每个 `proposal` 对应的 `plugin` 安装进来，并准确配置。

使得 `babelrc` 很繁琐，不宜默认暴露给开发者，因此内置到 react-imvc 里。

### 修改方式

删除项目文件夹下的 `.babelrc` 文件。

## imvc.config.js 不能使用 ES2015 Modules 模块规范

### 修改前

react-imvc v1.x 里，通过 .babelrc 文件，所有模块在执行前都被进行 babel 编译转换。

### 修改后

react-imvc v2.x 里，取消 .babelrc 文件，通过 imvc.config.js 的 babel 字段提供自定义配置能力。

因此，imvc.config.js 被加载时，babel 还没有启动（它要从前者里获取配置）。

### 修改方式

将 `imvc.config.js` 的 `import/export` 修改为 commonjs 规范的 `require/module.exports` 写法。

注：这不意味着不能使用 `const/let`, `async/await` 等语法，只要所安装的 node.js 版本默认支持，可直接使用。将来 node.js 内置 ES2015 Modules 规范的支持时，此限制可解除。

## 修改 index.js 加载 controller.js 的方式

### 修改前

react-imvc v1.x 里，加载 controller 方式如下：

```javascript
export default [
  {
    path: '/',
    controller: require('./home/Controller'),
  },
]
```

### 修改后

react-imvc v2.x 里，采用 `dynamic import` 的语法，新方式如下：

```javascript
export default [
  {
    path: '/',
    controller: () => import('./home/Controller'),
  },
]
```

### 修改原因和目的

v1.x 里是基于约定（所有 controller.js 都会被代码切割出去），因此直接 require 它们即可。但这个是在动态模块加载的标准规范没出现前的折中做法。

v2.x 里，页面入口文件可以不再叫 Controller.js （尽管这个命名依然是推荐的做法）。

### 修改方式

将 `require()` 修改为 `() => import()`。

## 异步加载模块不再使用 `require.ensure`，改用 `import()`

### 修改前

使用 webpack v1.x 的 `require.ensure` 特殊语法，异步加载模块

### 修改后

统一使用 `import()` 语法异步加载模块

### 修改原因和目的

webpack v4.x 建议不要使用 webpack-only 的 `require.ensure` 语法，使用标准的 `import()`

### 修改方式

用 `import()` 替代 `require.ensure`，使用 `async/await` 语法获取模块加载的返回结果。

## build 构建的 assets.json 里除了 vendor 和 index 外，其它名字都是不可访问的

### 修改前

react-imvc v1.x 通过 bundle-loader 的特殊用法，将每个 `controller.js` 编译出来的 js 文件命名为它的文件夹名（通常就是它对应的 page 的名字）。

开发者可以通过访问 assets[pageName] 在 Layout.js 里预加载 js。

### 修改后

react-imvc v2.x 里，assets.js 里除了 vendor 和 index 是固定不变的，其它字段都可能不断变化，不应使用。

### 修改的原因和目的

webpack v4.x 里使用 `dynamic import` 语法异步加载文件，默认情况下，模块名是动态的数字。可以通过[注释(/_ webpackChunkName: "foo" _/)](https://webpack.js.org/guides/code-splitting/#dynamic-imports)的方式指定名称。但在构建 assets.json 时，不保证能拿到准确的名字。

### 修改方式

react-imvc v2.x 提供了 `<Prefetch />` 组件，提供了 `controller.prefetch` 方法，提供了 `<Link prefetch />` 属性等三种方式，预加载其它页面的 js 文件。

可以通过[访问文档](./index.md))找到它们。

## 删除 imvc-root 节点。

### 修改前

react-imvc v1.x 中，会用几个 `div` 元素包裹开发者的 `View` 组件，以便实现 `KeepAlive` 等切换能力。

```javascript
<div className="imvc-root">
  <div className="imvc-view-item">
    <View />
  </div>
</div>
```

### 修改后

react-imvc v2.x 中，去掉了 `imvc-root` 元素，用 `React.Fragment` 替代

```javascript
<React.Fragment className="imvc-root">
  <div className="imvc-view-item">
    <View />
  </div>
</React.Fragment>
```

### 修改原因和目的

react v16.x 支持 `React.Fragment`，可以节省不必要的组件 root 元素，减轻 DOM 复杂度，提高性能。

### 修改方式

如果项目中没有 css 样式依赖 imvc-root，通常不必做修改。

## 删除 state 中的两个字段 isClient|isServer

### 修改前

react-imvc v1.x 中，每个 controller 的 store.getState() 中，默认会包含一些数据。

其中包含 isClient 和 isServer 字段

### 修改后

react-imvc v2.0 中，删除了 state 里的 isClient 和 isServer 字段。

注：这不意味着 controller.context 里的 isClient 和 isServer 也删除了。只是没有默认填充给 state 而已。

### 修改的原因和目的

state 通常给 view 使用，而 view 不应根据 isServer | isClient 做不同渲染，这将导致 `ReactDOM.hydrate` 复用服务端渲染的 DOM 结构时不匹配。

### 修改方式

如果没有使用 state 的 isServer | isClient 这两个字段，通常不必修改。

如果需要将部分组件只在客户端渲染，可以在 `componentDidMount` 时，再渲染某个组件即可。这个做法更安全可靠。

## 删除 Preload 组件

### 修改前

react-imvc v1.x 提供了 Preload 组件，可以渲染 controller.preload 属性指定加载的内容。Style 组件就是通过 Preload 组件实现的。

### 修改后

react-imvc v2.x 删除 Preload 组件，更简洁地实现 Style。

注：如果没有引用 `import { Preload } from 'react-imvc/component'`，只用到了 `Style` 组件，项目不会受影响。

### 修改原因和目的

Preload 组件的实用价值几乎为 0，开发者可以自己简单地实现。

### 修改方式

没有直接使用 Preload 组件的，通常不必修改。

使用 controller.fetch 方法获取数据，存入 store 中，通过 state 传递到 view 里渲染即可。

## 废弃一些 config 配置

### 废弃 config.entry

webpack entry 配置，在 react-imvc v1.x 里，config.entry 可以配置一些模块，它们会出现在 index.js 中。

在 react-imvc v2.x 里，webpack v4.x 会自动优化模块，不需要手动加载。

修改方式为：直接删除 entry 配置

### 废弃 config.webapckLogger

这个配置原先用来配置 webpack log 输出，在 react-imvc v2.x 中，始终使用默认的配置。

## 自动忽略 moment locale 目录

### 修改前

react-imvc v1.x 里，webpack 编译时会将 moment 所有 locale 模块都打包进去

### 修改后

react-imvc v2.x 里，内置 `new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)` 忽略它们。

### 修改方式

如果之前在 config.webpackPlugins 里配置过 IgnorePlugin moment，删除它们即可。

## 自定义 babel/webpack 配置

react-imvc v2.x 的 imvc.config.js 配置文件中，新增 babel/webpack 两个字段，可以获取到当前全部的 babel/webpack 配置结果，并提供修改的机会。

具体可以参考[文档](./index.md)中 Config Babel 和 Config Webpack 的部分。
