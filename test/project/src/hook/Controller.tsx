import Controller from '../../../../src/controller'
import React, { useState } from 'react'
import { Location, Context } from '../../../../src/type'
import { useCtrl, useModel, useModelActions, useModelState } from '../../../../src/hook'

let initialState = {
  foo: 'Hello World'
}

export default class extends Controller<typeof initialState, {}, typeof RootView> {
  // SSR = true // enable server side rendering
  SSR = true
  initialState = initialState
	View = RootView
  constructor(location: Location, context: Context) {
    super(location, context)
  }
}

class RootView extends React.Component {
  render() {
    return <View />
  }
}

function View() {
  let [state, setState] = useState(0)
  // let ctrl = useCtrl()
  
	return <div id="hook">hook {state}</div>
}
