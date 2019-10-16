/**
 * 共享的 action 函数
 */
import _ from '../util'
import { Location, BaseState } from '..'

const { setValueByPath } = _

export let INDENTITY = (state: BaseState) => state

export let UPDATE_STATE = (state: BaseState, newState: { }) => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state: BaseState, location: Location) => {
  return {
    ...state,
    location
  }
}

export let UPDATE_STATE_BY_PATH = (state: BaseState, payload: { [x: string]: any }) => {
  return Object.keys(payload).reduce(
    (state, path) => setValueByPath(state, path, payload[path]),
    state
  )
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
