/**
 * 共享的 action 函数
 */
import _ from '../util'
import RIMVC from '../index'

const { setValueByPath } = _

export let INDENTITY = (state: RIMVC.State) => state

export let UPDATE_STATE = (state: RIMVC.State, newState: RIMVC.State): RIMVC.State => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state: RIMVC.State, location: Partial<RIMVC.Location>): RIMVC.State => {
  return {
    ...state,
    location,
  }
}

export let UPDATE_STATE_BY_PATH = (state: RIMVC.State, payload: RIMVC.Payload) => {
	return Object.keys(payload).reduce(
		(state, path) => setValueByPath(state, path, payload[path]),
		state
	)
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
