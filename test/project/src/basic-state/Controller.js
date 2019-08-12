import Controller from '../../../../src/controller'
import React from 'react'

export default class extends Controller {
    View = View;
    constructor(location, context) {
        super(location, context)
        if (context.isClient) {
            window.controller = this
        } else if (context.isServer) {
            global.controller = this
        }
    }
}


function View({ state }) {
    return <pre id="basic_state">{JSON.stringify(state, null, 2)}</pre>
}