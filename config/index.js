/**
 * 获取配置
 */
var path = require('path')
var defaultConfig = require('./config.defaults')

module.exports = function getConfig(options) {
	var config = Object.assign({}, defaultConfig)

	options = options || {}

	if (options.config) {
		var customConfig = require(path.resolve(options.config))
		config = Object.assign(config, customConfig)
	}

	return config
}