import Controller from '../../../src/controller'
import React from 'react'
import { Location, Context } from '../../../src'

export type State = {
  isClient: boolean
  isServer: boolean
}

export default class extends Controller<State, {}> {
  constructor(location: Location, context: Context) {
    super(location, context)
    this.resolveSSRQuery()
  }
  View = View
  initialState = {
    isClient: false,
    isServer: false,
  }

  getInitialState(state: State) {
    if (this.context.isClient) {
      state.isClient = true
    }
    if (this.context.isServer) {
      state.isServer = true
    }
    return state
  }

  resolveSSRQuery() {
    const { SSR } = this.location.query
    if (SSR === '0') {
      this.SSR = false
    }
  }
}

function View({ state }: { state: State }) {
  return (
    <div id="getInitialState">
      <div id="client">{'client:' + state.isClient.toString()}</div>
      <div id="server">{'server:' + state.isServer.toString()}</div>
    </div>
  )
}
