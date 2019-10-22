import Controller from '../../../../src/controller'
import React from 'react'
import { Location, Context, ViewProps } from '../../../../src/'
import { useCtrl } from '../../../../src/hook'

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

class RootView extends React.Component<ViewProps<{}, {}>> {
  render() {
    return <View />
  }
}

function View() {
  let ctrl = useCtrl()
	return <div id="hook">{ctrl.initialState.foo}</div>
}
