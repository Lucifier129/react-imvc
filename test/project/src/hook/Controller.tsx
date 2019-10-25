import Controller from '../../../../src/controller'
import React from 'react'
import { Location, Context, BaseState } from '../../../../src/'
import { useCtrl } from '../../../../src/hook'

export type State = BaseState & {
  foo: string
}

let initialState = {
  foo: 'Hello World'
}

export default class extends Controller<typeof initialState, {}> {
  // SSR = true // enable server side rendering
  initialState = initialState
	View = RootView
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

class RootView extends React.Component<{}> {
  render() {
    return <View />
  }
}

function View() {
  let ctrl = useCtrl<{}, State, {}>()
	return <div id="hook">{ctrl.store.getState().foo}</div>
}
