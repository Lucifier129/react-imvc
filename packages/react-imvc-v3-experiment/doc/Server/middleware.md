# 中间件

这是服务器端代码的主要部分，一般写在 `routes` 文件夹的如文件中，这里导出的中间件都会被应用于 express 服务器中。

```ts
// routes/index.js
export test from './test'
```

React-IMVC 将会 `require(routes)` 并把它们 apply 到 express app 里。

每个路由应该是一个文件夹，然后输出到 `routes/index.js` 文件里。

一个典型的中间件写法如下：

```ts
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

React-IMVC 里采用 express 作为服务端框架，采用 [express-react-views](https://github.com/reactjs/express-react-views#readme) 作为 view engine，并将 view path 设置成 config.routes 目录。

view 文件可以采用 React 组件的写法。

查阅 express doc 和 express-react-views 了解更多内容。
