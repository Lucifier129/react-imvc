import createApp from '../../create-app/src/client'

export default {
  toJSON,
  toText,
  timeoutReject,
  isAbsoluteUrl,
  mapValues,
  isThenable,
  setValueByPath,
  getValueByPath,
  getFlatList
}


type RouteList = createApp.Route[]
type inputList = RouteList | RouteList[]

function getFlatList(list: inputList): RouteList {
  let result: RouteList = []
  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    if (Array.isArray(item)) {
      result = result.concat(getFlatList(item))
    } else {
      result.push(item)
    }
  }
  return result
}

interface FetchResponse {
  ok: boolean
  status: number
  statusText: string
  json: () => Promise<object>
  text: () => Promise<string>
}

function toJSON(response: FetchResponse): Promise<object> {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText))
  }
  return response.json()
}

function toText(response: FetchResponse): Promise<string> {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText))
  }
  return response.text()
}

function timeoutReject(promise: Promise<any>, time = 0, errorMsg: any): Promise<any> {
  let timeoutReject = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMsg || `Timeout Error:${time}ms`)), time)
  })
  return Promise.race([promise, timeoutReject])
}

function isAbsoluteUrl(url: string) {
  return url.indexOf('http') === 0 || url.indexOf('//') === 0
}

type mapFunction = (value: any, key: string) => any
type anyObject = { [key: string]: any }

function mapValues(obj: anyObject, fn: mapFunction): anyObject {
  return Object.keys(obj).reduce(
    (result, key) => {
      result[key] = fn(obj[key], key)
      return result
    },
    {} as anyObject
  )
}

function isThenable(obj: any) {
  return obj != null && typeof obj.then === 'function'
}

const path_separator_regexp = /\.|\/|:/
const getPath = (path: string | string[]) => {
  if (Array.isArray(path)) return path
  return path.split(path_separator_regexp)
}

interface objectOrArray {
  [key: string]: any
  [key: number]: any
}

type setValue = (
  obj: objectOrArray,
  keys: string[],
  value: any
) => objectOrArray

const setValue: setValue = (obj, [key, ...rest], value) => {
  obj = Array.isArray(obj)
    ? obj.concat()
    : Object.assign({} as { [key: string]: any }, obj)

  obj[key] = rest.length > 0 ? setValue(obj[key], rest, value) : value

  return obj
}

function setValueByPath(
  obj: objectOrArray,
  path: string | string[],
  value: any
): objectOrArray {
  return setValue(obj, getPath(path), value)
}

type getValue = (ret: objectOrArray, key: string | number) => any
const getValue: getValue = (ret, key) => ret[key]

function getValueByPath(obj: objectOrArray, path: string | string[]): any {
  return getPath(path).reduce(getValue, obj)
}