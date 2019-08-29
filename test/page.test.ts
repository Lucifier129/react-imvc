import path from 'path'
import createPageRouter from '../page/createPageRouter'
import View from '../page/view'
import http from 'http'
import express from 'express'
import puppeteer from 'puppeteer'
import IMVC from '../index'
import getConfig from '../config'

process.env.NODE_ENV = 'test'
let PORT = 3333
const ROOT = path.join(__dirname, 'project')
const options: IMVC.Options = {
  config: {
    root: ROOT, // 项目根目录
    port: PORT, // server 端口号
    logger: null, // 不出 log
    devtool: '', // 不出 source-map
    ReactViews: {
      beautify: false, // 不美化
      transformViews: false // 已有转换，无须再做
    },
    routes: 'routes', // 服务端路由目录
    layout: 'Layout', // 自定义 Layout
    webpackLogger: false, // 关闭 webpack logger
    webpackDevMiddleware: true // 在内存里编译
  }
}

describe('page test', () => {
  let browser: puppeteer.Browser
  let app: express.Express
  let server: http.Server

  // beforeEach(async () => {
  //   try {
  //     app = express()
  //     server = http.createServer(app)
  //     server.listen(PORT)
  //     browser = await puppeteer.launch()
  //   } catch (error) {
  //     console.log('error', error)
  //   }
  // })

  // afterEach(() => {
  //   browser.close()
  //   server.close()
  // })
  describe('createPageRouter', () => {
    it('shoule create router correctly', async () => {
      // let page = await browser.newPage()
      // let config = getConfig(options)
      // let router = createPageRouter(config)
      // app.use(router)
      // let url = `http://localhost:${config.port}/static_view`
      // await page.goto(url)
      // let content = await page.content()
      // console.log(content)
			// // await page.waitFor('#static_view')
			// // let serverContent = await fetchContent(url)
			// // let clientContent = await page.evaluate(
			// // 	() => document.documentElement.outerHTML
			// // )
			// // expect(content.includes('static view content')).toBeTruthy()
			// // expect(clientContent.includes('static view content')).toBeTruthy()

			// await page.close()
    })
  })
  
  describe('View', () => {
    
  })
})

async function fetchContent(url: string): Promise<string> {
	let response = await fetch(url)
	let content = await response.text()
	return content
}