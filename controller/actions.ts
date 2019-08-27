/**
 * 共享的 action 函数
 */
import _ from '../util'
import IMVC from '../index'

const { setValueByPath } = _

export let INDENTITY: IMVC.Action = (state) => state

export let UPDATE_STATE: IMVC.Action = (state, newState) => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__: IMVC.Action = (state, location) => {
  return {
    ...state,
    location,
  }
}

export let UPDATE_STATE_BY_PATH: IMVC.Action = (state, payload) => {
	return Object.keys(payload).reduce(
		(state, path) => setValueByPath(state, path, payload[path]),
		state
	)
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
