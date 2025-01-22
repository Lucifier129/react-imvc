/**
 * 共享的 action 函数
 */
import { setValueByPath } from '../util'
import type { Location, Action } from '..'

export const INDENTITY: Action<object> = (state) => state

export const UPDATE_STATE: Action<object, object> = (state, newState) => {
  return {
    ...state,
    ...newState,
  }
}

export const __PAGE_DID_BACK__: Action<object, Location> = (
  state,
  location
) => {
  return {
    ...state,
    location,
  }
}

interface USBPPayload {
  [x: string]: any
}
export const UPDATE_STATE_BY_PATH: Action<object, USBPPayload> = (
  state,
  payload
) => {
  return Object.keys(payload).reduce(
    (state, path) => setValueByPath(state, path, payload[path]),
    state
  )
}

export const UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
