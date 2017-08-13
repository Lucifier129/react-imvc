/**
 * 获取配置
 */
 import path from 'path'
 import defaultConfig from './config.defaults'

 export default function getConfig(options) {
	let config = Object.assign({}, defaultConfig)

	options = options || {}
	
	try {
		if (typeof options.config === 'string') {
			let configFile = options.config || 'imvc.config.js'
			let customConfig = require(path.resolve(configFile))
			customConfig = customConfig.default || customConfig
			config = Object.assign(config, customConfig)
		} else if (typeof options.config === 'object') {
			config = Object.assign(config, options.config)
		}
		
	} catch(error) {
		// ignore error
	}

	return config
}