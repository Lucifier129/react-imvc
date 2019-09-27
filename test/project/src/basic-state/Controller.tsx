import { NativeLocation, Context } from '../../../../type'
import Controller from '../../../../controller'
import React from 'react'

export default class extends Controller<{}, {}, typeof View> {
    View = View
    constructor(location: NativeLocation, context: Context) {
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