# 事件处理

在 React-IMVC 有两种定义时间处理函数的方式：在 Controller 中定义和如普通 React 普通应用一样，在 View 组件中定义。

## Controller 中定义

示例如下：

```ts
export default class extends Controller<typeof initialState, {}> {
  ...

  handleClick = () => {
    ...
  }
}
```

使用方式如下：

```ts
function View({ ctrl }) {
  return (
    <div id="event">
      <button onClick={ctrl.handleClick}>foo</button>
    </div>
  )
}
```

## View 组件中定义

示例如下：

```ts
function View() {
  handleClick = () => {
    ...
  }
  return (
    <div id="event">
      <button onClick={handleClick}>foo</button>
    </div>
  )
}
```

## 总结

两种方式各有利弊，在 Controller 中定义，所有组件都可以使用，并且在处理函数中可以通过 `this` 关键字调用和获取 Controller 中的数据和内置函数、自定义函数等，但必须要通过 Controller 实例 `ctrl` 才能使用，而在 View 组件中定义较为灵活，且不受 `ctrl` 限制，但在实现时，则无法直接获取 Controller 中的内容，使用范围也不确定，所以没有那种方式是推荐的，具体视情况而定。
