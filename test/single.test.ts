import path from "path";
import fetch from "node-fetch";
import http from "http";
import express from "express";
import puppeteer from 'puppeteer'
import IMVC from "../";
import start from "../start";

process.env.NODE_ENV = "development";
let PORT = 3333;
const ROOT = path.join(__dirname, "project");
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
};

describe("test", () => {
  let app: express.Express
  let server: http.Server
  let browser: puppeteer.Browser

  beforeEach(async () => {
    try {
      let result = await start({ config });
      app = result.app;
      server = result.server;
      browser = await puppeteer.launch()
    } catch (error) {
      console.log("error", error);
    }
  });

  afterEach(() => {
    server.close();
  });

  it("test", async () => {
    let page = await browser.newPage()
    let url = `http://localhost:${config.port}/static_view_csr`;
    let clientContent
    let serverContent
    try {
      console.log('static_view_csr')
      await page.goto(url)
      console.log('static_view_scr')
      // await page.waitFor("#static_view_csr")
      console.log('static_view_scr')
      serverContent = await fetchContent(url)
      clientContent = await page.evaluate(() => document.documentElement.outerHTML)
    } catch (e) {
      throw e
    }
    console.log(clientContent)
    console.log(serverContent)
    expect(
      serverContent.includes('static view content by client side rendering')
    ).toBe(false)
    expect(
      clientContent.includes('static view content by client side rendering')
    ).toBe(true)
    page.close()
  });
});

async function fetchContent(url: string): Promise<string> {
  let response = await fetch(url);
  let content = await response.text();
  return content;
}
