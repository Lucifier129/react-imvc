import fetchMock from 'fetch-mock'
import fetch from 'node-fetch'
import {
  getFlatList,
  toJSON,
  toText,
  timeoutReject,
  isAbsoluteUrl,
  mapValues,
  isThenable,
  setValueByPath,
  getValueByPath,
} from '../src/util'
import { Route } from 'create-app/client'

const defaultOption = {
  overwriteRoutes: true,
  fetch,
  fallbackToNetwork: true,
}

const noop = () => {}

describe('util test', () => {
  describe('toJSON', () => {
    afterEach(() => {
      fetchMock.restore()
    })
    it('toJSON return Promise resolve an object', async () => {
      fetchMock
        .mock('http://www.success1.com', { name: 'a' }, defaultOption)
        .sandbox()('http://www.success1.com')
        .then((res) => {
          const json = toJSON(res)

          expect(typeof json.then).toBe('function')
          expect(json instanceof Promise).toBeTruthy()

          const obj = json.then()

          expect(typeof obj).toBe('object')
        })
    })

    it('toJSON throw Error when response status is not normal', async () => {
      fetchMock
        .mock('http://www.error1.com', 400, defaultOption)
        .sandbox()('http://www.error1.com')
        .catch((e) => {
          expect(toJSON(e)).toMatch(/error/gi)
        })
    })
  })

  describe('toText', () => {
    afterEach(() => {
      fetchMock.restore()
    })

    it('toText return Promise resolve an object', async () => {
      fetchMock
        .mock('http://www.success2.com', 'a', defaultOption)
        .sandbox()('http://www.success2.com')
        .then(async (res) => {
          const text = toText(res)

          expect(typeof text.then).toBe('function')
          expect(text instanceof Promise).toBeTruthy()

          const str = await text.then()

          expect(typeof str).toBe('string')
        })
    })

    it('toText throw Error when response status is not normal', async () => {
      fetchMock
        .mock('http://www.error2.com', 400, defaultOption)
        .sandbox()('http://www.error2.com')
        .catch((e) => {
          expect(toText(e)).toMatch(/error/gi)
        })
    })
  })

  describe('timeoutReject', () => {
    beforeAll(() => {
      jest.useFakeTimers()
    })

    afterAll(() => {
      jest.clearAllTimers()
    })

    it('timeoutReject reject in time with reject info when promise time greater then reject time passed in', () => {
      const promise = new Promise((_, reject) => {
        setTimeout(reject, 100, 'promise')
      })

      expect(timeoutReject(promise, 500, '')).resolves.toMatch('promise')
    })

    it('timeoutReject reject in time with promise info when reject time greater then promise time passed in', () => {
      const promise = new Promise((_, reject) => {
        setTimeout(reject, 500, 'promise')
      })

      expect(timeoutReject(promise, 100, '')).rejects.toMatch(/error/i)
    })
  })

  describe('isAbsoluteUrl', () => {
    it("return true when the url passed in has 'http'", () => {
      expect(isAbsoluteUrl('http://www.example.com')).toBeTruthy()
    })
    it("return true when the url passed in has '//'", () => {
      expect(isAbsoluteUrl('//www.example.com')).toBeTruthy()
    })
    it("return true when the url passed in does not has 'http' or '//'", () => {
      expect(isAbsoluteUrl('www.example.com')).toBeFalsy()
    })
  })

  describe('mapValues', () => {
    it('every value will be passed in the function we passed in as progress(test with number)', () => {
      const fn = (a: number, b: string) => a + 1
      const source = {
        a: 1,
        b: 2,
        c: 3,
      }
      const result = mapValues(source, fn)

      expect(result.a).toBe(2)
      expect(result.b).toBe(3)
      expect(result.c).toBe(4)
    })

    it('every value will be passed in the function we passed in as progress(test with string)', () => {
      const fn = (a: string, b: string) => b + a
      const source = {
        a: 'd',
        b: 'e',
        c: 'f',
      }
      const result = mapValues(source, fn)

      expect(result.a).toBe('ad')
      expect(result.b).toBe('be')
      expect(result.c).toBe('cf')
    })
  })

  describe('isThenable', () => {
    it('success test', () => {
      let promise = new Promise(() => {})

      expect(isThenable(promise)).toBeTruthy()
      expect(isThenable(Promise.all([]))).toBeTruthy()
    })

    it('failure test', () => {
      expect(isThenable({})).toBeFalsy()
      expect(isThenable(0)).toBeFalsy()
      expect(isThenable('0')).toBeFalsy()
      expect(isThenable(true)).toBeFalsy()
    })
  })

  describe('setValueByPath', () => {
    describe('store value with key in object passed successfully when source is object', () => {
      it('when path is a simple string', () => {
        let obj = {}
        let path = 'example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['example']).toBe('object')
        expect(result['example'].a).toBe(2)
      })

      it("when path is a two level path string split with '/'", () => {
        let obj = {}
        let path = 'home/example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['home']).toBe('object')
        expect(typeof result['home']['example']).toBe('object')
        expect(result['home']['example'].a).toBe(2)
      })

      it("when path is a three level path string split with '/'", () => {
        let obj = {}
        let path = 'jack/home/example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['jack']).toBe('object')
        expect(typeof result['jack']['home']).toBe('object')
        expect(typeof result['jack']['home']['example']).toBe('object')
        expect(result['jack']['home']['example'].a).toBe(2)
      })

      it("when path is a two level path string split with '.'", () => {
        let obj = {}
        let path = 'home.example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['home']).toBe('object')
        expect(typeof result['home']['example']).toBe('object')
        expect(result['home']['example'].a).toBe(2)
      })

      it("when path is a two level path string split with ':'", () => {
        let obj = {}
        let path = 'home:example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['home']).toBe('object')
        expect(typeof result['home']['example']).toBe('object')
        expect(result['home']['example'].a).toBe(2)
      })
    })

    describe('store value with key in object passed successfully when source is array', () => {
      it('when path is a simple string', () => {
        let obj = {}
        let path = 'example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['example']).toBe('object')
        expect(result['example'].a).toBe(2)
      })

      it("when path is a two level path string split with '/'", () => {
        let obj = {}
        let path = 'home/example'
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['home']).toBe('object')
        expect(typeof result['home']['example']).toBe('object')
        expect(result['home']['example'].a).toBe(2)
      })
    })

    describe('store value with key in object passed successfully when path is a array', () => {
      it('path array has only one item', () => {
        let obj = {}
        let path = ['example']
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['example']).toBe('object')
        expect(result['example'].a).toBe(2)
      })

      it('path array has two item', () => {
        let obj = {}
        let path = ['home', 'example']
        let value = {
          a: 2,
        }
        let result = setValueByPath(obj, path, value)

        expect(typeof result).toBe('object')
        expect(typeof result['home']).toBe('object')
        expect(typeof result['home']['example']).toBe('object')
        expect(result['home']['example'].a).toBe(2)
      })
    })
  })

  describe('getValueByPath', () => {
    describe('get value with key from object passed successfully when path is a string', () => {
      it('when path is a simple string', () => {
        let obj = {
          example: 'target',
        }
        let path = 'example'
        let result = getValueByPath(obj, path)

        expect(result).toBe('target')
      })

      it('when path is a two level string', () => {
        let obj = {
          home: {
            example: 'target',
          },
        }
        let path = 'home/example'
        let result = getValueByPath(obj, path)

        expect(result).toBe('target')
      })

      it('when path is a three level string', () => {
        let obj = {
          jack: {
            home: {
              example: 'target',
            },
          },
        }
        let path = 'jack/home/example'
        let result = getValueByPath(obj, path)

        expect(result).toBe('target')
      })
    })

    describe('get value with key from object passed successfully when path is a array', () => {
      it('when path is a array has only one item', () => {
        let obj = {
          example: 'target',
        }
        let path = ['example']
        let result = getValueByPath(obj, path)

        expect(result).toBe('target')
      })

      it('when path is a array has two item', () => {
        let obj = {
          home: {
            example: 'target',
          },
        }
        let path = ['home', 'example']
        let result = getValueByPath(obj, path)

        expect(result).toBe('target')
      })

      it('when path is a array has three item', () => {
        let obj = {
          jack: {
            home: {
              example: 'target',
            },
          },
        }
        let path = ['jack', 'home', 'example']
        let result = getValueByPath(obj, path)

        expect(result).toBe('target')
      })
    })
  })

  describe('getFlatList', () => {
    it('test when we pass in double dimensional array', () => {
      let list: Route[][] = [
        [
          {
            path: '',
            controller: noop as any,
          },
          {
            path: '',
            controller: noop as any,
          },
        ],
        [
          {
            path: '',
            controller: noop as any,
          },
        ],
      ]
      let result = getFlatList(list)

      expect(result instanceof Array).toBeTruthy()
      expect(result.length).toBe(3)
    })

    it('test when we pass in array', () => {
      let list: Route[] = [
        {
          path: '',
          controller: noop as any,
        },
        {
          path: '',
          controller: noop as any,
        },
      ]
      let result = getFlatList(list)

      expect(result instanceof Array).toBeTruthy()
      expect(result.length).toBe(2)
      for (let key in result) {
        expect(result[key] instanceof Array).not.toBeTruthy()
      }
    })

    it('test when we pass in array and double dimensional array', () => {
      type RouteList = Route[]
      type inputList = (Route | RouteList)[]
      let list: inputList = [
        {
          path: '',
          controller: noop as any,
        },
        {
          path: '',
          controller: noop as any,
        },
        [
          {
            path: '',
            controller: noop as any,
          },
          {
            path: '',
            controller: noop as any,
          },
        ],
      ]
      let result = getFlatList(list)

      expect(result instanceof Array).toBeTruthy()
      expect(result.length).toBe(4)
      for (let key in result) {
        expect(result[key] instanceof Array).not.toBeTruthy()
      }
    })
  })
})
