/**
 * 获取配置
 */
import path from 'path'
import defaultConfig from './config.defaults'
import { Options, Config } from '..'

export { default as defaultConfig } from './config.defaults'
export { default as babel } from './babel'

export default function getConfig(options?: Options): Config {
	let config = Object.assign({}, defaultConfig)

	options = options || {}

	let customConfig: Partial<Config> = {}
	switch (typeof options.config) {
		case 'object':
			customConfig = options.config as object
			break
		case 'string':
			let customConfigModule = require(path.resolve(options.config as string))
			customConfig = customConfigModule.default as object || customConfigModule
			break
	}
	Object.assign(config, customConfig)

	return config
}