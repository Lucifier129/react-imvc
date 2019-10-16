/**
 * 共享的 action 函数
 */
import _ from '../util'
import { Location } from '..'

const { setValueByPath } = _

export let INDENTITY = (state: object) => state

export let UPDATE_STATE = (state: object, newState: { }) => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state: object, location: Location) => {
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
