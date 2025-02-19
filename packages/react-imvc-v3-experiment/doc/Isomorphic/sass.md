# 使用 Sass

Sass 是一种 CSS 预处理器，它提供了一些便利的功能，使得 CSS 更容易编写和维护。

## 工作原理

一旦启用 sass 支持，`imvc` 将收集 `controller.tsx` 中依赖的所有 `css` 文件（包括 sass 和 css 文件），编译后拼接到 `controller.css/scss/sass` 中，并通过 `controller.preload` 机制加载和渲染。

所以，sass 的收集是一个 `build-time` 的新增功能，不会增加 `runtime` 的复杂度。

注意：只有文件名为`controller|Controller`作为入口文件的`controller.css`文件才会触发收集。

## 配置

在 `imvc.config.js` 中配置 `useSass` 选项：`true` 表示启用 Sass，`false` 表示禁用 Sass。

## 第一步：新增 controller.scss 文件

新增一个 `controller.scss` 文件，放在 `controller.tsx` 同级目录下。

## 第二步：在 controller.tsx 中引入 controller.scss

此处同样使用 `import` 语法引入 `controller.scss` 文件，并在 `preload` 中预加载。

```tsx
import React from 'react'
import Controller from 'react-imvc/controller'
import controllerStyle from './controller.scss'

export default class extends Controller {
  View = View
  preload = {
    controllerStyle,
  }
}

// 当组件渲染时，Style 标签会将 preload 里的同名 css 内容，展示为 style 标签。
function View() {
  return (
    <div>
      <Style name="controllerStyle" />
    </div>
  )
}
```
