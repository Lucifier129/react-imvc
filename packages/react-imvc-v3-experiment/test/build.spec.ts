import webpack from 'webpack'
import { matchExternals, getExternals } from '../src/build/util'
import createWebpackConfig from '../src/build/createWebpackConfig'
import defaultConfig from '../src/config/config.defaults'
const pkg = require('../package.json')

function isEntry(input: any): input is webpack.Entry {
  return (
    typeof input === 'object' &&
    Object.prototype.toString.call(input) === '[object] Array'
  )
}
function standardize(url: string): string {
  return url.replace(/\\/gi, '/')
}

describe('build', () => {
  describe('createWebpackConfig', () => {
    describe('isServer should avaliable', () => {
      it('isServer is true', async () => {
        const config = await createWebpackConfig(defaultConfig, true)

        expect(config.target).toBe('node')
        expect(config.entry).toBeDefined()
        expect(typeof config.entry).toBe('object')
        if (isEntry(config.entry)) {
          expect(standardize(config.entry.index as string)).toMatch('/src')
        }
        expect(config.output).toBeDefined()
        expect(config.output).toHaveProperty('filename', 'server.bundle.js')
        expect(config.output).toHaveProperty('libraryTarget', 'commonjs2')
        if (config.output) {
          expect(standardize(config.output.path as string)).toMatch('/publish')
        }
        expect(config.devtool).toBe('source-map')
        expect(config.plugins).toBeDefined()
        expect(config.plugins).toHaveLength(1)
        expect(config.optimization).toStrictEqual({
          splitChunks: {
            chunks: 'all',
            name: 'vendor',
          },
        })
      })

      it('isServer is false', async () => {
        const config = await createWebpackConfig(defaultConfig)

        expect(config.target).toBe('web')
        expect(config.entry).toBeDefined()
        expect(typeof config.entry).toBe('object')
        if (isEntry(config.entry)) {
          expect(standardize(config.entry.index as string)).toMatch(
            '/src/entry/client'
          )
        }
        expect(config.output).toBeDefined()
        expect(config.output).toHaveProperty('filename', 'js/[name].js')
        expect(config.output).toHaveProperty('chunkFilename', 'js/[name].js')
        if (config.output) {
          expect(standardize(config.output.path as string)).toMatch(
            '/publish/static'
          )
        }
        expect(config.devtool).toBe('')
        expect(config.plugins).toBeDefined()
        expect(config.plugins).toHaveLength(3)
        expect(config.optimization).toStrictEqual({
          splitChunks: {
            chunks: 'all',
            name: 'vendor',
          },
        })
      })
    })

    describe('NODE_ENV', () => {
      describe('production', () => {
        it('isServer is true', async () => {
          process.env.NODE_ENV = 'production'
          const options = Object.assign(defaultConfig)
          const config = await createWebpackConfig(options, true)

          expect(config.mode).toBe('production')
          expect(config.watch).toBeFalsy()
          expect(config.output).toBeDefined()
          expect(config.output).toHaveProperty('filename', 'server.bundle.js')
          expect(config.output).toHaveProperty('libraryTarget', 'commonjs2')
          if (config.output) {
            expect(standardize(config.output.path as string)).toMatch(
              '/publish'
            )
          }
          expect(config.optimization).toBeDefined()
          if (config.optimization) {
            expect(config.optimization.minimize).toBeFalsy()
          }
        })

        it('isServer is false', async () => {
          process.env.NODE_ENV = 'production'
          const options = Object.assign(defaultConfig)
          const config = await createWebpackConfig(options)

          expect(config.mode).toBe('production')
          expect(config.watch).toBeFalsy()
          expect(config.output).toBeDefined()
          expect(config.output).toHaveProperty(
            'filename',
            'js/[name]-[contenthash:6].js'
          )
          expect(config.output).toHaveProperty(
            'chunkFilename',
            'js/[name]-[contenthash:6].js'
          )
          if (config.output) {
            expect(standardize(config.output.path as string)).toMatch(
              '/publish/static'
            )
          }
          expect(config.optimization).toBeDefined()
          expect(config.optimization).toHaveProperty('minimizer')
          expect(config.optimization).toHaveProperty('splitChunks', {
            chunks: 'all',
            name: 'vendor',
          })
        })
      })

      describe('development', () => {
        it('isServer is true', async () => {
          process.env.NODE_ENV = 'development'
          const options = Object.assign(defaultConfig)
          const config = await createWebpackConfig(options, true)

          expect(config.mode).toBe('development')
          expect(config.watch).toBeTruthy()
          expect(config.output).toBeDefined()
          expect(config.output).toHaveProperty('filename', 'server.bundle.js')
          expect(config.output).toHaveProperty('libraryTarget', 'commonjs2')
          if (config.output) {
            expect(standardize(config.output.path as string)).toMatch(
              '/publish'
            )
          }
          expect(config.optimization).toBeDefined()
          expect(config.optimization).toHaveProperty('splitChunks', {
            chunks: 'all',
            name: 'vendor',
          })
        })

        it('isServer is false', async () => {
          process.env.NODE_ENV = 'development'
          const options = Object.assign(defaultConfig)
          const config = await createWebpackConfig(options)

          expect(config.mode).toBe('development')
          expect(config.watch).toBeTruthy()
          expect(config.output).toBeDefined()
          expect(config.output).toHaveProperty('filename', 'js/[name].js')
          expect(config.output).toHaveProperty('chunkFilename', 'js/[name].js')
          if (config.output) {
            expect(standardize(config.output.path as string)).toMatch(
              '/publish/static'
            )
          }
          expect(config.optimization).toBeDefined()
          expect(config.optimization).toHaveProperty('splitChunks', {
            chunks: 'all',
            name: 'vendor',
          })
        })
      })

      describe('test', () => {
        it('isServer is true', async () => {
          process.env.NODE_ENV = 'test'
          const options = Object.assign(defaultConfig)
          const config = await createWebpackConfig(options, true)

          expect(config.mode).toBe('development')
          expect(config.watch).toBeFalsy()
          expect(config.output).toBeDefined()
          expect(config.output).toHaveProperty('filename', 'server.bundle.js')
          expect(config.output).toHaveProperty('libraryTarget', 'commonjs2')
          if (config.output) {
            expect(standardize(config.output.path as string)).toMatch(
              '/publish'
            )
          }
          expect(config.optimization).toBeDefined()
          expect(config.optimization).toHaveProperty('splitChunks', {
            chunks: 'all',
            name: 'vendor',
          })
        })

        it('isServer is false', async () => {
          process.env.NODE_ENV = 'test'
          const options = Object.assign(defaultConfig)
          const config = await createWebpackConfig(options)

          expect(config.mode).toBe('development')
          expect(config.watch).toBeFalsy()
          expect(config.output).toBeDefined()
          expect(config.output).toHaveProperty('filename', 'js/[name].js')
          expect(config.output).toHaveProperty('chunkFilename', 'js/[name].js')
          if (config.output) {
            expect(standardize(config.output.path as string)).toMatch(
              '/publish/static'
            )
          }
          expect(config.optimization).toBeDefined()
          expect(config.optimization).toHaveProperty('splitChunks', {
            chunks: 'all',
            name: 'vendor',
          })
        })
      })
    })
  })

  describe('util', () => {
    describe('getExternals', () => {
      it('getExternals can get all dependences', () => {
        let dependences = getExternals(defaultConfig)
        let sourceLength =
          Object.keys(pkg.dependencies).length +
          Object.keys(pkg.devDependencies).length

        expect(dependences.length).toBe(sourceLength)
      })
    })

    describe('matchExternals', () => {
      it('matchExternals can match the dependence', () => {
        let externals = [
          '@types/fetch-mock',
          '@types/jest',
          'fetch-mock',
          'jest',
          'puppeteer',
        ]
        let list = [
          {
            value: 'jest',
            result: true,
          },
          {
            value: 'puppeteer',
            result: true,
          },
          {
            value: 'react',
            result: false,
          },
        ]
        list.forEach((item) => {
          expect(matchExternals(externals, item.value)).toBe(item.result)
        })
      })
    })
  })
})
