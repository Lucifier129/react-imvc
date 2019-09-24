/**
 * 共享的 action 函数
 */
import _ from '../util'
import { NativeLocation } from '../type'

const { setValueByPath } = _

export let INDENTITY = (state: object) => state

export let UPDATE_STATE = (state: object, newState: object) => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state: object, location: NativeLocation) => {
  return {
    ...state,
    location
  }
}

export let UPDATE_STATE_BY_PATH = (state: object, payload: { [x: string]: any }) => {
  return Object.keys(payload).reduce(
    (state, path) => setValueByPath(state, path, payload[path]),
    state
  )
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
