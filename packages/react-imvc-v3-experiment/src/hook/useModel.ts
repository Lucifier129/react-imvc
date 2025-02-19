import useModelState from './useModelState'
import useModelActions from './useModelActions'

export default function useModel<S extends {}, AS extends {}>() {
  const state = useModelState<S>()
  const actions = useModelActions<S, AS>()
  return [state, actions] as const
}
