/**
 * 获取配置
 */
import path from 'path'
import defaultConfig, { Config } from'./config.defaults'

export interface Options {
	config?: Config
	[x: string]: unknown
	_?: string[]
	$0?: string;
}

type GetConfig = (options: Options) => Config

const getConfig: GetConfig = (options) => {
	let config = Object.assign({}, defaultConfig)

	options = options || {}

	let customConfig: any
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