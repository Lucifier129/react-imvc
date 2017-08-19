/**
 * 获取配置
 */
 import path from 'path'
 import defaultConfig from './config.defaults'

 export default function getConfig(options) {
	let config = Object.assign({}, defaultConfig)

	options = options || {}
	
	try {
		let customConfig
		switch (typeof options.config) {
			case 'object':
				customConfig = options.config
				break
			case 'string':
				customConfig = require(path.resolve(options.config))
				customConfig = customConfig.default || customConfig
				break
			default:
				customConfig = require(path.resolve('package.json')).config
		}
		Object.assign(config, customConfig)
	} catch(error) {
		console.log('error', error)
		// ignore error
	}

	return config
}