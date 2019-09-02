import path from "path";
import fetch from "node-fetch";
import http from "http";
import express from "express";
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
  layout: "Layout", // 自定义 Layout
  webpackLogger: false, // 关闭 webpack logger
  webpackDevMiddleware: true // 在内存里编译
};

describe("test", () => {
  let app: express.Express;
  let server: http.Server;

  beforeAll(async (done) => {
    try {
      let result = await start({ config });
      app = result.app;
      server = result.server;
    } catch (error) {
      console.log("error", error);
    }
    done()
  });

  afterAll(async (done) => {
    if (server) {
      server.close();
    }
    done()
  });

  it("test", async (done) => {
    let url = `http://localhost:${config.port}/basic_state`;
    await page.goto(url)
    await page.waitFor('#basic_state')
    done()
  });
});
