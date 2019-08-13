import React from 'react'
import RIMVC from '../../.././../src'

const delay = (time: number) => new Promise(resolve => {
  setTimeout(resolve, time)
})

export default class extends RIMVC.Controller {
  SSR = false
  View = View
  constructor(location: RIMVC.Location, context: RIMVC.Context) {
    super(location, context)
    if (context.isClient) {
      (window as RIMVC.WindowNative).controller = this
    } else if (context.isServer) {
      (global as RIMVC.Global).controller = this
    }
  }
  async componentWillCreate() {
    this.renderView(() => <div>{-1}</div>)
    await delay(1000)
  }
  componentDidMount() {
    let count: number = 0
    let View: RIMVC.BaseViewFC = () => <div>{count}</div>
    setInterval(() => {
      this.renderView(View)
      count += 1
    }, 1000)
  }
}

function View({ state }: RIMVC.ViewProps) {
  return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}
