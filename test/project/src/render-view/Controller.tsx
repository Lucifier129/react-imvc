import React from 'react'
import RIMVC from '../../.././../src'

const delay = (time: number) => new Promise(resolve => {
  setTimeout(resolve, time)
})

export default class extends RIMVC.Controller {
  SSR = false
  View = View
  constructor(location, context) {
    super(location, context)
    if (context.isClient) {
      window.controller = this
    } else if (context.isServer) {
      global.controller = this
    }
  }
  async componentWillCreate() {
    this.renderView(() => -1)
    await delay(1000)
  }
  componentDidMount() {
    let count = 0
    let View = () => count
    setInterval(() => {
      this.renderView(View)
      count += 1
    }, 1000)
  }
}

function View({ state }: RIMVC.ViewProps) {
  return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}
