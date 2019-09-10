import path from 'path'
import fetch from 'node-fetch'
import http from 'http'
import express from 'express'
import puppeteer from 'puppeteer'
import IMVC from '../index'
import start from '../start'

jest.setTimeout(30000)

process.env.NODE_ENV = 'development'

let PORT: number = 3333

const ROOT: string = path.join(__dirname, 'project')

const config: Partial<IMVC.Config> = {
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

describe('component test', () => {
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
  it('ControllerProxy', () => {
    
  })
  
  it('ErrorBoundary', () => {
    
  })
  
  it('EventWrapper', () => {
    
  })
  
  describe('Input', () => {
    it('global state should change when the input has been changed', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/input`
      await page.goto(url)
      await page.waitFor('#input')

      await page.$eval('#first-name-input', (e: HTMLInputElement) => e.value = 'test')
      let content = await page.$eval('first-name-value', (e) => e.innerHTML)

      expect(content).toBe('test')
    })
  })
  
  it('Link', async () => {
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

      let className = await page.$eval('#nav_link_from_link', e => e.className)
      
      expect(className).toBe('active')
    })
    
    it('should use active style when the to match the current url', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')

      let style = await page.$eval('#nav_link_from_link', e => e.getAttribute('style'))
      
      expect(style).toBe("font-size:14px")
    })

    it('should use active style and class when the isActive function return true', async () => {
      let page = await browser.newPage()
      let url = `http://localhost:${config.port}/link_from`
      await page.goto(url)
      await page.waitFor('#link_from')

      let style = await page.$eval('#nav_link_to_link2', e => e.getAttribute('style'))
      let className = await page.$eval('#nav_link_to_link2', e => e.className)
      
      expect(style).toBe("font-size:14px")
      expect(className).toBe('active')

    })
  })
  
  
  it('OuterClickWrapper', () => {
    
  })
  
  it('Prefetch', () => {
    
  })
  
  it('Script', () => {
    
  })
  
  it('Style', () => {
    
  })
  
  it('ViewManager', () => {
    
  })
})