/**
 * 缓存视图-中间件
 */
import express from 'express'
import createCache, { Result } from './createCache'
import { RequestHandler, Req, Res } from '../types'

interface Settings {
	timeout: number
	max: number
	headers: Record<string, string>
	key: (url: string, req: express.Request) => string
	debug: boolean
}

let defaults: Settings = {
	timeout: 5 * 60 * 1000, // 缓存时长
	max: 5, // 缓存数最大值
	headers: {
		// 缓存的 response headers 默认配置
		'Content-Type': 'text/html'
	},
	key: (url, req) => url,
	debug: false
}


var callNext: RequestHandler = (req, res, next) => next()

export default (settings: Settings) => {
	// 只在生产环境，或者开启了 debug = true 的情况下，做缓存
	if (process.env.NODE_ENV !== 'production' && !(settings && settings.debug)) {
		return callNext as express.RequestHandler
	}
	settings = Object.assign({}, defaults, settings)

	var cache: Result = createCache()

	return function (req: Req, res: Res, next: express.NextFunction) {
		var cacheKey = settings.key(req.originalUrl, req)
		var cacheContent: any
		if (cache.get) {
			cacheContent = cache.get(cacheKey)
		}

		// 命中缓存，直接返回结果
		if (cacheContent) {
			res.set(settings.headers)
			res.send(cacheContent)
			return
		}

		// 劫持 res.render，缓存其结果
		res.sendResponse = res.send
		res.send = (body: any) => {
			res.sendResponse(body)
			if (cache)
				cache.put(cacheKey, body, settings.timeout)
			if (settings.max && cache.size() > settings.max) {
				// 如果缓存数大于最大值，删除第一个缓存
				cache.del(cache.keys()[0])
			}
			return res
		}

		// 调用下一个中间件
		next()
	}
}
