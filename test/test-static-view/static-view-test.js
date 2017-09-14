import path from 'path'
import expect from 'expect'
import puppeteer from 'puppeteer'
import fetch from 'node-fetch'

process.env.NODE_ENV = 'development'
const start = require('../../start')
let PORT = 2333

describe('static view', () => {
    it('should support render static view with ssr and csr', async () => {
        let port = PORT++
        let config = {
            root: __dirname,
            logger: null,
            port: port,
            SSR: true,
        }
        let { app, server, page, browser } = await getCollection(config)

        let url = `http://localhost:${port}/static_view`
        await page.goto(url)
        await page.waitFor('#ssr_target')
        let serverContent = await fetchContent(url)
        let clientContent = await page.evaluate(() => document.documentElement.outerHTML)
        expect(serverContent.includes('static view content')).toBe(true)
        expect(clientContent.includes('static view content')).toBe(true)


        url = `http://localhost:${port}/static_view_csr`
        await page.goto(url)
        await page.waitFor('#csr_target')
        serverContent = await fetchContent(url)
        clientContent = await page.evaluate(() => document.documentElement.outerHTML)
        expect(serverContent.includes('static view content by client side rendering')).toBe(false)
        expect(clientContent.includes('static view content by client side rendering')).toBe(true)

        server.close()
        browser.close()
    })
    it('should support render static view without server-side-rendering', async () => {
        let port = PORT++
        let config = {
            root: __dirname,
            logger: null,
            port: port,
            SSR: false,
        }
        let { app, server, page, browser } = await getCollection(config)

        let url = `http://localhost:${port}/static_view`
        await page.goto(url)
        await page.waitFor('#ssr_target')
        let serverContent = await fetchContent(url)
        let clientContent = await page.evaluate(() => document.documentElement.outerHTML)
        expect(serverContent.includes('static view content')).toBe(false)
        expect(clientContent.includes('static view content')).toBe(true)


        url = `http://localhost:${port}/static_view_csr`
        await page.goto(url)
        await page.waitFor('#csr_target')
        serverContent = await fetchContent(url)
        clientContent = await page.evaluate(() => document.documentElement.outerHTML)
        expect(serverContent.includes('static view content by client side rendering')).toBe(false)
        expect(clientContent.includes('static view content by client side rendering')).toBe(true)

        server.close()
        browser.close()
    })
})

async function getCollection(config) {
    let { app, server } = await start({ config })
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    return { app, server, page, browser }
}

async function fetchContent(url) {
    let response = await fetch(url)
    let content = await response.text()
    return content
}