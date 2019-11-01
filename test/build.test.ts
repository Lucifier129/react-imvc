import * as util from '../src/build/util'
import defaultConfig from '../src/config/config.defaults'
const pkg = require('../package.json')

process.env.NODE_ENV = "production"

describe('build', () => {
  describe('createWebpackConfig', () => {
    describe('isServer should avaliable', () => {
      it.todo('isServer is true')

      it.todo('isServer is false')
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