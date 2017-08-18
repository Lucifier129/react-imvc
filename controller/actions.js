/**
 * 共享的 action 函数
 */
import _ from '../util'

const { setValueByPath } = _

export let INDENTITY = state => state

export let UPDATE_STATE = (state, newState) => {
  return {
    ...state,
    ...newState
  }
}

export let UPDATE_STATE_BY_PATH = (state, payload) => {
	return Object.keys(payload).reduce(
		(state, path) => setValueByPath(state, path, payload[path]),
		state
	)
}
