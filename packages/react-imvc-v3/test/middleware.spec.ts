import createCache, { Cache } from '../src/middleware/createCache'
import shareRoot from '../src/middleware/shareRoot'

jest.useFakeTimers()

describe('middleware', () => {
  describe('createCache', () => {
    let cache: Cache
    beforeEach(() => {
      cache = createCache()
    })
    afterEach(() => {
      cache.clear()
    })

    it('can get the right value from cache after putting it in', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
        {
          key: 'c',
          value: {
            c: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })
      let item1 = cache.get('a')
      let item2 = cache.get('b')
      let item3 = cache.get('c')

      expect(item1).not.toBeNull()
      expect(item2).not.toBeNull()
      expect(item3).not.toBeNull()
      expect(typeof item1).toBe('object')
      expect(typeof item2).toBe('object')
      expect(typeof item3).toBe('object')
      expect(item1.a).toBe('test')
      expect(item2.b).toBe('test')
      expect(item3.c).toBe('test')
    })

    it('can coverthe old value', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'a',
          value: {
            a: 'test1',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })
      let item = cache.get('a')

      expect(item).not.toBeNull()
      expect(typeof item).toBe('object')
      expect(item.a).toBe('test1')
    })

    it('can‘t get the right value from cache after deleting it', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
        {
          key: 'c',
          value: {
            c: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })
      let item1 = cache.get('a')
      let item2 = cache.get('b')
      let item3 = cache.get('c')

      expect(item1).not.toBeNull()
      expect(item2).not.toBeNull()
      expect(item3).not.toBeNull()
      expect(typeof item1).toBe('object')
      expect(typeof item2).toBe('object')
      expect(typeof item3).toBe('object')
      expect(item1.a).toBe('test')
      expect(item2.b).toBe('test')
      expect(item3.c).toBe('test')

      let result = cache.del('a')

      expect(result).toBeTruthy()
      expect(cache.get('a')).toBeNull()
    })

    it('can‘t get the right value from cache after clearing cache', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })
      let item1 = cache.get('a')

      expect(item1).not.toBeNull()
      expect(typeof item1).toBe('object')
      expect(item1.a).toBe('test')

      cache.clear()

      expect(cache.get('a')).toBeNull()
    })

    it('can get the right size', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
      ]
      let list1 = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
      ]
      let list2 = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
        {
          key: 'c',
          value: {
            c: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      expect(cache.size()).toBe(1)

      cache.clear()
      list1.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      expect(cache.size()).toBe(2)

      cache.clear()
      list2.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      expect(cache.size()).toBe(3)
    })

    it('can get the right size', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
      ]
      let list1 = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
      ]
      let list2 = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
        {
          key: 'c',
          value: {
            c: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      expect(cache.memsize()).toBe(1)

      cache.clear()
      list1.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      expect(cache.memsize()).toBe(2)

      cache.clear()
      list2.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      expect(cache.memsize()).toBe(3)
    })

    it('debug can work', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
        {
          key: 'c',
          value: {
            c: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })
      cache.get('a')
      cache.get('b')
      cache.get('c')
      cache.get('d')
      cache.get('e')
      cache.get('f')

      expect(cache.hits()).toBe(0)
      expect(cache.misses()).toBe(0)

      cache.debug(true)

      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })

      cache.get('a')
      cache.get('b')
      cache.get('c')
      cache.get('d')
      cache.get('e')
      cache.get('f')

      expect(cache.hits()).toBe(3)
      expect(cache.misses()).toBe(3)

      cache.debug(false)
    })

    it('can get the right size', () => {
      let list = [
        {
          key: 'a',
          value: {
            a: 'test',
          },
          time: 10000,
        },
        {
          key: 'b',
          value: {
            b: 'test',
          },
          time: 10000,
        },
        {
          key: 'c',
          value: {
            c: 'test',
          },
          time: 10000,
        },
      ]
      list.forEach((item) => {
        cache.put(item.key, item.value, item.time)
      })
      let keys = cache.keys()

      expect(keys.length).toBe(3)
      expect(keys.includes('a')).toBeTruthy()
      expect(keys.includes('b')).toBeTruthy()
      expect(keys.includes('c')).toBeTruthy()
    })

    it('time out callback can work', () => {
      const callback = jest.fn()
      let item = {
        key: 'a',
        value: {
          a: 'test',
        },
        time: 10000,
        timeoutCallback: callback,
      }
      cache.put(item.key, item.value, item.time, item.timeoutCallback)

      jest.advanceTimersByTime(10000)

      expect(callback).toBeCalled()
    })
  })

  describe('shareRoot', () => {
    describe('`root` is in `req.url` splited by `/`', () => {
      it('should remove root from url add set basename', () => {
        const root = `/root`
        const require = {
          url: '/root/foo/bar/1',
          basename: '',
        }
        const handler = shareRoot(root)
        handler(require as any, {} as any, () => {})

        expect(require.url).toBe('/foo/bar/1')
        expect(require.basename).toBe('/root')
      })

      it('should format `root`, reset `url` and set `basename`', () => {
        const root = `/root/`
        const require = {
          url: '/root/foo/bar/1',
          basename: '',
        }
        const handler = shareRoot(root)
        handler(require as any, {} as any, () => {})

        expect(require.url).toBe('/foo/bar/1')
        expect(require.basename).toBe('/root')
      })
    })

    describe('`root` is in `req.url` but not splited by `/`', () => {
      it('should break url and format it and set basename', () => {
        const root = `/root`
        const require = {
          url: '/rootfoo/bar/1',
          basename: '',
        }
        const handler = shareRoot(root)
        handler(require as any, {} as any, () => {})

        expect(require.url).toBe('/foo/bar/1')
        expect(require.basename).toBe('/root')
      })
    })

    describe('`root` is not in `req.url`', () => {
      it('should not remove root from url and not set basename', () => {
        const root = `/root`
        const require = {
          url: '/foo/bar/1',
          basename: '',
        }
        const handler = shareRoot(root)
        handler(require as any, {} as any, () => {})

        expect(require.url).toBe('/foo/bar/1')
        expect(require.basename).toBe('')
      })
    })
  })
})
