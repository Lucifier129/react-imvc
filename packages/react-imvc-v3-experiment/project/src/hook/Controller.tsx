import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context } from '../../../src/'
import {
  useCtrl,
  useModelActions,
  useModelState,
  useModel,
} from '../../../src/hook'
import * as Model from './Model'

type Actions = Omit<typeof Model, 'initialState'>

class Hook extends Controller<Model.State, Actions> {
  View = RootView
  Model = Model

  constructor(location: Location, context: Context) {
    super(location, context)
  }

  handleUpdate1Click = () => {
    this.store.actions.UPDATE_FOO(this.store.getState().foo + 1)
  }
}

export default Hook

class RootView extends React.Component<{}> {
  render() {
    return <View />
  }
}

function View() {
  let ctrl = useCtrl<Hook>()
  let model = useModel<Model.State, Actions>()
  let actions = useModelActions<Model.State, Actions>()
  let state = useModelState<Model.State>()
  console.log(model)
  const handleUpdate2Click = () => {
    actions.UPDATE_FOO(state.foo + 1)
  }
  return (
    <div id="hook">
      <p id="foo">{ctrl.store.getState().foo}</p>
      <button id="update1" onClick={ctrl.handleUpdate1Click}>
        Update
      </button>
      <button id="update2" onClick={handleUpdate2Click}>
        Update
      </button>
    </div>
  )
}
