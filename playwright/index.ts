import * as fs from 'fs'
import * as path from 'path'
import packageDirectory from 'pkg-dir'
import { test as baseTest } from '@playwright/test'

const getNycOutputPath = async () => {
  const rootDir = await packageDirectory(__dirname)
  return path.join(rootDir ?? process.cwd(), '.nyc_output')
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    try {
      const nycOutputPath = await getNycOutputPath()

      await context.addInitScript(() =>
        window.addEventListener('beforeunload', () =>
          (window as any).collectIstanbulCoverage(
            JSON.stringify((window as any).__coverage__)
          )
        )
      )

      await context.exposeFunction(
        'collectIstanbulCoverage',
        (coverageJSON: string) => {
          if (coverageJSON) {
            fs.mkdirSync(nycOutputPath, { recursive: true })
            fs.writeFileSync(path.join(nycOutputPath, `out.json`), coverageJSON)
          }
        }
      )

      await use(context)

      for (const page of context.pages()) {
        await page.evaluate(() =>
          (window as any).collectIstanbulCoverage(
            JSON.stringify((window as any).__coverage__)
          )
        )
        await page.close()
      }
    } catch (error) {
      console.log('collect coverage error: ', error)
    }
  },
})
