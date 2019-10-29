import useModelState from './useModelState'
import useModelActions from './useModelActions'
import Controller from '../controller/index'

export default function useModel<Ctrl extends Controller<any, any>>() {
  let state = useModelState<Ctrl>()
  let actions = useModelActions<Ctrl>()
  return [state, actions] as const
}
