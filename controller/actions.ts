/**
 * 共享的 action 函数
 */
import _ from '../util'
import IMVC from '../index'

const { setValueByPath } = _

export let INDENTITY = (state: IMVC.State) => state

export let UPDATE_STATE = (state: IMVC.State, newState: IMVC.State): IMVC.State => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state: IMVC.State, location: Partial<IMVC.Location>): IMVC.State => {
  return {
    ...state,
    location,
  }
}

export let UPDATE_STATE_BY_PATH = (state: IMVC.State, payload: IMVC.Payload) => {
	return Object.keys(payload).reduce(
		(state, path) => setValueByPath(state, path, payload[path]),
		state
	)
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
