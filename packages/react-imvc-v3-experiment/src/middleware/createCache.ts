/**
 * 代码复制自：https://github.com/ptarjan/node-cache，用法跟其文档一致
 * 复制原因是，它只支持一个 cache 单例
 * 我们的需求是，每次调用，产生一个独立的实例
 */
export interface Cache {
  put: (
    key: string,
    value: any,
    time?: number,
    timeoutCallback?: (...props: any[]) => any
  ) => any
  del: (key: string) => boolean
  clear: () => void
  get: (key: string) => any
  size: () => number
  memsize: () => number
  debug: (bool: boolean) => void
  hits: () => number
  misses: () => number
  keys: () => string[]
}

export interface Record {
  value: any
  expire: number
  timeout?: NodeJS.Timeout | number
}

export default () => {
  let result: Cache
  let cache: { [propName: string]: any } = Object.create(null)
  let debug = false
  let hitCount = 0
  let missCount = 0
  let size = 0

  function _del(key: string) {
    size--
    delete cache[key]
  }

  result = {
    put: function (key, value, time, timeoutCallback): any {
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

      let oldRecord = cache[key]
      if (oldRecord) {
        clearTimeout(oldRecord.timeout)
      } else {
        size++
      }

      let record: Record = {
        value: value,
        expire: (time || 0) + Date.now(),
      }

      if (!isNaN(record.expire)) {
        record.timeout = setTimeout(function () {
          _del(key)
          if (timeoutCallback) {
            timeoutCallback(key, value)
          }
        }, time)
      }

      cache[key] = record

      return value
    },

    del: function (key): boolean {
      let canDelete = true

      let oldRecord: Record = cache[key]
      if (oldRecord) {
        clearTimeout(oldRecord.timeout as NodeJS.Timeout)
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
    },
    clear: function (): void {
      for (let key in cache) {
        clearTimeout(cache[key].timeout)
      }
      size = 0
      cache = Object.create(null)
      if (debug) {
        hitCount = 0
        missCount = 0
      }
    },

    get: function (key): any {
      let data = cache[key]
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
    },

    size: function (): number {
      return size
    },

    memsize: function (): number {
      let size = 0
      for (let _ in cache) {
        size++
      }
      return size
    },

    debug: function (bool): void {
      debug = bool
    },

    hits: function (): number {
      return hitCount
    },

    misses: function (): number {
      return missCount
    },

    keys: function (): string[] {
      return Object.keys(cache)
    },
  }

  return result
}
