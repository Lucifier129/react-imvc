import useModelState from './useModelState'
import useModelActions from './useModelActions'
import { State, Actions } from '../controller/types'

export default () => {
  let state:State = useModelState()
  let actions:Actions = useModelActions()
  return [state, actions]
}
