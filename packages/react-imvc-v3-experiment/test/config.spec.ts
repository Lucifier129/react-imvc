import getConfig, * as EntireConfig from '../src/config'

describe('config test', () => {
  describe('getConfig', () => {
    it('get default config with pass empty argument', () => {
      let config = getConfig()
      expect(config).toStrictEqual(EntireConfig.defaultConfig)
    })

    it('config attribute passed in could cover default config when config is a object', () => {
      let options = {
        config: {
          basename: 'test',
        },
      }
      let config = getConfig(options)
      expect(config.basename).toBe('test')
    })

    it('config attribute passed in could cover default config when config is a path string', () => {
      let options = {
        config: './test/config.ts',
      }
      let config = getConfig(options)
      expect(config.basename).toBe('test')
    })
  })
})
