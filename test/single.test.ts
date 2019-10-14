import path from "path"
// import fetch from "node-fetch"
import http from "http"
// import express from "express"
import puppeteer from 'puppeteer'
import { Config } from "../src/"
import start from "../src/start"

jest.setTimeout(30000)

process.env.NODE_ENV = "development"
let PORT = 3333
const ROOT = path.join(__dirname, "project")
const config: Partial<Config> = {
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  logger: null, // 不出 log
  devtool: "", // 不出 source-map
  ReactViews: {
    beautify: false, // 不美化
    transformViews: false // 已有转换，无须再做
  },
  renderMode: 'renderToString',
  routes: "routes", // 服务端路由目录
  layout: "Layout", // 自定义 Layoutclear
  webpackLogger: false, // 关闭 webpack logger
  webpackDevMiddleware: true, // 在内存里编译
}

describe("test", () => {
  // let app: express.Express
  let server: http.Server
  let browser: puppeteer.Browser

  beforeAll(() => {
    return start({ config }).then((result) => {
      // app = result.app
      server = result.server
      return puppeteer.launch()
    }).then((brws) => {
      browser = brws
    })
  })

  afterAll(() => {
    server.close()
    return browser.close()
  })

  it('single', async () => {
    let url = `http://localhost:${config.port}/basic_state?a=1&b=2`
			let page: any
			let clientController: any
			try {
				page = await browser.newPage()

				await page.goto(url)
				await page.waitFor('#basic_state')
	
				clientController = await page.evaluate(() => window.controller)
			} catch (e) {
				throw e
			}
			

      let serverController = global.controller

      let locationKeys = [
        'params',
        'query',
        'pathname',
        'pattern',
        'search',
        'raw'
      ]
      locationKeys.forEach(key => {
        expect(JSON.stringify(serverController.location[key])).toEqual(
          JSON.stringify(clientController.location[key])
        )
      })

      let contextKeys = ['basename', 'publicPath', 'restapi']
      contextKeys.forEach(key => {
        expect(JSON.stringify(serverController.context[key])).toEqual(
          JSON.stringify(clientController.context[key])
        )
      })

      expect(typeof serverController.context.req).toBe('object')
      expect(typeof serverController.context.res).toBe('object')
      expect(serverController.context.isClient).toBe(false)
      expect(serverController.context.isServer).toBe(true)

      expect(clientController.context.isClient).toBe(true)
      expect(clientController.context.isServer).toBe(false)

			let { location } = clientController

			expect(location.pattern).toEqual('/basic_state')
			expect(location.pathname).toEqual('/basic_state')
			expect(location.raw).toEqual('/basic_state?a=1&b=2')
			expect(location.search).toEqual('?a=1&b=2')
			expect(location.query).toEqual({ a: '1', b: '2' })
			expect(location.params).toEqual({})

			await page.close()
  })
})

// async function fetchContent(url: string): Promise<string> {
//   let response = await fetch(url)
//   let content = await response.text()
//   return content
// }
