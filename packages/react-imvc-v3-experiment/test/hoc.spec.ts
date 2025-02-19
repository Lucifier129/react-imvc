import path from 'path'
import http from 'http'
import puppeteer from 'puppeteer'
import { Config } from '../src'
import start from '../src/start'

jest.setTimeout(30000)

process.env.NODE_ENV = 'test'
let PORT = 33333
const ROOT = path.join(__dirname, '../project')
const config: Config = {
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  logger: null, // 不出 log
  devtool: '', // 不出 source-map
  ReactViews: {
    beautify: false, // 不美化
    transformViews: false, // 已有转换，无须再做
  },
  routes: 'routes', // 服务端路由目录
  layout: 'Layout.tsx', // 自定义 Layoutclear
  webpackLogger: false, // 关闭 webpack logger
  webpackDevMiddleware: true, // 在内存里编译
}

describe('hoc test', () => {
  describe('connect', () => {
    let server: http.Server
    let browser: puppeteer.Browser

    beforeAll(async () => {
      await start({ config })
        .then((result) => {
          server = result.server
          return puppeteer.launch()
        })
        .then((brws) => {
          browser = brws
        })
    })

    afterAll(async () => {
      server.close()
      await browser.close()
    })

    it('should get the right data passed with connect selector', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/connect`
      await page.goto(url)
      await page.waitFor('#connect')
      let content = await page.$eval('#location', (e) => e.innerHTML)

      expect(content).toBe('test')
      await page.close()
    })
  })
})
