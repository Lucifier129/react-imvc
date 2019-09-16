import path from 'path'
import * as util from '../build/util'
import build from '../build'
import IMVC from '../index'
import * as setupDevEnv from '../build/setup-dev-env'
import puppeteer from 'puppeteer'
import defaultConfig from '../config/config.defaults'
const pkg = require('../package.json')

process.env.NODE_ENV = "production"
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

describe('build test', () => {
  describe('util', () => {
    it('getExternals can get all dependences', () => {
      let dependences = util.getExternals(defaultConfig)
      let sourceLength = Object.keys(pkg.dependencies).length + Object.keys(pkg.devDependencies).length

      expect(dependences.length).toBe(sourceLength)
    })
    
    it('matchExternals can match the dependence', () => {
      let externals = [
        "@types/fetch-mock",
        "@types/jest",
        "@types/lodash",
        "fetch-mock",
        "jest",
        "lodash",
        "puppeteer"
      ]
      let list = [
        {
          value: 'jest',
          result: true
        },
        {
          value: 'puppeteer',
          result: true
        },
        {
          value: 'react',
          result: false
        }
      ]
      list.forEach((item) => {
        expect(util.matchExternals(externals, item.value)).toBe(item.result)
      })
    })
  })

  // describe('setupDevEnv', () => {
    
  // })

  describe('index', () => {
    it('file after building should run as same as start', async () => {

    })
  })
})