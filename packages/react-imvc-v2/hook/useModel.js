import useModelState from './useModelState'
import useModelActions from './useModelActions'

export default () => {
    let state = useModelState()
    let actions = useModelActions()
    return [state, actions]
}
