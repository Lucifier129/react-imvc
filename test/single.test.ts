import path from "path"
import fetch from "node-fetch"
import http from "http"
import express from "express"
import puppeteer from 'puppeteer'
import IMVC from "../"
import start from "../start"

jest.setTimeout(20000)

process.env.NODE_ENV = "development"
let PORT = 3333
const ROOT = path.join(__dirname, "project")
const config: Partial<IMVC.Config> = {
  root: ROOT, // 项目根目录
  port: PORT, // server 端口号
  logger: null, // 不出 log
  devtool: "", // 不出 source-map
  ReactViews: {
    beautify: false, // 不美化
    transformViews: false // 已有转换，无须再做
  },
  routes: "routes", // 服务端路由目录
  layout: "Layout", // 自定义 Layoutclear
  webpackLogger: false, // 关闭 webpack logger
  webpackDevMiddleware: true // 在内存里编译
}

describe("test", () => {
  let app: express.Express
  let server: http.Server
  let browser: puppeteer.Browser

  beforeAll(() => {
    jest.resetModules();
    return start({ config }).then((result) => {
      app = result.app
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

  it("test", async () => {
    let url = `http://localhost:${config.port}/static_view_csr`
    let clientContent
    let serverContent
    try {
      let page = await browser.newPage()
      await page.goto(url)
      await page.waitFor("#static_view_csr")
      serverContent = await fetchContent(url)
      clientContent = await page.evaluate(() => document.documentElement.outerHTML)
      await page.close()
    } catch (e) {
      throw e
    }
    expect(
      serverContent.includes('static view content by client side rendering')
    ).toBe(false)
    expect(
      clientContent.includes('static view content by client side rendering')
    ).toBe(true)
  })
})

async function fetchContent(url: string): Promise<string> {
  let response = await fetch(url)
  let content = await response.text()
  return content
}
