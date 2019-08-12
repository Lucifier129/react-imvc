/**
 * 共享的 action 函数
 */
import _ from '../util'
import { State, Payload, Location } from './types'

const { setValueByPath } = _

export let INDENTITY = (state:State) => state

export let UPDATE_STATE = (state:State, newState:State):State => {
  return {
    ...state,
    ...newState
  }
}

export let __PAGE_DID_BACK__ = (state:State, location:Location): State => {
  return {
    ...state,
    location,
  }
}

export let UPDATE_STATE_BY_PATH = (state:State, payload:Payload) => {
	return Object.keys(payload).reduce(
		(state, path) => setValueByPath(state, path, payload[path]),
		state
	)
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE_BY_PATH
