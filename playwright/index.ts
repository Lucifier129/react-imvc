import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import packageDirectory from 'pkg-dir'
import { test as baseTest } from '@playwright/test'

const uuid = () => {
  return crypto.randomBytes(16).toString('hex')
}

const getNycOutputPath = async () => {
  const rootDir = await packageDirectory()
  return path.join(rootDir ?? process.cwd(), '.nyc_output')
}

type ContextCallbackType = Exclude<
  Parameters<typeof baseTest.extend>[0]['context'],
  undefined
>

const context: ContextCallbackType = async ({ context }, use) => {
  try {
    const nycOutputPath = await getNycOutputPath()

    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage(
          JSON.stringify((window as any).__coverage__)
        )
      )
    )

    fs.mkdirSync(nycOutputPath, { recursive: true })

    await context.exposeFunction(
      'collectIstanbulCoverage',
      (coverageJSON: string) => {
        if (coverageJSON) {
          fs.writeFileSync(
            path.join(nycOutputPath, `${uuid()}.json`),
            coverageJSON
          )
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
}

context.toString = () => 'async ({ context }, use) => {}'

export const test = baseTest.extend({
  // @ts-ignore
  context: context,
})
