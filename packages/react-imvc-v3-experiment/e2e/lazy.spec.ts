import { expect } from '@playwright/test'
import { test } from '../src/playwright'

const PORT = 3333

const createUrl = (pathname: string) => {
  return `http://localhost:${PORT}${pathname}`
}

test.describe('lazy', () => {
  test('render', async ({ page }) => {
    try {
      const url = createUrl('/lazy')

      await page.goto(url)
      await page.waitForSelector('button')

      const body = await page.$('body')

      const innerHTML0 = await body.innerHTML()

      expect(innerHTML0.includes('Counter A')).toBe(true)
      expect(innerHTML0.includes('Counter B')).toBe(true)
      expect(innerHTML0.includes('Counter C')).toBe(true)
      expect(innerHTML0.includes('Counter D')).toBe(false)
      expect(innerHTML0.includes('Counter E')).toBe(false)

      await page.click('#for-d')
      await page.waitForSelector('#d')

      const innerHTML1 = await body.innerHTML()

      expect(innerHTML1.includes('Counter A')).toBe(true)
      expect(innerHTML1.includes('Counter B')).toBe(true)
      expect(innerHTML1.includes('Counter C')).toBe(true)
      expect(innerHTML1.includes('Counter D')).toBe(true)
      expect(innerHTML1.includes('Counter E')).toBe(false)

      await page.click('#for-e')
      await page.waitForSelector('#e')

      const innerHTML2 = await body.innerHTML()

      expect(innerHTML2.includes('Counter A')).toBe(true)
      expect(innerHTML2.includes('Counter B')).toBe(true)
      expect(innerHTML2.includes('Counter C')).toBe(true)
      expect(innerHTML2.includes('Counter D')).toBe(true)
      expect(innerHTML2.includes('Counter E')).toBe(true)
    } catch (error) {
      console.log('error', error)
    }
  })
})
