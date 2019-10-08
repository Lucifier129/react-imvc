import React from 'react'
import { Location, Context } from '../../../../type'
import Controller from '../../../../controller'

const delay = (time: number) => new Promise(resolve => {
  setTimeout(resolve, time)
})

export default class extends Controller<{}, {}, typeof View> {
  SSR = false
  View = View
  constructor(location: Location, context: Context) {
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
    let View = () => <div>{count}</div>
    setInterval(() => {
      this.renderView(View)
      count += 1
    }, 1000)
  }
}

function View({ state }: { state: object }) {
  return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}
