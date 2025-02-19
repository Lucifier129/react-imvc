# 自定义服务端渲染器

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
