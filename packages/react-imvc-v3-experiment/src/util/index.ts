import type { Route } from 'create-app/client'
import type Controller from '../controller'

export type RouteList = Route[]
export type inputList = (Route | RouteList)[]

export function getFlatList(list: inputList): RouteList {
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

export interface FetchResponse {
  ok: boolean
  status: number
  statusText: string
  json: () => Promise<object>
  text: () => Promise<string>
}

export function toJSON(response: FetchResponse): Promise<object> {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText))
  }
  return response.json()
}

export function toText(response: FetchResponse): Promise<string> {
  // 如果 response 状态异常，抛出错误
  if (!response.ok || response.status !== 200) {
    return Promise.reject(new Error(response.statusText))
  }
  return response.text()
}

export function timeoutReject(
  promise: Promise<any>,
  time = 0,
  errorMsg?: string
): Promise<any> {
  let timeoutReject = new Promise((_, reject) => {
    let err = new Error(errorMsg || `Timeout Error:${time}ms`)
    setTimeout(() => reject(err), time)
  })
  return Promise.race([promise, timeoutReject])
}

export function isAbsoluteUrl(url: string) {
  return url.indexOf('http') === 0 || url.indexOf('//') === 0
}

export type mapFunction = (value: any, key: string) => any
export type anyObject = { [key: string]: any }

export function mapValues(obj: anyObject, fn: mapFunction): anyObject {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key)
    return result
  }, {} as anyObject)
}

export function isThenable(obj: any) {
  return obj != null && typeof obj.then === 'function'
}

const PATH_SEPARATOR_REGEXP = /\.|\/|:/
export function getPath(path: string | string[]): string[] {
  if (Array.isArray(path)) return path
  return path.split(PATH_SEPARATOR_REGEXP)
}

export interface ObjectOrArray {
  [key: string]: unknown
}

export function setValue(
  obj: any,
  [key, ...rest]: string[],
  value: unknown
): any {
  obj = Array.isArray(obj) ? obj.concat() : Object.assign({}, obj)

  // @ts-ignore
  obj[key] = rest.length > 0 ? setValue(obj[key], rest, value) : value

  return obj
}

export function setValueByPath(
  obj: any,
  path: string | string[],
  value: any
): any {
  return setValue(obj, getPath(path), value)
}

export function getValue(ret: any, key: string | number): any {
  return ret[key]
}

export function getValueByPath(obj: any, path: string | string[]): any {
  return getPath(path).reduce(getValue, obj)
}

export function getKeys<T extends {}>(o: T): Array<keyof T> {
  return Object.keys(o) as Array<keyof T>
}

export function ab2str(buf: Uint8Array): string {
  return String.fromCharCode.apply(null, Array.from(new Uint16Array(buf)))
}

export function stringToUnit8Array(str: string): Uint8Array {
  let arr = []
  for (let i = 0, j = str.length; i < j; ++i) {
    arr.push(str.charCodeAt(i))
  }

  let tmpUint8Array = new Uint8Array(arr)
  return tmpUint8Array
}

export function isAbsolutePath(path: string): boolean {
  return path[0] !== '.'
}

export function getClearFilePath(
  filepath: string,
  extensions: string[] = ['js']
): string {
  function replacer(
    match: string,
    p1: string,
    p2: string,
    offset: number,
    str: string
  ) {
    if (extensions.includes(p2)) {
      return p1
    } else {
      return str
    }
  }
  return filepath.replace(/^(.*)\.([a-zA-Z]{1,5})$/, replacer)
}

export function compareObject(a: object, b: object): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function isIMVCController(fn: any): fn is Controller<any, any> {
  return fn.__SYMBOL === 'REACT_IMVC_CONTROLLER'
}

export function debounce<T>(func: (data: T) => unknown, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  let currentFn: (() => void) | undefined
  const flush = () => {
    clearTimeout(timeout)
    currentFn?.()
    currentFn = undefined
  }
  const debouncedFn = function (data: T) {
    currentFn = () => {
      func(data)
    }
    timeout = setTimeout(flush, wait)
  }

  debouncedFn.flush = flush

  return debouncedFn
}
