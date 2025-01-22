import Controller from '../../../controller'
import React from 'react'

const delay = (time) =>
    new Promise((resolve) => {
        setTimeout(resolve, time)
    })

export default class extends Controller {
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

function View({ state }) {
    return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}
