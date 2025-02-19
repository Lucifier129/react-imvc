import { BaseState, Action } from '../../../src'

export type State = BaseState & {
  foo: number
}

export const initialState = {
  foo: 0,
}

export const UPDATE_FOO: Action<State, number> = (state, foo) => {
  return {
    ...state,
    foo,
  }
}
