/**
 * 缓存视图-中间件
 */
var _ = require('lodash')
var createCache = require('./createCache')

var defaults = {
  timeout: 5 * 60 * 1000, // 缓存时长
  max: 5, // 缓存数最大值
  headers: {
    // 缓存的 response headers 默认配置
    'Content-Type': 'text/html'
  }
}

var callNext = (req, res, next) => next()

module.exports = function cacheView (settings) {
  // 只在生产环境做缓存
  if (process.env.NODE_ENV !== 'production') {
    return callNext
  }
  settings = _.extend({}, defaults, settings)

  var cache = createCache()
  var addCache = (cacheKey, res) => (error, cacheContent) => {
    if (error) {
      throw error
      return
    }
    res.send(cacheContent)
    cache.put(cacheKey, cacheContent, settings.timeout)
    if (cache.size() > settings.max) {
      // 如果缓存数大于最大值，删除第一个缓存
      cache.del(cache.keys()[0])
    }
  }

  return function (req, res, next) {
    var cacheKey = req.originalUrl
    var cacheContent = cache.get(cacheKey)

    // 命中缓存，直接返回结果
    if (cacheContent) {
      res.set(settings.headers)
      res.end(cacheContent)
      return
    }

    // 劫持 res.render，缓存其结果
    var _render = res.render
    res.render = function (viewName, options) {
      return _render.call(this, viewName, options, addCache(cacheKey, res))
    }

    // 调用下一个中间件
    next()
  }
}
