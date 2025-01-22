# 持久化

## Cookie

我们内置了一些管理 Cookie 的方法。

### getCookie

类型：

```ts
(key: string, value: string, options?: Cookie.CookieAttributes | undefined) => void
```

`ctrl.getCookie` 用以获取 cookie 里跟 `key` 参数对应的 `value` 值。第三个参数 `options` 为对象，可查看 [使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)。

### setCookie

类型：

```ts
(key: string, value: string, options?: Cookie.CookieAttributes | undefined) => void
```

`ctrl.setCookie` 用以设置 cookie 里跟 `key` 参数对应的 `value` 值。第三个参数 `options` 为对象，可查看 [使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)。

### removeCookie

类型：

```ts
(key: string, options?: Cookie.CookieAttributes | undefined) => void
```

`ctrl.removeCookie` 用以删除 cookie 里跟 `key` 参数对应的 `value` 值。第三个参数 `options` 为对象，可查看 [使用文档](https://github.com/js-cookie/js-cookie#cookie-attributes)。

### cookie

类型：

```ts
;(
  key: string,
  value?: string | undefined,
  options?: Cookie.CookieAttributes | undefined
) => any
```

`ctrl.cookie` 方法是上述 `getCookie`、`setCookie` 方法的封装。

- 当只有一个 `key` 参数时，内部调用 `getCookie` 方法。

- 当有两个或两个以上的参数时，内部调用 `setCookie` 方法。

## LocalStorage

[LocalStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage) 的管理则推荐使用 `localStorage.setItem`、`localStorage.getItem`、`localStorage.removeImte` 和 `localStorage.clear` 进行管理。
