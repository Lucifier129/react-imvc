import React from 'react'
import { renderToString } from 'react-dom/server'
import Script from '../src/component/Script'
import { Config } from '../src'

let PORT = 3000
const ROOT = __dirname

const config: Config = {
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  routes: 'routes', // 服务端路由目录
  layout: 'Layout', // 自定义 Layout
  publish: '../publish',
  useContentHash: true,
  useFileLoader: true,
  useSass: true,
  serverRenderer: (view) => {
    return renderToString(
      <>
        <Script>
          {`
        console.log('serverRenderer')
        document.currentScript.remove()
        `}
        </Script>
        {view}
      </>
    )
  },
}

export default config
