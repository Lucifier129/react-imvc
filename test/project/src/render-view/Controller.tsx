import React from 'react'
import IMVC from '../../.././../index'
import Controller from '../../../../controller'

const delay = (time: number) => new Promise(resolve => {
  setTimeout(resolve, time)
})

export default class extends Controller<{}, {}> {
  SSR = false
  View = View
  constructor(location: IMVC.Location, context: IMVC.Context) {
    super(location, context)
    if (context.isClient) {
      window.controller = this
    } else if (context.isServer) {
      global.controller = this
    }
  }
  async componentWillCreate() {
    this.renderView(() => <div>{-1}</div>)
    await delay(1000)
  }
  componentDidMount() {
    let count: number = 0
    let View: IMVC.BaseViewFC = () => <div>{count}</div>
    setInterval(() => {
      this.renderView(View)
      count += 1
    }, 1000)
  }
}

function View({ state }: IMVC.ViewProps) {
  return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}
