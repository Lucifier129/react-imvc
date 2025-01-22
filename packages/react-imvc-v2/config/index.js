/**
 * 获取配置
 */
const path = require('path')
const defaultConfig = require('./config.defaults')

module.exports = function getConfig(options) {
    let config = Object.assign({}, defaultConfig)

    options = options || {}

    let customConfig
    switch (typeof options.config) {
        case 'object':
            customConfig = options.config
            break
        case 'string':
            customConfig = require(path.resolve(options.config))
            customConfig = customConfig.default || customConfig
            break
    }

    Object.assign(config, customConfig)

    if (config.useBabelRuntime) {
        try {
            require.resolve('@babel/runtime/package.json')
        } catch (error) {
            console.error('please install @babel/runtime first, or set useBabelRuntime to false in imvc.config.js file')
            process.exit(1)
        }
    }

    return config
}
