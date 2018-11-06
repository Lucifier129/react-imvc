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

	return config
}
