import 'regenerator-runtime/runtime'

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import packageDirectory from 'pkg-dir'
import { test as baseTest } from '@playwright/test'

const uuid = () => {
    return crypto.randomBytes(16).toString('hex')
}

const getRootDir = async () => {
    const rootDir = await packageDirectory()
    return resolvePath(rootDir ?? process.cwd())
}

const resolvePath = (filepath: string) => {
    return filepath.split(path.sep).join('/')
}

type ContextCallbackType = Exclude<Parameters<typeof baseTest.extend>[0]['context'], undefined>

const context: ContextCallbackType = async ({ context }, use) => {
    try {
        const rootDir = await getRootDir()
        const nycOutputPath = `${rootDir}/.nyc_output`

        await context.addInitScript(() =>
            window.addEventListener('beforeunload', () =>
                (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
            ),
        )

        fs.mkdirSync(nycOutputPath, { recursive: true })

        await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
            if (coverageJSON) {
                const coverage = JSON.parse(coverageJSON)

                const json = {} as any

                for (const key in coverage) {
                    const newKey = resolvePath(key).replace(rootDir, '.')
                    coverage[key].path = newKey
                    json[newKey] = coverage[key]
                }

                fs.writeFileSync(path.join(nycOutputPath, `${uuid()}.json`), JSON.stringify(json))
            }
        })

        await use(context)

        for (const page of context.pages()) {
            await page.evaluate(() => {
                const coverage = (window as any).__coverage__
                ;(window as any).collectIstanbulCoverage(JSON.stringify(coverage))
            })
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
