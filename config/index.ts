/**
 * 获取配置
 */
import path from 'path'
import defaultConfig, { Config } from'./config.defaults'

export interface Options {
	config: Config
}

const getConfig: (options: Options) => Config = (options) => {
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

export default getConfig
export * from './config.defaults'
export * from './babel'