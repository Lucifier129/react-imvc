/**
 * 共享的 action 函数
 */

export let INDENTITY = state => state

export let UPDATE_STATE = (state, newState) => {
  return {
    ...state,
    ...newState
  }
}

export let UPDATE_INPUT_VALUE = UPDATE_STATE
