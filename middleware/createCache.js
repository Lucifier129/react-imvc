/**
 * 代码复制自：https://github.com/ptarjan/node-cache，用法跟其文档一致
 * 复制原因是，它只支持一个 cache 单例
 * 我们的需求是，每次调用，产生一个独立的实例
 */

module.exports = function createCache () {
  var result = {}
  var cache = Object.create(null)
  var debug = false
  var hitCount = 0
  var missCount = 0
  var size = 0

  result.put = function (key, value, time, timeoutCallback) {
    if (debug) {
      console.log('caching: %s = %j (@%s)', key, value, time)
    }

    if (
      typeof time !== 'undefined' &&
      (typeof time !== 'number' || isNaN(time) || time <= 0)
    ) {
      throw new Error('Cache timeout must be a positive number')
    } else if (
      typeof timeoutCallback !== 'undefined' &&
      typeof timeoutCallback !== 'function'
    ) {
      throw new Error('Cache timeout callback must be a function')
    }

    var oldRecord = cache[key]
    if (oldRecord) {
      clearTimeout(oldRecord.timeout)
    } else {
      size++
    }

    var record = {
      value: value,
      expire: time + Date.now()
    }

    if (!isNaN(record.expire)) {
      record.timeout = setTimeout(
        function () {
          _del(key)
          if (timeoutCallback) {
            timeoutCallback(key, value)
          }
        },
        time
      )
    }

    cache[key] = record

    return value
  }

  result.del = function (key) {
    var canDelete = true

    var oldRecord = cache[key]
    if (oldRecord) {
      clearTimeout(oldRecord.timeout)
      if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
        canDelete = false
      }
    } else {
      canDelete = false
    }

    if (canDelete) {
      _del(key)
    }

    return canDelete
  }

  function _del (key) {
    size--
    delete cache[key]
  }

  result.clear = function () {
    for (var key in cache) {
      clearTimeout(cache[key].timeout)
    }
    size = 0
    cache = Object.create(null)
    if (debug) {
      hitCount = 0
      missCount = 0
    }
  }

  result.get = function (key) {
    var data = cache[key]
    if (typeof data !== 'undefined') {
      if (isNaN(data.expire) || data.expire >= Date.now()) {
        if (debug) hitCount++
        return data.value
      } else {
        // free some space
        if (debug) missCount++
        size--
        delete cache[key]
      }
    } else if (debug) {
      missCount++
    }
    return null
  }

  result.size = function () {
    return size
  }

  result.memsize = function () {
    var size = 0, key
    for (key in cache) {
      size++
    }
    return size
  }

  result.debug = function (bool) {
    debug = bool
  }

  result.hits = function () {
    return hitCount
  }

  result.misses = function () {
    return missCount
  }

  result.keys = function () {
    return Object.keys(cache)
  }

  return result
}
