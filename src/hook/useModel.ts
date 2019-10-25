import { Actions } from 'relite'
import { BaseState } from '..'
import useModelState from './useModelState'
import useModelActions from './useModelActions'

export default function useModel<S extends BaseState, AS extends Actions<S>>() {
  let state = useModelState<S>()
  let actions = useModelActions<S, AS>()
  return [state, actions]
}
