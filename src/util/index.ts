import { Route } from 'create-app/client'

export default {
  toJSON,
  toText,
  timeoutReject,
  isAbsoluteUrl,
  mapValues,
  isThenable,
  setValueByPath,
  getValueByPath,
  getFlatList,
  ab2str,
  str2ab,
  getKeys
}

export type RouteList = Route[]
export type inputList = (Route | RouteList)[]

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

export interface FetchResponse {
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

export type mapFunction = (value: any, key: string) => any
export type anyObject = { [key: string]: any }

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

const PATH_SEPARATOR_REGEXP = /\.|\/|:/
function getPath(path: string | string[]): string[] {
  if (Array.isArray(path)) return path
  return path.split(PATH_SEPARATOR_REGEXP)
}

export interface ObjectOrArray {
  [key: string]: any
  [key: number]: any
}

function setValue(
  obj: ObjectOrArray,
  [key, ...rest]: string[],
  value: any
): ObjectOrArray {
  obj = Array.isArray(obj)
    ? obj.concat()
    : Object.assign({} as { [key: string]: any }, obj)

  obj[key] = rest.length > 0 ? setValue(obj[key], rest, value) : value

  return obj
}

function setValueByPath(
  obj: ObjectOrArray,
  path: string | string[],
  value: any
): ObjectOrArray {
  return setValue(obj, getPath(path), value)
}

function getValue(
  ret: ObjectOrArray,
  key: string | number
): any{
  return ret[key]
}

function getValueByPath(
  obj: ObjectOrArray,
  path: string | string[]
): any {
  return getPath(path).reduce(getValue, obj)
}

export function getKeys<T extends {}>(o: T): Array<keyof T>{
  return Object.keys(o) as Array<keyof T>
} 

export function ab2str(buf: Uint8Array): string {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

export function str2ab(str: string): ArrayBuffer {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}