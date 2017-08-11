/**
 * 获取配置
 */
 import path from 'path'
 import defaultConfig from './config.defaults'

 export default function getConfig(options) {
	var config = Object.assign({}, defaultConfig)

	options = options || {}

	if (options.config) {
		var customConfig = require(path.resolve(options.config))
		config = Object.assign(config, customConfig)
	}

	return config
}