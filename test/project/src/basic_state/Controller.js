import Controller from '../../../../controller'
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
    return <div id="basic_state"></div>
}