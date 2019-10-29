import Controller from '../../../../src/controller'
import React from 'react'
import { Location, Context, BaseState } from '../../../../src/'
import { useCtrl, useModelActions } from '../../../../src/hook'

export type State = BaseState & {
  foo: string
}

let initialState = {
  foo: 'Hello World'
}

class Hook extends Controller<State, {}> {
  // SSR = true // enable server side rendering
  initialState = initialState
	View = RootView
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

export default Hook

class RootView extends React.Component<{}> {
  render() {
    return <View />
  }
}

function View() {
  let ctrl = useCtrl<{}, State, {}>()
  let actions = useModelActions<State, {}>()
  console.log(actions)
	return <div id="hook">{ctrl.store.getState().foo}</div>
}
