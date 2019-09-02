/**
 * 共享的 action 函数
 */
import _ from '../util'

const { setValueByPath } = _

export let INDENTITY = (state: any) => state

export let UPDATE_STATE = (state: any, newState: any) => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state: any, location: any) => {
  return {
    ...state,
    location,
  }
}

export let UPDATE_STATE_BY_PATH = (state: any, payload: { [x: string]: any; }) => {
	return Object.keys(payload).reduce(
		(state, path) => setValueByPath(state, path, payload[path]),
		state
	)
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
