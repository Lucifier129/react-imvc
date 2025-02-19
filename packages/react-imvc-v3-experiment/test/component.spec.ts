import path from 'path'
import http from 'http'
import puppeteer from 'puppeteer'
import { Config } from '../src'
import start from '../src/start'

jest.setTimeout(30000)

process.env.NODE_ENV = 'test'

let PORT: number = 33331

const ROOT: string = path.join(__dirname, '../project')

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
  layout: 'Layout.tsx', // 自定义 Layout
  webpackLogger: false, // 关闭 webpack logger
  webpackDevMiddleware: true, // 在内存里编译
  SSR: false,
}

describe('component', () => {
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

  describe('EventWrapper', () => {
    it('should handle event with handler in `ctrl`', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/event`
      await page.goto(url)
      await page.waitFor('#event')

      let count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('0')

      await page.click('#inner')

      count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('1')

      await page.close()
    })
  })

  describe('Input', () => {
    it('global state should change when the input has been changed', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/input`
      await page.goto(url)
      await page.waitFor('#input')

      await page.focus('#first-name-input')
      await page.keyboard.type('test')
      let content = await page.$eval('#first-name-value', (e) => e.innerHTML)

      expect(content).toBe('test')

      await page.close()
    })

    it('global state should change when the input with deep level has been changed', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/input`
      await page.goto(url)
      await page.waitFor('#input')

      await page.focus('#friend-0-input')
      await page.keyboard.type('test')
      let content = await page.$eval('#friend-0-value', (e) => e.innerHTML)

      expect(content).toBe('friendAtest')

      await page.close()
    })

    it('global state and it `isWarn` and `isValid` should change when the input with check attribute has been changed', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/input`
      await page.goto(url)
      await page.waitFor('#input')

      const inputHandler = await page.$('#phone-input')
      inputHandler && (await inputHandler.focus())
      await page.keyboard.type('test')
      let content = await page.$eval('#phone-value', (e) => e.innerHTML)

      expect(content).toBe('test false false')

      await page.click('#first-name-input')
      content = await page.$eval('#phone-value', (e) => e.innerHTML)

      expect(content).toBe('test true false')

      await page.focus('#phone-input')
      inputHandler && (await inputHandler.click({ clickCount: 3 }))
      await page.keyboard.press('Space')
      await page.keyboard.press('Backspace')
      await page.keyboard.type('1312456456')
      content = await page.$eval('#phone-value', (e) => e.innerHTML)

      expect(content).toBe('1312456456 false false')

      await page.click('#first-name-input')
      content = await page.$eval('#phone-value', (e) => e.innerHTML)

      expect(content).toBe('1312456456 false true')

      await page.close()
    })
  })

  describe('Link', () => {
    it('should change route when click', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')
      let fromContent = await page.evaluate(
        () => document.documentElement.outerHTML
      )

      expect(fromContent.includes('link from page')).toBeTruthy()

      page.click('#link_to_link')
      await page.waitFor('#link_to')

      let toContent = await page.evaluate(
        () => document.documentElement.outerHTML
      )

      expect(toContent.includes('link to page')).toBeTruthy()

      await page.close()
    })
  })

  describe('NavLink', () => {
    it('should to other page correctly', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')
      let fromContent = await page.evaluate(
        () => document.documentElement.outerHTML
      )

      expect(fromContent.includes('link from page')).toBeTruthy()

      page.click('#nav_link_to_link')
      await page.waitFor('#link_to')

      let toContent = await page.evaluate(
        () => document.documentElement.outerHTML
      )

      expect(toContent.includes('link to page')).toBeTruthy()
      await page.close()
    })

    it('should use active class when the to match the current url', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')

      let className = await page.$eval(
        '#nav_link_from_link',
        (e) => e.className
      )

      expect(className).toBe('active')

      await page.close()
    })

    it('should use active style when the to match the current url', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')

      let style = await page.$eval('#nav_link_from_link', (e) =>
        e.getAttribute('style')
      )

      expect(style).toBe('font-size: 14px;')

      await page.close()
    })

    it('should use active style and class when the isActive function return true', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')

      let style = await page.$eval('#nav_link_to_link2', (e) =>
        e.getAttribute('style')
      )
      let className = await page.$eval('#nav_link_to_link2', (e) => e.className)

      expect(style).toBe('font-size: 14px;')
      expect(className).toBe('active')

      await page.close()
    })
  })

  describe('OuterClickWrapper', () => {
    it('should handler click event outside Component', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/outer_click`
      await page.goto(url)
      await page.waitFor('#outer_click')

      let count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('0')

      await page.click('#beside')

      count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('1')

      await page.click('#out')

      count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('2')

      await page.close()
    })

    it('should not handler click event inside Component', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/outer_click`
      await page.goto(url)
      await page.waitFor('#outer_click')

      let count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('0')

      await page.click('#inner')

      count = await page.$eval('#count', (e) => e.innerHTML)
      expect(count).toBe('0')

      await page.close()
    })
  })

  describe('Style', () => {
    it('should enable style preloaded with name', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/style`
      await page.goto(url)
      await page.waitFor('#style')

      let height = await page.$eval('.style', (e) => e.clientHeight)

      expect(height).toBe(50)

      await page.close()
    })
  })

  it.todo('ControllerProxy')

  it.todo('ErrorBoundary')

  it.todo('Prefetch')
})
