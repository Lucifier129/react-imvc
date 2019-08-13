/**
 * 获取配置
 */
import path from 'path'
import defaultConfig from'./config.defaults'
import RIMVC from '../index'

export interface Options {
	config: RIMVC.Config | string
	[x: string]: unknown
	_?: string[]
	$0?: string;
}

interface GetConfig {
	(options: Options): RIMVC.Config
}

const getConfig: GetConfig = (options) => {
	let config = Object.assign({}, defaultConfig)

	options = options || {}

	let customConfig: any
	switch (typeof options.config) {
		case 'object':
			customConfig = options.config
			break
		case 'string':
			customConfig = require(path.resolve(options.config as string))
			customConfig = customConfig.default || customConfig
			break
	}
	Object.assign(config, customConfig)

	return config
}

export default getConfig
export * from './config.defaults'
export * from './babel'