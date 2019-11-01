import * as util from '../src/build/util'
import createWebpackConfig from '../src/build/createWebpackConfig'
import defaultConfig from '../src/config/config.defaults'
const pkg = require('../package.json')

process.env.NODE_ENV = "production"

describe('build', () => {
  describe('createWebpackConfig', () => {
    describe('isServer should avaliable', () => {
      it('isServer is true', () => {
        const config = createWebpackConfig(defaultConfig, true)

        expect(config.target).toBe('node')
        expect(config.entry).toStrictEqual({ "index": ["D:\\Projects\\react-imvc\\src"] })
        expect(config.output).toBeDefined()
        if (config.output) {
          expect(config.output.filename).toBe('server.bundle.js')
          expect(config.output.libraryTarget).toBe('commonjs2')
          expect(config.output.path).toBe('D:\\Projects\\react-imvc\\publish')
        }
        expect(config.devtool).toBe('source-map')
        expect(config.plugins).toBeDefined()
        if (config.plugins) {
          expect(config.plugins.length).toBe(1)          
        }
        expect(config.optimization).toStrictEqual({
          splitChunks: {
            chunks: 'all',
            name: 'vendor'
          }
        })
      })

      it('isServer is false', () => {
        const config = createWebpackConfig(defaultConfig)

        expect(config.target).toBe('web')
        expect(config.entry).toStrictEqual({ "index": ["D:\\Projects\\react-imvc\\src\\entry\\client"] })
        expect(config.output).toBeDefined()
        if (config.output) {
          expect(config.output.filename).toBe('js/[name].js')
          expect(config.output.chunkFilename).toBe('js/[name].js')
          expect(config.output.path).toBe('D:\\Projects\\react-imvc\\publish\\static')
        }
        expect(config.devtool).toBe('')
        expect(config.plugins).toBeDefined()
        if (config.plugins) {
          expect(config.plugins.length).toBe(3)          
        }
        expect(config.optimization).toStrictEqual({
          splitChunks: {
            chunks: 'all',
            name: 'vendor'
          }
        })
      })
    })

    describe('NODE_ENV', () => {
      it.todo('production')

      it.todo('development')

      it.todo('test')
    })
  })

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

  describe('setupDevEnv', () => {
    it.todo('should work')
  })

  describe('index', () => {
    it.todo('file after building should run as same as start')
  })
})