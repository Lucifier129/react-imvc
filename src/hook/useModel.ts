import useModelState from './useModelState'
import useModelActions from './useModelActions'

export default function useModel<S extends {}, AS extends {}>() {
  let state = useModelState<S, AS>()
  let actions = useModelActions<S, AS>()
  return [state, actions] as const
}
